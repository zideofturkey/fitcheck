const { sequelize } = require("common");
const schemaDef = require("./schemas/sys_agentOverride.schema");

/**
 * Runtime overrides for design-time agents. Null fields use the design default.
 *
 * Schema loaded from schemas/sys_agentOverride.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const Sys_agentOverride = sequelize.define(
  schemaDef.objectName,
  schemaDef.columns,
  { indexes: schemaDef.indexes },
);

module.exports = Sys_agentOverride;
