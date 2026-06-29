const { sequelize } = require("common");
const schemaDef = require("./schemas/sys_agentExecution.schema");

/**
 * Agent execution log. Records each agent invocation with input, output, and performance metrics.
 *
 * Schema loaded from schemas/sys_agentExecution.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const Sys_agentExecution = sequelize.define(
  schemaDef.objectName,
  schemaDef.columns,
  { indexes: schemaDef.indexes },
);

module.exports = Sys_agentExecution;
