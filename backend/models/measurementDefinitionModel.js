async function findDefinitionsByIds(trx, ids) {
  return trx("measurement_definitions")
    .select("id", "name", "abbreviation", "display_order", "scope")
    .whereIn("id", ids)
    .orderBy([
      { column: "scope", order: "asc" },
      { column: "display_order", order: "asc" },
    ]);
}

module.exports = {
  findDefinitionsByIds,
};
