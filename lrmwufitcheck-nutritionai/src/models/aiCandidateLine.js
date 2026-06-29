const { sequelize } = require("common");
const schemaDef = require("./schemas/aiCandidateLine.schema");

/**
 * Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user&#39;s choice to save the food to their library.
 *
 * Schema loaded from schemas/aiCandidateLine.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const AiCandidateLine = sequelize.define(
  schemaDef.objectName,
  schemaDef.columns,
  { indexes: schemaDef.indexes },
);

module.exports = AiCandidateLine;
