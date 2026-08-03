const { Router } = require("express");

const ordersController = require("../controllers/ordersController");
const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../middlewares/validate");
const {
  orderCreateSchema,
  orderUpdateStatusSchema,
  orderParamsSchema,
  orderListQuerySchema,
} = require("../validators");
const { asyncHandler } = require("../utils/asyncHandler");

const router = Router();

router.post(
  "/",
  validateBody(orderCreateSchema),
  asyncHandler(ordersController.create),
);
router.get(
  "/",
  validateQuery(orderListQuerySchema),
  asyncHandler(ordersController.list),
);
router.put(
  "/:id",
  validateParams(orderParamsSchema),
  validateBody(orderUpdateStatusSchema),
  asyncHandler(ordersController.updateStatus),
);

module.exports = router;
