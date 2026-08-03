const clientService = require("../services/clientService");
const { sendSuccess } = require("../utils/response");

async function create(req, res) {
  const client = await clientService.createClient(req.body);
  return sendSuccess(res, client, "Cliente creado", 201);
}

async function list(req, res) {
  const clients = await clientService.listClients(req.query);
  return sendSuccess(res, clients, "Clientes cargados");
}

async function update(req, res) {
  const client = await clientService.updateClient(req.params.id, req.body);
  return sendSuccess(res, client, "Cliente actualizado");
}

async function archive(req, res) {
  const client = await clientService.archiveClient(req.params.id);
  return sendSuccess(res, client, "Cliente archivado");
}

module.exports = {
  create,
  list,
  update,
  archive,
};
