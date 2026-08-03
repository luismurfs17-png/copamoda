require("dotenv").config();

const fs = require("fs");
const path = require("path");
const knex = require("knex");

const dbClient = (process.env.DB_CLIENT || "sqlite3").toLowerCase();
const isSQLite = dbClient === "sqlite3" || dbClient === "sqlite";

let sqliteFilename = null;

if (isSQLite) {
  const configuredPath =
    process.env.SQLITE_FILENAME || "./data/copamoda.sqlite3";
  sqliteFilename =
    configuredPath === ":memory:"
      ? configuredPath
      : path.isAbsolute(configuredPath)
        ? configuredPath
        : path.resolve(process.cwd(), configuredPath);
  fs.mkdirSync(path.dirname(sqliteFilename), { recursive: true });
}

const config = isSQLite
  ? {
      client: "sqlite3",
      connection: { filename: sqliteFilename },
      useNullAsDefault: true,
      pool: {
        afterCreate(conn, done) {
          conn.run("PRAGMA foreign_keys = ON", (foreignKeyErr) => {
            if (foreignKeyErr) {
              done(foreignKeyErr, conn);
              return;
            }

            conn.run("PRAGMA journal_mode = WAL", (walErr) => {
              done(walErr, conn);
            });
          });
        },
        min: 1,
        max: 1,
      },
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
      pool: {
        min: 0,
        max: 10,
      },
      acquireConnectionTimeout: 10000,
    };

const db = knex(config);

module.exports = {
  db,
  dbClient,
  isSQLite,
};
