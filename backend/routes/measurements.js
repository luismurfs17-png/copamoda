const { Router } = require("express");

const measurementsController = require("../controllers/measurementsController");
const { validateBody, validateParams } = require("../middlewares/validate");
const {
  createMeasurementSchema,
  measurementClientParamsSchema,
} = require("../validators");
const { asyncHandler } = require("../utils/asyncHandler");

const router = Router();

router.post(
  "/",
  validateBody(createMeasurementSchema),
  asyncHandler(measurementsController.create),
);
router.get(
  "/:clienteId",
  validateParams(measurementClientParamsSchema),
  asyncHandler(measurementsController.listByClient),
);

module.exports = router;
