require("dotenv").config();

const path = require("path");
const fs = require("fs");

const client = (process.env.DB_CLIENT || "sqlite3").toLowerCase();
const sqlite = client === "sqlite" || client === "sqlite3";
const filename = process.env.SQLITE_FILENAME || "./data/copamoda.sqlite3";
if (sqlite && filename !== ":memory:") {
  const absoluteFilename = path.isAbsolute(filename)
    ? filename
    : path.resolve(__dirname, filename);
  fs.mkdirSync(path.dirname(absoluteFilename), { recursive: true });
}

const config = sqlite
  ? {
      client: "sqlite3",
      connection: {
        filename: path.isAbsolute(filename)
          ? filename
          : path.resolve(__dirname, filename),
      },
      useNullAsDefault: true,
      migrations: { directory: path.join(__dirname, "migrations") },
      seeds: { directory: path.join(__dirname, "seeds") },
    }
  : {
      client: "mysql2",
      connection: {
        host: process.env.MYSQL_HOST || "127.0.0.1",
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "copamoda",
      },
      migrations: { directory: path.join(__dirname, "migrations") },
      seeds: { directory: path.join(__dirname, "seeds") },
    };

module.exports = { development: config, production: config };
