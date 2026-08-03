const { db } = require("../config/db");
const { AppError } = require("../utils/appError");
const { useUuid } = require("../utils/uuid");
const { normalizeDbNumber, toDbDateTime } = require("../utils/date");
const clientModel = require("../models/clientModel");
const measurementDefinitionModel = require("../models/measurementDefinitionModel");
const measurementModel = require("../models/measurementModel");

function groupMeasurementRows(rows) {
  const records = new Map();

  for (const row of rows) {
    if (!records.has(row.record_id)) {
      records.set(row.record_id, {
        id: row.record_id,
        cliente_id: row.cliente_id,
        fecha: row.record_fecha,
        scope: row.record_scope,
        values: [],
      });
    }

    if (row.value_id) {
      const current = records.get(row.record_id);
      current.values.push({
        id: row.value_id,
        definition_id: row.definition_id,
        name: row.name,
        abbreviation: row.abbreviation,
        display_order: row.display_order,
        scope: row.definition_scope,
        value: normalizeDbNumber(row.value),
      });
    }
  }

  return Array.from(records.values()).map((record) => ({
    ...record,
    values: record.values.sort((a, b) => a.display_order - b.display_order),
  }));
}

async function createMeasurement(payload) {
  return db.transaction(async (trx) => {
    const client = await clientModel.findClientById(trx, payload.cliente_id);

    if (!client) {
      throw new AppError("Cliente no encontrado", 404);
    }

    if (client.archived_at) {
      throw new AppError(
        "No se pueden registrar medidas para un cliente archivado",
        400,
      );
    }

    const definitionIds = payload.values.map((item) => item.definition_id);
    const uniqueDefinitionIds = new Set(definitionIds);

    if (uniqueDefinitionIds.size !== definitionIds.length) {
      throw new AppError(
        "No se permiten definiciones de medida duplicadas",
        400,
      );
    }

    const definitions = await measurementDefinitionModel.findDefinitionsByIds(
      trx,
      definitionIds,
    );

    if (definitions.length !== definitionIds.length) {
      throw new AppError("Una o mas definiciones de medida no existen", 404);
    }

    const definitionMap = new Map(
      definitions.map((definition) => [definition.id, definition]),
    );

    for (const item of payload.values) {
      const definition = definitionMap.get(item.definition_id);

      if (!definition) {
        throw new AppError("Definicion de medida invalida", 400);
      }

      if (definition.scope !== payload.scope) {
        throw new AppError(
          "La definicion de medida no coincide con el scope del registro",
          400,
        );
      }
    }

    const recordId = useUuid(payload.id);
    const fecha = payload.fecha ? toDbDateTime(payload.fecha) : undefined;

    if (payload.fecha && !fecha) {
      throw new AppError("Fecha de medida invalida", 400);
    }

    const recordData = {
      id: recordId,
      cliente_id: payload.cliente_id,
      scope: payload.scope,
    };

    if (fecha) {
      recordData.fecha = fecha;
    }

    await measurementModel.insertRecord(trx, recordData);

    const valueRows = payload.values.map((item) => ({
      id: useUuid(item.id),
      record_id: recordId,
      definition_id: item.definition_id,
      value: item.value,
    }));

    await measurementModel.insertValues(trx, valueRows);

    const rows = await measurementModel.findMeasurementRowsByRecordIds(trx, [
      recordId,
    ]);
    const records = groupMeasurementRows(rows);

    return records[0] || null;
  });
}

async function getMeasurementsByClient(clienteId) {
  const client = await clientModel.findClientById(db, clienteId);

  if (!client) {
    throw new AppError("Cliente no encontrado", 404);
  }

  const rows = await measurementModel.findMeasurementRowsByClient(
    db,
    clienteId,
  );
  return {
    client,
    records: groupMeasurementRows(rows),
  };
}

module.exports = {
  createMeasurement,
  getMeasurementsByClient,
};
