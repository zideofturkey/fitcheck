const { sequelize } = require("common");
const schemaDef = require("./schemas/aiCandidateMeal.schema");

/**
 * Stores the structured meal proposal produced by AI parsing of a user&#39;s natural-language input — holds proposed slot, date, nutrition totals, warning flags, and a confirmation status before the meal is committed to mealTracker.
 *
 * Schema loaded from schemas/aiCandidateMeal.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const AiCandidateMeal = sequelize.define(
  schemaDef.objectName,
  schemaDef.columns,
  { indexes: schemaDef.indexes },
);

module.exports = AiCandidateMeal;
