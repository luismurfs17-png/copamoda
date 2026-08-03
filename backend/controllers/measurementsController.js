const measurementService = require("../services/measurementService");
const { sendSuccess } = require("../utils/response");

async function create(req, res) {
  const record = await measurementService.createMeasurement(req.body);
  return sendSuccess(res, record, "Medidas registradas", 201);
}

async function listByClient(req, res) {
  const data = await measurementService.getMeasurementsByClient(
    req.params.clienteId,
  );
  return sendSuccess(res, data, "Medidas cargadas");
}

module.exports = {
  create,
  listByClient,
};
