const { sequelize } = require("common");
const schemaDef = require("./schemas/dish.schema");

/**
 * A reusable dish/recipe definition owned by a user, composed of foodItem-based lines. Stores auto-calculated aggregate nutrition totals and total gram weight derived from its constituent dish lines.
 *
 * Schema loaded from schemas/dish.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const Dish = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = Dish;
