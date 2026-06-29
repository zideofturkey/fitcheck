const { sequelize } = require("common");
const schemaDef = require("./schemas/presetMeal.schema");

/**
 * A reusable preset meal template owned by a user. Stores auto-calculated aggregate nutrition totals derived from its constituent preset lines. Mutations during meal logging must never affect this record.
 *
 * Schema loaded from schemas/presetMeal.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const PresetMeal = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = PresetMeal;
