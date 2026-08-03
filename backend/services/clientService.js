const { db } = require("../config/db");
const { AppError } = require("../utils/appError");
const { useUuid } = require("../utils/uuid");
const clientModel = require("../models/clientModel");

async function createClient(payload) {
  const id = useUuid(payload.id);

  await clientModel.insertClient(db, {
    id,
    nombre: payload.nombre.trim(),
    telefono: payload.telefono.trim(),
    direccion: payload.direccion ? payload.direccion.trim() : null,
    archived_at: null,
  });

  return clientModel.findClientById(db, id);
}

async function listClients(filters) {
  return clientModel.listClients(db, filters);
}

async function updateClient(id, payload) {
  const affected = await clientModel.updateClient(db, id, {
    ...(payload.nombre !== undefined ? { nombre: payload.nombre.trim() } : {}),
    ...(payload.telefono !== undefined
      ? { telefono: payload.telefono.trim() }
      : {}),
    ...(payload.direccion !== undefined
      ? { direccion: payload.direccion ? payload.direccion.trim() : null }
      : {}),
  });

  if (!affected) {
    throw new AppError("Cliente no encontrado", 404);
  }

  return clientModel.findClientById(db, id);
}

async function archiveClient(id) {
  const affected = await db("clientes")
    .where({ id })
    .update({ archived_at: db.fn.now() });

  if (!affected) {
    throw new AppError("Cliente no encontrado", 404);
  }

  return clientModel.findClientById(db, id);
}

module.exports = {
  createClient,
  listClients,
  updateClient,
  archiveClient,
};
