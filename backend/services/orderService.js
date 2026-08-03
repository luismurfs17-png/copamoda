const { db } = require("../config/db");
const { AppError } = require("../utils/appError");
const { useUuid } = require("../utils/uuid");
const { toDbDateTime, normalizeDbNumber } = require("../utils/date");
const { generateOrderNumber } = require("../utils/orderNumber");
const clientModel = require("../models/clientModel");
const orderModel = require("../models/orderModel");

function mapOrderRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    cliente_id: row.cliente_id,
    order_number: row.order_number,
    tipo_prenda: row.tipo_prenda,
    descripcion: row.descripcion,
    fecha_creacion: row.fecha_creacion,
    fecha_entrega: row.fecha_entrega,
    estado: row.estado,
    precio_total: normalizeDbNumber(row.precio_total),
    saldo: normalizeDbNumber(row.saldo),
    pagado: normalizeDbNumber(row.pagado),
    cliente: {
      id: row.cliente_id,
      nombre: row.cliente_nombre,
      telefono: row.cliente_telefono,
      archived_at: row.cliente_archived_at,
    },
  };
}

async function createOrder(payload) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await db.transaction(async (trx) => {
        const client = await clientModel.findClientById(
          trx,
          payload.cliente_id,
        );

        if (!client) {
          throw new AppError("Cliente no encontrado", 404);
        }

        if (client.archived_at) {
          throw new AppError(
            "No se pueden crear pedidos para un cliente archivado",
            400,
          );
        }

        const orderId = useUuid(payload.id);
        const orderNumber = await generateOrderNumber(trx);
        const fechaEntrega = payload.fecha_entrega
          ? toDbDateTime(payload.fecha_entrega)
          : null;

        if (payload.fecha_entrega && !fechaEntrega) {
          throw new AppError("Fecha de entrega invalida", 400);
        }

        const orderData = {
          id: orderId,
          cliente_id: payload.cliente_id,
          order_number: orderNumber,
          tipo_prenda: payload.tipo_prenda.trim(),
          descripcion: payload.descripcion ? payload.descripcion.trim() : null,
          estado: "pendiente",
          precio_total: payload.precio_total,
          saldo: payload.precio_total,
        };

        if (fechaEntrega) {
          orderData.fecha_entrega = fechaEntrega;
        }

        await orderModel.insertOrder(trx, orderData);

        const order = await orderModel.findOrderById(trx, orderId);
        return mapOrderRow(order);
      });
    } catch (error) {
      const duplicate =
        error.code === "SQLITE_CONSTRAINT" || error.code === "ER_DUP_ENTRY";
      if (duplicate && attempt < 3) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("No se pudo generar un order_number unico", 500);
}

async function listOrders(filters) {
  const rows = await orderModel.findOrders(db, filters);
  return rows.map(mapOrderRow);
}

async function updateOrderStatus(id, estado) {
  const affected = await orderModel.updateOrderStatus(db, id, estado);

  if (!affected) {
    throw new AppError("Pedido no encontrado", 404);
  }

  const order = await orderModel.findOrderById(db, id);
  return mapOrderRow(order);
}

module.exports = {
  createOrder,
  listOrders,
  updateOrderStatus,
};
