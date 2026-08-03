async function insertClient(trx, data) {
  await trx("clientes").insert(data);
  return data;
}

async function findClientById(trx, id) {
  return trx("clientes").where({ id }).first();
}

async function listClients(trx, { includeArchived = false, q = null } = {}) {
  const query = trx("clientes")
    .select(
      "id",
      "nombre",
      "telefono",
      "direccion",
      "fecha_creacion",
      "archived_at",
    )
    .orderBy("nombre", "asc");

  if (!includeArchived) {
    query.whereNull("archived_at");
  }

  if (q) {
    query.andWhere(function searchGroup() {
      this.where("nombre", "like", `%${q}%`).orWhere(
        "telefono",
        "like",
        `%${q}%`,
      );
    });
  }

  return query;
}

async function updateClient(trx, id, data) {
  return trx("clientes").where({ id }).update(data);
}

module.exports = {
  insertClient,
  findClientById,
  listClients,
  updateClient,
};
