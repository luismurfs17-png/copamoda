async function generateOrderNumber(trx) {
  const year = new Date().getFullYear();

  // La fila queda bloqueada por la transaccion en MySQL; SQLite serializa la escritura.
  await trx("order_counters")
    .insert({ year, corr_actual: 0 })
    .onConflict("year")
    .ignore();

  const counter = await trx("order_counters")
    .where({ year })
    .forUpdate()
    .first();
  const next = Number(counter.corr_actual) + 1;

  await trx("order_counters").where({ year }).update({ corr_actual: next });

  return `${year}-${String(next).padStart(4, "0")}`;
}

module.exports = { generateOrderNumber };
