const fs = require("fs");
const path = require("path");
const pino = require("pino");

const logsDirectory = path.resolve(__dirname, "..", "logs");
fs.mkdirSync(logsDirectory, { recursive: true });

let activeDate = null;
let activeStream = null;
let activeLogger = null;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getLogger() {
  const date = today();
  if (activeLogger && activeDate === date) {
    return activeLogger;
  }

  if (activeStream) {
    activeStream.end();
  }

  activeDate = date;
  activeStream = fs.createWriteStream(path.join(logsDirectory, `${date}.log`), {
    flags: "a",
  });
  activeLogger = pino({ level: process.env.LOG_LEVEL || "info" }, activeStream);
  return activeLogger;
}

function requestLogger(req, res, next) {
  const started = Date.now();
  res.on("finish", () => {
    getLogger().info(
      {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: Date.now() - started,
      },
      "http_request",
    );
  });
  next();
}

module.exports = {
  logger: {
    info: (data, message) => getLogger().info(data, message),
    error: (data, message) => getLogger().error(data, message),
    warn: (data, message) => getLogger().warn(data, message),
  },
  requestLogger,
  logsDirectory,
};
