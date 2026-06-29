const { sequelize } = require("common");
const schemaDef = require("./schemas/mealLine.schema");

/**
 * An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.
 *
 * Schema loaded from schemas/mealLine.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const MealLine = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = MealLine;
