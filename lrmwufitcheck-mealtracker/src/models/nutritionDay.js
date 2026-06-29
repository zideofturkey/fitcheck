const { sequelize } = require("common");
const schemaDef = require("./schemas/nutritionDay.schema");

/**
 * A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.
 *
 * Schema loaded from schemas/nutritionDay.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const NutritionDay = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = NutritionDay;
