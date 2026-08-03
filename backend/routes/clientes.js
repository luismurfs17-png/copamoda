const { Router } = require("express");

const clientesController = require("../controllers/clientesController");
const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../middlewares/validate");
const {
  clientCreateSchema,
  clientUpdateSchema,
  clientParamsSchema,
  clientListQuerySchema,
} = require("../validators");
const { asyncHandler } = require("../utils/asyncHandler");

const router = Router();

router.post(
  "/",
  validateBody(clientCreateSchema),
  asyncHandler(clientesController.create),
);
router.get(
  "/",
  validateQuery(clientListQuerySchema),
  asyncHandler(clientesController.list),
);
router.put(
  "/:id",
  validateParams(clientParamsSchema),
  validateBody(clientUpdateSchema),
  asyncHandler(clientesController.update),
);
router.patch(
  "/:id/archive",
  validateParams(clientParamsSchema),
  asyncHandler(clientesController.archive),
);

module.exports = router;
