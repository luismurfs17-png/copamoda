async function insertPayment(trx, data) {
  await trx("payments").insert(data);
  return data;
}

async function listPaymentsByOrder(trx, orderId) {
  return trx("payments")
    .select("id", "order_id", "fecha", "monto", "metodo")
    .where({ order_id: orderId })
    .orderBy("fecha", "asc");
}

async function findPaymentById(trx, id) {
  return trx("payments")
    .select("id", "order_id", "fecha", "monto", "metodo")
    .where({ id })
    .first();
}

async function sumPaymentsByOrder(trx, orderId) {
  const row = await trx("payments")
    .where({ order_id: orderId })
    .sum({ total: "monto" })
    .first();

  return row && row.total ? Number(row.total) : 0;
}

module.exports = {
  insertPayment,
  listPaymentsByOrder,
  findPaymentById,
  sumPaymentsByOrder,
};
