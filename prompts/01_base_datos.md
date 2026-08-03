# Base de datos para taller de corte y confección

Diseño pensado para trabajo móvil, uso offline y futura migración de SQLite local a MySQL en hosting.

## Criterios de diseño

- Los UUID se generan en el dispositivo móvil para evitar colisiones al sincronizar.
- `clientes` no se elimina: se usa `archived_at`.
- `measurement_definitions` es un catálogo editable sin tocar históricos.
- `measurement_records` guarda cada toma de medidas como snapshot inmutable.
- `measurement_values` desacopla la cabecera del detalle de cada medida.
- `saldo` se mantiene calculado por triggers para consultas rápidas.
- Los pagos no pueden exceder `precio_total`.

## 1) Script SQL para SQLite

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE clientes (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL COLLATE NOCASE,
    telefono TEXT NOT NULL,
    direccion TEXT,
    fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TEXT
);

CREATE INDEX idx_clientes_nombre ON clientes(nombre);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_archived_at ON clientes(archived_at);

CREATE TABLE measurement_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    display_order INTEGER NOT NULL CHECK (display_order > 0),
    scope TEXT NOT NULL CHECK (scope IN ('superior', 'inferior')),
    UNIQUE (abbreviation),
    UNIQUE (scope, display_order)
);

CREATE TABLE measurement_records (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scope TEXT NOT NULL CHECK (scope IN ('superior', 'inferior')),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_measurement_records_cliente_fecha ON measurement_records(cliente_id, fecha);
CREATE INDEX idx_measurement_records_scope ON measurement_records(scope);

CREATE TABLE measurement_values (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL,
    definition_id TEXT NOT NULL,
    value NUMERIC NOT NULL CHECK (value > 0),
    FOREIGN KEY (record_id) REFERENCES measurement_records(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (definition_id) REFERENCES measurement_definitions(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    UNIQUE (record_id, definition_id)
);

CREATE INDEX idx_measurement_values_definition ON measurement_values(definition_id);

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    tipo_prenda TEXT NOT NULL,
    descripcion TEXT,
    fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'proceso', 'terminado', 'entregado')),
    precio_total NUMERIC NOT NULL DEFAULT 0 CHECK (precio_total >= 0),
    saldo NUMERIC NOT NULL DEFAULT 0 CHECK (saldo >= 0),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_orders_cliente ON orders(cliente_id);
CREATE INDEX idx_orders_estado_fecha_entrega ON orders(estado, fecha_entrega);
CREATE INDEX idx_orders_fecha_entrega ON orders(fecha_entrega);

CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto NUMERIC NOT NULL CHECK (monto > 0),
    metodo TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_payments_order_fecha ON payments(order_id, fecha);

CREATE TRIGGER trg_orders_ai_set_saldo
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    UPDATE orders
    SET saldo = NEW.precio_total
    WHERE id = NEW.id;
END;

CREATE TRIGGER trg_orders_bu_precio_total
BEFORE UPDATE OF precio_total ON orders
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.precio_total < (
            SELECT COALESCE(SUM(monto), 0)
            FROM payments
            WHERE order_id = OLD.id
        ) THEN RAISE(ABORT, 'El precio_total no puede ser menor al total pagado')
    END;
END;

CREATE TRIGGER trg_orders_au_precio_total
AFTER UPDATE OF precio_total ON orders
FOR EACH ROW
BEGIN
    UPDATE orders
    SET saldo = NEW.precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = NEW.id
    ), 0)
    WHERE id = NEW.id;
END;

CREATE TRIGGER trg_payments_bi_validate
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.monto <= 0 THEN RAISE(ABORT, 'El monto debe ser mayor que cero')
        WHEN (SELECT id FROM orders WHERE id = NEW.order_id) IS NULL THEN RAISE(ABORT, 'La orden no existe')
        WHEN NEW.monto > (
            SELECT o.precio_total - COALESCE((
                SELECT SUM(p.monto)
                FROM payments p
                WHERE p.order_id = NEW.order_id
            ), 0)
            FROM orders o
            WHERE o.id = NEW.order_id
        ) THEN RAISE(ABORT, 'El pago excede el saldo disponible')
    END;
END;

CREATE TRIGGER trg_payments_bu_validate
BEFORE UPDATE ON payments
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.monto <= 0 THEN RAISE(ABORT, 'El monto debe ser mayor que cero')
        WHEN (SELECT id FROM orders WHERE id = NEW.order_id) IS NULL THEN RAISE(ABORT, 'La orden no existe')
        WHEN NEW.monto > (
            SELECT o.precio_total - COALESCE((
                SELECT SUM(p.monto)
                FROM payments p
                WHERE p.order_id = NEW.order_id AND p.id <> OLD.id
            ), 0)
            FROM orders o
            WHERE o.id = NEW.order_id
        ) THEN RAISE(ABORT, 'El pago excede el saldo disponible')
    END;
END;

CREATE TRIGGER trg_payments_au_recalculate
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    UPDATE orders
    SET saldo = precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = OLD.order_id
    ), 0)
    WHERE id = OLD.order_id;

    UPDATE orders
    SET saldo = precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = NEW.order_id
    ), 0)
    WHERE id = NEW.order_id;
END;

CREATE TRIGGER trg_payments_ai_recalculate
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    UPDATE orders
    SET saldo = precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = NEW.order_id
    ), 0)
    WHERE id = NEW.order_id;
END;

CREATE TRIGGER trg_payments_ad_recalculate
AFTER DELETE ON payments
FOR EACH ROW
BEGIN
    UPDATE orders
    SET saldo = precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = OLD.order_id
    ), 0)
    WHERE id = OLD.order_id;
END;
```

## 2) Script SQL para MySQL

```sql
CREATE TABLE clientes (
    id CHAR(36) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    direccion VARCHAR(255) NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at DATETIME NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_clientes_nombre ON clientes(nombre);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_archived_at ON clientes(archived_at);

CREATE TABLE measurement_definitions (
    id CHAR(36) NOT NULL,
    name VARCHAR(120) NOT NULL,
    abbreviation VARCHAR(30) NOT NULL,
    display_order INT NOT NULL,
    scope VARCHAR(10) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_measurement_definitions_abbreviation (abbreviation),
    UNIQUE KEY uq_measurement_definitions_scope_order (scope, display_order),
    CONSTRAINT chk_measurement_definitions_scope
        CHECK (scope IN ('superior', 'inferior')),
    CONSTRAINT chk_measurement_definitions_display_order
        CHECK (display_order > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE measurement_records (
    id CHAR(36) NOT NULL,
    cliente_id CHAR(36) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scope VARCHAR(10) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_measurement_records_cliente_fecha (cliente_id, fecha),
    KEY idx_measurement_records_scope (scope),
    CONSTRAINT fk_measurement_records_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_measurement_records_scope
        CHECK (scope IN ('superior', 'inferior'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE measurement_values (
    id CHAR(36) NOT NULL,
    record_id CHAR(36) NOT NULL,
    definition_id CHAR(36) NOT NULL,
    value DECIMAL(8,2) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_measurement_values_record_definition (record_id, definition_id),
    KEY idx_measurement_values_definition (definition_id),
    CONSTRAINT fk_measurement_values_record
        FOREIGN KEY (record_id) REFERENCES measurement_records(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_measurement_values_definition
        FOREIGN KEY (definition_id) REFERENCES measurement_definitions(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_measurement_values_value CHECK (value > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
    id CHAR(36) NOT NULL,
    cliente_id CHAR(36) NOT NULL,
    order_number VARCHAR(40) NOT NULL,
    tipo_prenda VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATETIME NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    precio_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    saldo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (id),
    UNIQUE KEY uq_orders_order_number (order_number),
    KEY idx_orders_cliente (cliente_id),
    KEY idx_orders_estado_fecha_entrega (estado, fecha_entrega),
    KEY idx_orders_fecha_entrega (fecha_entrega),
    CONSTRAINT fk_orders_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_orders_estado
        CHECK (estado IN ('pendiente', 'proceso', 'terminado', 'entregado')),
    CONSTRAINT chk_orders_precio_total
        CHECK (precio_total >= 0),
    CONSTRAINT chk_orders_saldo
        CHECK (saldo >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
    id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(10,2) NOT NULL,
    metodo VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_payments_order_fecha (order_id, fecha),
    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_payments_monto CHECK (monto > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$

CREATE TRIGGER trg_orders_bi_set_saldo
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    SET NEW.saldo = NEW.precio_total;
END$$

CREATE TRIGGER trg_orders_bu_precio_total
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.precio_total < (
        SELECT COALESCE(SUM(monto), 0)
        FROM payments
        WHERE order_id = OLD.id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El precio_total no puede ser menor al total pagado';
    END IF;

    SET NEW.saldo = NEW.precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = OLD.id
    ), 0);
END$$

CREATE TRIGGER trg_payments_bi_validate
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.monto <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto debe ser mayor que cero';
    END IF;

    IF (SELECT COUNT(*) FROM orders WHERE id = NEW.order_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La orden no existe';
    END IF;

    IF NEW.monto > (
        SELECT o.precio_total - COALESCE((
            SELECT SUM(p.monto)
            FROM payments p
            WHERE p.order_id = NEW.order_id
        ), 0)
        FROM orders o
        WHERE o.id = NEW.order_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El pago excede el saldo disponible';
    END IF;
END$$

CREATE TRIGGER trg_payments_bu_validate
BEFORE UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.monto <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto debe ser mayor que cero';
    END IF;

    IF (SELECT COUNT(*) FROM orders WHERE id = NEW.order_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La orden no existe';
    END IF;

    IF NEW.monto > (
        SELECT o.precio_total - COALESCE((
            SELECT SUM(p.monto)
            FROM payments p
            WHERE p.order_id = NEW.order_id AND p.id <> OLD.id
        ), 0)
        FROM orders o
        WHERE o.id = NEW.order_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El pago excede el saldo disponible';
    END IF;
END$$

CREATE TRIGGER trg_payments_ai_recalculate
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    UPDATE orders
    SET saldo = precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = NEW.order_id
    ), 0)
    WHERE id = NEW.order_id;
END$$

CREATE TRIGGER trg_payments_au_recalculate
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    UPDATE orders
    SET saldo = precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = OLD.order_id
    ), 0)
    WHERE id = OLD.order_id;

    UPDATE orders
    SET saldo = precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = NEW.order_id
    ), 0)
    WHERE id = NEW.order_id;
END$$

CREATE TRIGGER trg_payments_ad_recalculate
AFTER DELETE ON payments
FOR EACH ROW
BEGIN
    UPDATE orders
    SET saldo = precio_total - COALESCE((
        SELECT SUM(monto)
        FROM payments
        WHERE order_id = OLD.order_id
    ), 0)
    WHERE id = OLD.order_id;
END$$

DELIMITER ;
```

## 3) Diagrama textual de relaciones

- `clientes` 1 ── N `measurement_records`
- `measurement_records` 1 ── N `measurement_values`
- `measurement_definitions` 1 ── N `measurement_values`
- `clientes` 1 ── N `orders`
- `orders` 1 ── N `payments`

## 4) Justificación de decisiones clave

Se usa UUID en todas las entidades principales para facilitar sincronización offline y futura integración entre varios dispositivos sin depender de autoincrementos locales. `saldo` se mantiene físicamente en `orders` para acelerar la consulta en móvil, pero su valor se recalcula con triggers a partir de `payments`, evitando inconsistencias. La validación de pago máximo se aplica en base de datos, no solo en la app, para que el control sobreviva a errores de interfaz o sincronización.

El catálogo de medidas está desacoplado en definición, cabecera histórica y valores para que nuevos tipos de medida puedan agregarse sin migrar datos antiguos. Además, las relaciones usan `RESTRICT` en casi todos los borrados para preservar historial comercial: clientes se archivan, pedidos y mediciones quedan como evidencia histórica, y los pagos se registran como abonos auditables.
