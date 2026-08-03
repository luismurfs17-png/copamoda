const { randomUUID } = require("crypto");

function useUuid(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return randomUUID();
}

module.exports = { useUuid };
