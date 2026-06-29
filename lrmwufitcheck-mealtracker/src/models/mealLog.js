const { sequelize } = require("common");
const schemaDef = require("./schemas/mealLog.schema");

/**
 * A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.
 *
 * Schema loaded from schemas/mealLog.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const MealLog = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = MealLog;
