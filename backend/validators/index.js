const Joi = require("joi");

const uuid = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });
const isoDate = Joi.string().isoDate();
const strict = (schema) =>
  schema.options({ abortEarly: false, allowUnknown: false, convert: true });

const clientCreateSchema = strict(
  Joi.object({
    id: uuid.optional(),
    nombre: Joi.string().trim().min(2).max(150).required(),
    telefono: Joi.string().trim().min(5).max(30).required(),
    direccion: Joi.string().trim().max(255).allow(null, "").optional(),
  }),
);
const clientUpdateSchema = strict(
  Joi.object({
    nombre: Joi.string().trim().min(2).max(150),
    telefono: Joi.string().trim().min(5).max(30),
    direccion: Joi.string().trim().max(255).allow(null, ""),
  }).min(1),
);
const clientParamsSchema = strict(Joi.object({ id: uuid.required() }));
const clientListQuerySchema = strict(
  Joi.object({
    includeArchived: Joi.boolean()
      .truthy("true", "1", "yes", "on")
      .falsy("false", "0", "no", "off")
      .optional(),
    q: Joi.string().trim().max(150).optional(),
  }),
);
const measurementValueSchema = strict(
  Joi.object({
    id: uuid.optional(),
    definition_id: uuid.required(),
    value: Joi.number().positive().required(),
  }),
);
const createMeasurementSchema = strict(
  Joi.object({
    id: uuid.optional(),
    cliente_id: uuid.required(),
    fecha: isoDate.optional(),
    scope: Joi.string().valid("superior", "inferior").required(),
    values: Joi.array().items(measurementValueSchema).min(1).required(),
  }),
);
const measurementClientParamsSchema = strict(
  Joi.object({ clienteId: uuid.required() }),
);
const orderCreateSchema = strict(
  Joi.object({
    id: uuid.optional(),
    cliente_id: uuid.required(),
    tipo_prenda: Joi.string().trim().min(2).max(120).required(),
    descripcion: Joi.string().trim().max(2000).allow(null, "").optional(),
    fecha_entrega: isoDate.optional(),
    precio_total: Joi.number().min(0).required(),
  }),
);
const orderUpdateStatusSchema = strict(
  Joi.object({
    estado: Joi.string()
      .valid("pendiente", "proceso", "terminado", "entregado")
      .required(),
  }),
);
const orderParamsSchema = strict(Joi.object({ id: uuid.required() }));
const orderListQuerySchema = strict(
  Joi.object({
    estado: Joi.string()
      .valid("pendiente", "proceso", "terminado", "entregado")
      .optional(),
    clienteId: uuid.optional(),
  }),
);
const paymentCreateSchema = strict(
  Joi.object({
    id: uuid.optional(),
    order_id: uuid.required(),
    fecha: isoDate.optional(),
    monto: Joi.number().positive().required(),
    metodo: Joi.string().trim().min(2).max(50).required(),
  }),
);
const paymentOrderParamsSchema = strict(
  Joi.object({ orderId: uuid.required() }),
);

module.exports = {
  clientCreateSchema,
  clientUpdateSchema,
  clientParamsSchema,
  clientListQuerySchema,
  createMeasurementSchema,
  measurementClientParamsSchema,
  orderCreateSchema,
  orderUpdateStatusSchema,
  orderParamsSchema,
  orderListQuerySchema,
  paymentCreateSchema,
  paymentOrderParamsSchema,
};
