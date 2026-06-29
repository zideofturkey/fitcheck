const { sequelize } = require("common");
const schemaDef = require("./schemas/sys_agentConversation.schema");

/**
 * Conversation history for chat-mode AI agents. One record per session, keyed by sessionId.
 *
 * Schema loaded from schemas/sys_agentConversation.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const Sys_agentConversation = sequelize.define(
  schemaDef.objectName,
  schemaDef.columns,
  { indexes: schemaDef.indexes },
);

module.exports = Sys_agentConversation;
