const { sequelize } = require("common");
const schemaDef = require("./schemas/aiGuidanceNote.schema");

/**
 * Persists the structured outcome of a nutrition guidance Q&amp;A interaction — stores question classification, time range context, the summarized answer, rationale, referenced metrics, and any caution text, linked to the parent aiSession.
 *
 * Schema loaded from schemas/aiGuidanceNote.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const AiGuidanceNote = sequelize.define(
  schemaDef.objectName,
  schemaDef.columns,
  { indexes: schemaDef.indexes },
);

module.exports = AiGuidanceNote;
