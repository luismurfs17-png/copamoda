const { Router } = require("express");

const paymentsController = require("../controllers/paymentsController");
const { validateBody, validateParams } = require("../middlewares/validate");
const {
  paymentCreateSchema,
  paymentOrderParamsSchema,
} = require("../validators");
const { asyncHandler } = require("../utils/asyncHandler");

const router = Router();

router.post(
  "/",
  validateBody(paymentCreateSchema),
  asyncHandler(paymentsController.create),
);
router.get(
  "/:orderId",
  validateParams(paymentOrderParamsSchema),
  asyncHandler(paymentsController.listByOrder),
);

module.exports = router;
