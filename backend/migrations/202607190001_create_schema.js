exports.up = async function up(knex) {
  await knex.schema.createTable("clientes", (table) => {
    table.string("id", 36).primary();
    table.string("nombre", 150).notNullable();
    table.string("telefono", 30).notNullable();
    table.string("direccion", 255).nullable();
    table.dateTime("fecha_creacion").notNullable().defaultTo(knex.fn.now());
    table.dateTime("archived_at").nullable();
    table.index("nombre", "idx_clientes_nombre");
    table.index("telefono", "idx_clientes_telefono");
    table.index("archived_at", "idx_clientes_archived_at");
  });

  await knex.schema.createTable("measurement_definitions", (table) => {
    table.string("id", 36).primary();
    table.string("name", 120).notNullable();
    table.string("abbreviation", 30).notNullable().unique();
    table.integer("display_order").notNullable();
    table
      .enu("scope", ["superior", "inferior"], { useNative: false })
      .notNullable();
    table.check("display_order > 0");
    table.unique(
      ["scope", "display_order"],
      "uq_measurement_definitions_scope_order",
    );
  });

  await knex.schema.createTable("measurement_records", (table) => {
    table.string("id", 36).primary();
    table.string("cliente_id", 36).notNullable();
    table.dateTime("fecha").notNullable().defaultTo(knex.fn.now());
    table
      .enu("scope", ["superior", "inferior"], { useNative: false })
      .notNullable();
    table.index(
      ["cliente_id", "fecha"],
      "idx_measurement_records_cliente_fecha",
    );
    table.index("scope", "idx_measurement_records_scope");
    table
      .foreign("cliente_id")
      .references("id")
      .inTable("clientes")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
  });

  await knex.schema.createTable("measurement_values", (table) => {
    table.string("id", 36).primary();
    table.string("record_id", 36).notNullable();
    table.string("definition_id", 36).notNullable();
    table.decimal("value", 8, 2).notNullable();
    table.check("value > 0");
    table.unique(
      ["record_id", "definition_id"],
      "uq_measurement_values_record_definition",
    );
    table.index("definition_id", "idx_measurement_values_definition");
    table
      .foreign("record_id")
      .references("id")
      .inTable("measurement_records")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
    table
      .foreign("definition_id")
      .references("id")
      .inTable("measurement_definitions")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
  });

  await knex.schema.createTable("orders", (table) => {
    table.string("id", 36).primary();
    table.string("cliente_id", 36).notNullable();
    table.string("order_number", 40).notNullable().unique();
    table.string("tipo_prenda", 120).notNullable();
    table.text("descripcion").nullable();
    table.dateTime("fecha_creacion").notNullable().defaultTo(knex.fn.now());
    table.dateTime("fecha_entrega").nullable();
    table
      .enu("estado", ["pendiente", "proceso", "terminado", "entregado"], {
        useNative: false,
      })
      .notNullable()
      .defaultTo("pendiente");
    table.decimal("precio_total", 10, 2).notNullable().defaultTo(0);
    table.decimal("saldo", 10, 2).notNullable().defaultTo(0);
    table.check("precio_total >= 0");
    table.check("saldo >= 0");
    table.index("cliente_id", "idx_orders_cliente");
    table.index(["estado", "fecha_entrega"], "idx_orders_estado_fecha_entrega");
    table.index("fecha_entrega", "idx_orders_fecha_entrega");
    table
      .foreign("cliente_id")
      .references("id")
      .inTable("clientes")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
  });

  await knex.schema.createTable("payments", (table) => {
    table.string("id", 36).primary();
    table.string("order_id", 36).notNullable();
    table.dateTime("fecha").notNullable().defaultTo(knex.fn.now());
    table.decimal("monto", 10, 2).notNullable();
    table.string("metodo", 50).notNullable();
    table.check("monto > 0");
    table.index(["order_id", "fecha"], "idx_payments_order_fecha");
    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("payments");
  await knex.schema.dropTableIfExists("orders");
  await knex.schema.dropTableIfExists("measurement_values");
  await knex.schema.dropTableIfExists("measurement_records");
  await knex.schema.dropTableIfExists("measurement_definitions");
  await knex.schema.dropTableIfExists("clientes");
};
