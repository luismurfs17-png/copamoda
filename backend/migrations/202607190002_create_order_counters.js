exports.up = function up(knex) {
  return knex.schema.createTable("order_counters", (table) => {
    table.integer("year").primary();
    table.integer("corr_actual").notNullable().defaultTo(0);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists("order_counters");
};
