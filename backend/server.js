require("dotenv").config();

const app = require("./app");
const { db } = require("./config/db");
const { logger } = require("./utils/logger");

const PORT = Number(process.env.PORT || 3000);

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "api_started");
});

async function shutdown(signal) {
  logger.info({ signal }, "api_shutdown");
  server.close(async () => {
    try {
      await db.destroy();
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
