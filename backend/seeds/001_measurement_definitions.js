const definitions = [
  ["Contorno de pecho", "Pecho", "P", "superior", 1],
  ["Contorno de cintura", "Cintura", "C", "superior", 2],
  ["Contorno de cadera", "Cadera", "Cad", "inferior", 1],
  ["Ancho de espalda", "Espalda", "AE", "superior", 3],
  ["Largo de talle delantero", "Talle delantero", "TD", "superior", 4],
  ["Largo de talle espalda", "Talle espalda", "TE", "superior", 5],
  ["Largo de manga", "Manga", "M", "superior", 6],
  ["Largo de falda", "Falda", "LF", "inferior", 2],
  ["Largo de pantalon", "Pantalon", "LP", "inferior", 3],
  ["Contorno de muslo", "Muslo", "Mus", "inferior", 4],
];

exports.seed = async function seed(knex) {
  const { randomUUID } = require("crypto");
  const existing = await knex("measurement_definitions").select("abbreviation");
  const known = new Set(existing.map((row) => row.abbreviation));
  const rows = definitions
    .filter(([, , abbreviation]) => !known.has(abbreviation))
    .map(([name, , abbreviation, scope, display_order]) => ({
      id: randomUUID(),
      name,
      abbreviation,
      scope,
      display_order,
    }));

  if (rows.length) {
    await knex("measurement_definitions").insert(rows);
  }
};
