const { sequelize } = require("common");
const schemaDef = require("./schemas/sys_toolCatalog.schema");

/**
 * Cached tool catalog discovered from project services. Refreshed periodically.
 *
 * Schema loaded from schemas/sys_toolCatalog.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const Sys_toolCatalog = sequelize.define(
  schemaDef.objectName,
  schemaDef.columns,
  { indexes: schemaDef.indexes },
);

module.exports = Sys_toolCatalog;
