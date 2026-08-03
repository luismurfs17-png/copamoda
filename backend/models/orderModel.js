async function insertOrder(trx, data) {
  await trx("orders").insert(data);
  return data;
}

async function findOrderById(trx, id) {
  return trx("orders as o")
    .join("clientes as c", "c.id", "o.cliente_id")
    .select(
      "o.id",
      "o.cliente_id",
      "o.order_number",
      "o.tipo_prenda",
      "o.descripcion",
      "o.fecha_creacion",
      "o.fecha_entrega",
      "o.estado",
      "o.precio_total",
      "o.saldo",
      "c.nombre as cliente_nombre",
      "c.telefono as cliente_telefono",
      "c.archived_at as cliente_archived_at",
    )
    .where("o.id", id)
    .first();
}

async function findOrders(trx, { estado = null, clienteId = null } = {}) {
  const query = trx("orders as o")
    .join("clientes as c", "c.id", "o.cliente_id")
    .select(
      "o.id",
      "o.cliente_id",
      "o.order_number",
      "o.tipo_prenda",
      "o.descripcion",
      "o.fecha_creacion",
      "o.fecha_entrega",
      "o.estado",
      "o.precio_total",
      "o.saldo",
      "c.nombre as cliente_nombre",
      "c.telefono as cliente_telefono",
      "c.archived_at as cliente_archived_at",
      trx.raw(
        "COALESCE((SELECT SUM(p.monto) FROM payments p WHERE p.order_id = o.id), 0) as pagado",
      ),
    )
    .orderBy("o.fecha_creacion", "desc");

  if (estado) {
    query.where("o.estado", estado);
  }

  if (clienteId) {
    query.andWhere("o.cliente_id", clienteId);
  }

  return query;
}

async function updateOrderStatus(trx, id, estado) {
  return trx("orders").where({ id }).update({ estado });
}

async function updateOrderSaldo(trx, id, saldo) {
  return trx("orders").where({ id }).update({ saldo });
}

module.exports = {
  insertOrder,
  findOrderById,
  findOrders,
  updateOrderStatus,
  updateOrderSaldo,
};
