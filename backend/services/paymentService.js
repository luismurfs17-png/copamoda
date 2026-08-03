const { db } = require("../config/db");
const { AppError } = require("../utils/appError");
const { useUuid } = require("../utils/uuid");
const { toDbDateTime, normalizeDbNumber } = require("../utils/date");
const orderModel = require("../models/orderModel");
const paymentModel = require("../models/paymentModel");

function mapPaymentRow(row) {
  return {
    id: row.id,
    order_id: row.order_id,
    fecha: row.fecha,
    monto: normalizeDbNumber(row.monto),
    metodo: row.metodo,
  };
}

async function createPayment(payload) {
  return db.transaction(async (trx) => {
    const order = await orderModel.findOrderById(trx, payload.order_id);

    if (!order) {
      throw new AppError("Pedido no encontrado", 404);
    }

    const paid = await paymentModel.sumPaymentsByOrder(trx, payload.order_id);
    const total = normalizeDbNumber(order.precio_total);
    const remaining = total - paid;
    const amount = normalizeDbNumber(payload.monto);

    if (amount > remaining) {
      throw new AppError("El pago excede el saldo disponible", 400);
    }

    const paymentId = useUuid(payload.id);
    const fecha = payload.fecha ? toDbDateTime(payload.fecha) : undefined;

    if (payload.fecha && !fecha) {
      throw new AppError("Fecha de pago invalida", 400);
    }

    const paymentData = {
      id: paymentId,
      order_id: payload.order_id,
      monto: amount,
      metodo: payload.metodo.trim(),
    };

    if (fecha) {
      paymentData.fecha = fecha;
    }

    await paymentModel.insertPayment(trx, paymentData);

    const newSaldo = remaining - amount;
    await orderModel.updateOrderSaldo(trx, payload.order_id, newSaldo);

    const createdPayment = await paymentModel.findPaymentById(trx, paymentId);
    return mapPaymentRow(createdPayment);
  });
}

async function getPaymentsByOrder(orderId) {
  const order = await orderModel.findOrderById(db, orderId);

  if (!order) {
    throw new AppError("Pedido no encontrado", 404);
  }

  const payments = await paymentModel.listPaymentsByOrder(db, orderId);
  const totalPaid = await paymentModel.sumPaymentsByOrder(db, orderId);

  return {
    order: {
      id: order.id,
      order_number: order.order_number,
      cliente_id: order.cliente_id,
      cliente_nombre: order.cliente_nombre,
      cliente_telefono: order.cliente_telefono,
      precio_total: normalizeDbNumber(order.precio_total),
      saldo: normalizeDbNumber(order.saldo),
    },
    total_paid: normalizeDbNumber(totalPaid),
    payments: payments.map(mapPaymentRow),
  };
}

module.exports = {
  createPayment,
  getPaymentsByOrder,
};
