const orderService = require("../services/orderService");
const { sendSuccess } = require("../utils/response");

async function create(req, res) {
  const order = await orderService.createOrder(req.body);
  return sendSuccess(res, order, "Pedido creado", 201);
}

async function list(req, res) {
  const orders = await orderService.listOrders(req.query);
  return sendSuccess(res, orders, "Pedidos cargados");
}

async function updateStatus(req, res) {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.estado,
  );
  return sendSuccess(res, order, "Estado del pedido actualizado");
}

module.exports = {
  create,
  list,
  updateStatus,
};
