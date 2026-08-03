const paymentService = require("../services/paymentService");
const { sendSuccess } = require("../utils/response");

async function create(req, res) {
  const payment = await paymentService.createPayment(req.body);
  return sendSuccess(res, payment, "Pago registrado", 201);
}

async function listByOrder(req, res) {
  const data = await paymentService.getPaymentsByOrder(req.params.orderId);
  return sendSuccess(res, data, "Pagos cargados");
}

module.exports = {
  create,
  listByOrder,
};
