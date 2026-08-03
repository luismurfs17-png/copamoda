const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const yaml = require("js-yaml");

const clientesRoutes = require("./routes/clientes");
const measurementsRoutes = require("./routes/measurements");
const ordersRoutes = require("./routes/orders");
const paymentsRoutes = require("./routes/payments");
const { db, dbClient } = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { requestLogger } = require("./utils/logger");
const path = require("path");

const swaggerDocument = yaml.load(
  fs.readFileSync(require("path").join(__dirname, "swagger.yaml"), "utf8"),
);

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  if (process.env.NODE_ENV === "production") {
    app.use(requestLogger);
  } else {
    app.use(morgan("dev"));
  }

  const health = (req, res) => {
    res.json({
      success: true,
      data: { status: "ok", database: dbClient },
      message: "API running",
    });
  };
  const api = express.Router();
  api.get("/health", health);

  api.use("/clientes", clientesRoutes);
  api.use("/measurements", measurementsRoutes);
  api.use("/orders", ordersRoutes);
  api.use("/payments", paymentsRoutes);

  // The canonical public contract is /api; aliases keep existing clients/tests working.
  app.use(process.env.API_PREFIX || "/api", api);
  app.get("/health", health);
  app.use("/clientes", clientesRoutes);
  app.use("/measurements", measurementsRoutes);
  app.use("/orders", ordersRoutes);
  app.use("/payments", paymentsRoutes);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "public")));
    app.get("*", (req, res, next) =>
      req.path.startsWith("/api")
        ? next()
        : res.sendFile(path.join(__dirname, "public", "index.html")),
    );
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
module.exports.db = db;
