exports.up = async function up(knex) {
  if (knex.client.config.client === "sqlite3") {
    await knex.raw(`
      CREATE TRIGGER trg_orders_ai_set_saldo
      AFTER INSERT ON orders
      FOR EACH ROW
      BEGIN
        UPDATE orders SET saldo = NEW.precio_total WHERE id = NEW.id;
      END;
    `);
    await knex.raw(`
      CREATE TRIGGER trg_payments_bi_validate
      BEFORE INSERT ON payments
      FOR EACH ROW
      BEGIN
        SELECT CASE
          WHEN (SELECT id FROM orders WHERE id = NEW.order_id) IS NULL
            THEN RAISE(ABORT, 'La orden no existe')
          WHEN NEW.monto > (
            SELECT o.precio_total - COALESCE((SELECT SUM(p.monto) FROM payments p WHERE p.order_id = NEW.order_id), 0)
            FROM orders o WHERE o.id = NEW.order_id
          ) THEN RAISE(ABORT, 'El pago excede el saldo disponible')
        END;
      END;
    `);
    await knex.raw(`
      CREATE TRIGGER trg_payments_ai_recalculate
      AFTER INSERT ON payments
      FOR EACH ROW
      BEGIN
        UPDATE orders SET saldo = precio_total - COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = NEW.order_id), 0)
        WHERE id = NEW.order_id;
      END;
    `);
    await knex.raw(`
      CREATE TRIGGER trg_payments_ad_recalculate
      AFTER DELETE ON payments
      FOR EACH ROW
      BEGIN
        UPDATE orders SET saldo = precio_total - COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = OLD.order_id), 0)
        WHERE id = OLD.order_id;
      END;
    `);
    await knex.raw(`
      CREATE TRIGGER trg_orders_bu_precio_total
      BEFORE UPDATE OF precio_total ON orders
      FOR EACH ROW
      BEGIN
        SELECT CASE WHEN NEW.precio_total < COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = OLD.id), 0)
          THEN RAISE(ABORT, 'El precio_total no puede ser menor al total pagado') END;
      END;
    `);
    await knex.raw(`
      CREATE TRIGGER trg_orders_au_precio_total
      AFTER UPDATE OF precio_total ON orders
      FOR EACH ROW
      BEGIN
        UPDATE orders SET saldo = NEW.precio_total - COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = NEW.id), 0)
        WHERE id = NEW.id;
      END;
    `);
    await knex.raw(`
      CREATE TRIGGER trg_payments_bu_validate
      BEFORE UPDATE ON payments
      FOR EACH ROW
      BEGIN
        SELECT CASE WHEN NEW.monto > (
          SELECT o.precio_total - COALESCE((SELECT SUM(p.monto) FROM payments p WHERE p.order_id = NEW.order_id AND p.id <> OLD.id), 0)
          FROM orders o WHERE o.id = NEW.order_id
        ) THEN RAISE(ABORT, 'El pago excede el saldo disponible') END;
      END;
    `);
    await knex.raw(`
      CREATE TRIGGER trg_payments_au_recalculate
      AFTER UPDATE ON payments
      FOR EACH ROW
      BEGIN
        UPDATE orders SET saldo = precio_total - COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = OLD.order_id), 0)
        WHERE id = OLD.order_id;
        UPDATE orders SET saldo = precio_total - COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = NEW.order_id), 0)
        WHERE id = NEW.order_id;
      END;
    `);
    return;
  }

  await knex.raw(`
    CREATE TRIGGER trg_orders_bi_set_saldo
    BEFORE INSERT ON orders
    FOR EACH ROW
    SET NEW.saldo = NEW.precio_total
  `);
  await knex.raw(`
    CREATE TRIGGER trg_payments_bi_validate
    BEFORE INSERT ON payments
    FOR EACH ROW
    BEGIN
      DECLARE paid DECIMAL(10,2);
      IF (SELECT COUNT(*) FROM orders WHERE id = NEW.order_id) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La orden no existe';
      END IF;
      SELECT COALESCE(SUM(monto), 0) INTO paid FROM payments WHERE order_id = NEW.order_id;
      IF NEW.monto > (SELECT precio_total FROM orders WHERE id = NEW.order_id) - paid THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pago excede el saldo disponible';
      END IF;
    END
  `);
  await knex.raw(`
    CREATE TRIGGER trg_payments_ai_recalculate
    AFTER INSERT ON payments
    FOR EACH ROW
    UPDATE orders SET saldo = precio_total - COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = NEW.order_id), 0)
    WHERE id = NEW.order_id
  `);
  await knex.raw(`
    CREATE TRIGGER trg_payments_ad_recalculate
    AFTER DELETE ON payments
    FOR EACH ROW
    UPDATE orders SET saldo = precio_total - COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = OLD.order_id), 0)
    WHERE id = OLD.order_id
  `);
  await knex.raw(`
    CREATE TRIGGER trg_orders_bu_precio_total
    BEFORE UPDATE ON orders
    FOR EACH ROW
    BEGIN
      DECLARE paid DECIMAL(10,2);
      SELECT COALESCE(SUM(monto), 0) INTO paid FROM payments WHERE order_id = OLD.id;
      IF NEW.precio_total < paid THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El precio_total no puede ser menor al total pagado';
      END IF;
      SET NEW.saldo = NEW.precio_total - paid;
    END
  `);
  await knex.raw(`
    CREATE TRIGGER trg_payments_bu_validate
    BEFORE UPDATE ON payments
    FOR EACH ROW
    BEGIN
      DECLARE paid DECIMAL(10,2);
      SELECT COALESCE(SUM(monto), 0) INTO paid FROM payments WHERE order_id = NEW.order_id AND id <> OLD.id;
      IF NEW.monto > (SELECT precio_total FROM orders WHERE id = NEW.order_id) - paid THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pago excede el saldo disponible';
      END IF;
    END
  `);
  await knex.raw(`
    CREATE TRIGGER trg_payments_au_recalculate
    AFTER UPDATE ON payments
    FOR EACH ROW
    BEGIN
      UPDATE orders SET saldo = precio_total - COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = OLD.order_id), 0)
      WHERE id = OLD.order_id;
      UPDATE orders SET saldo = precio_total - COALESCE((SELECT SUM(monto) FROM payments WHERE order_id = NEW.order_id), 0)
      WHERE id = NEW.order_id;
    END
  `);
};

exports.down = async function down(knex) {
  const names = [
    "trg_orders_ai_set_saldo",
    "trg_orders_bi_set_saldo",
    "trg_orders_bu_precio_total",
    "trg_orders_au_precio_total",
    "trg_payments_bi_validate",
    "trg_payments_bu_validate",
    "trg_payments_ai_recalculate",
    "trg_payments_au_recalculate",
    "trg_payments_ad_recalculate",
  ];

  for (const name of names) {
    await knex.raw(`DROP TRIGGER IF EXISTS ${name}`);
  }
};
