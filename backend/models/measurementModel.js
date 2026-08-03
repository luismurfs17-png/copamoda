async function insertRecord(trx, data) {
  await trx("measurement_records").insert(data);
  return data;
}

async function insertValues(trx, values) {
  await trx("measurement_values").insert(values);
  return values;
}

async function findRecordById(trx, id) {
  return trx("measurement_records").where({ id }).first();
}

async function findMeasurementRowsByClient(trx, clienteId) {
  return trx("measurement_records as mr")
    .leftJoin("measurement_values as mv", "mv.record_id", "mr.id")
    .leftJoin("measurement_definitions as md", "md.id", "mv.definition_id")
    .select(
      "mr.id as record_id",
      "mr.cliente_id",
      "mr.fecha as record_fecha",
      "mr.scope as record_scope",
      "mv.id as value_id",
      "mv.value",
      "md.id as definition_id",
      "md.name",
      "md.abbreviation",
      "md.display_order",
      "md.scope as definition_scope",
    )
    .where("mr.cliente_id", clienteId)
    .orderBy([
      { column: "mr.fecha", order: "desc" },
      { column: "md.display_order", order: "asc" },
    ]);
}

async function findMeasurementRowsByRecordIds(trx, recordIds) {
  return trx("measurement_records as mr")
    .leftJoin("measurement_values as mv", "mv.record_id", "mr.id")
    .leftJoin("measurement_definitions as md", "md.id", "mv.definition_id")
    .select(
      "mr.id as record_id",
      "mr.cliente_id",
      "mr.fecha as record_fecha",
      "mr.scope as record_scope",
      "mv.id as value_id",
      "mv.value",
      "md.id as definition_id",
      "md.name",
      "md.abbreviation",
      "md.display_order",
      "md.scope as definition_scope",
    )
    .whereIn("mr.id", recordIds)
    .orderBy([
      { column: "mr.fecha", order: "desc" },
      { column: "md.display_order", order: "asc" },
    ]);
}

module.exports = {
  insertRecord,
  insertValues,
  findRecordById,
  findMeasurementRowsByClient,
  findMeasurementRowsByRecordIds,
};
