async function findDefinitionsByIds(trx, ids) {
  return trx("measurement_definitions")
    .select("id", "name", "abbreviation", "display_order", "scope")
    .whereIn("id", ids)
    .orderBy([
      { column: "scope", order: "asc" },
      { column: "display_order", order: "asc" },
    ]);
}

async function findAllDefinitions(trx) {
  return trx("measurement_definitions")
    .select("id", "name", "abbreviation", "display_order", "scope")
    .orderBy([
      { column: "scope", order: "asc" },
      { column: "display_order", order: "asc" },
    ]);
}

module.exports = {
  findAllDefinitions,
  findDefinitionsByIds,
};
