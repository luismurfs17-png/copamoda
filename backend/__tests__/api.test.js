process.env.NODE_ENV = "test";
process.env.DB_CLIENT = "sqlite3";
process.env.SQLITE_FILENAME = ":memory:";

const request = require("supertest");
const app = require("../app");
const { db } = require("../config/db");

const clientId = "550e8400-e29b-41d4-a716-446655440000";
const measurementId = "660e8400-e29b-41d4-a716-446655440000";
const orderId = "770e8400-e29b-41d4-a716-446655440000";
const paymentId = "880e8400-e29b-41d4-a716-446655440000";

beforeAll(async () => {
  await db.migrate.latest({
    directory: require("path").join(__dirname, "..", "migrations"),
  });
  await db.seed.run({
    directory: require("path").join(__dirname, "..", "seeds"),
  });
});

afterAll(async () => {
  await db.destroy();
});

test("POST /clientes crea cliente", async () => {
  const response = await request(app).post("/clientes").send({
    id: clientId,
    nombre: "Ana Perez",
    telefono: "5551234567",
    direccion: "Centro",
  });

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.data.id).toBe(clientId);
});

test("GET /clientes lista clientes", async () => {
  const response = await request(app).get("/clientes");
  expect(response.status).toBe(200);
  expect(response.body.data).toHaveLength(1);
});

test("POST y GET /measurements gestionan medidas", async () => {
  const definition = await db("measurement_definitions")
    .where({ scope: "superior" })
    .first();
  const create = await request(app)
    .post("/measurements")
    .send({
      id: measurementId,
      cliente_id: clientId,
      scope: "superior",
      values: [{ definition_id: definition.id, value: 90 }],
    });

  expect(create.status).toBe(201);
  const list = await request(app).get(`/measurements/${clientId}`);
  expect(list.status).toBe(200);
  expect(list.body.data.records[0].values[0].abbreviation).toBe(
    definition.abbreviation,
  );
});

test("POST /orders crea pedido con order_number y saldo inicial", async () => {
  const response = await request(app).post("/orders").send({
    id: orderId,
    cliente_id: clientId,
    tipo_prenda: "Vestido",
    precio_total: 1200,
  });

  expect(response.status).toBe(201);
  expect(response.body.data.order_number).toMatch(/^\d{4}-\d{4}$/);
  expect(response.body.data.saldo).toBe(1200);
});

test("GET y PUT /orders funcionan", async () => {
  const list = await request(app).get("/orders");
  expect(list.status).toBe(200);
  expect(list.body.data).toHaveLength(1);

  const update = await request(app)
    .put(`/orders/${orderId}`)
    .send({ estado: "proceso" });
  expect(update.status).toBe(200);
  expect(update.body.data.estado).toBe("proceso");
});

test("POST /payments impide exceder y actualiza saldo", async () => {
  const response = await request(app).post("/payments").send({
    id: paymentId,
    order_id: orderId,
    monto: 300,
    metodo: "efectivo",
  });

  expect(response.status).toBe(201);
  const payments = await request(app).get(`/payments/${orderId}`);
  expect(payments.status).toBe(200);
  expect(payments.body.data.total_paid).toBe(300);
  expect(payments.body.data.order.saldo).toBe(900);

  const excessive = await request(app).post("/payments").send({
    order_id: orderId,
    monto: 901,
    metodo: "efectivo",
  });
  expect(excessive.status).toBe(400);
  expect(excessive.body).toEqual({
    success: false,
    message: "El pago excede el saldo disponible",
    data: null,
  });
});

test("PUT y PATCH /clientes actualizan y archivan sin borrar", async () => {
  const update = await request(app).put(`/clientes/${clientId}`).send({
    nombre: "Ana Perez Actualizada",
  });
  expect(update.status).toBe(200);
  expect(update.body.data.nombre).toBe("Ana Perez Actualizada");

  const archive = await request(app).patch(`/clientes/${clientId}/archive`);
  expect(archive.status).toBe(200);
  expect(archive.body.data.archived_at).not.toBeNull();

  const archived = await db("clientes").where({ id: clientId }).first();
  expect(archived).toBeTruthy();
});
