const { sequelize } = require("common");
const schemaDef = require("./schemas/foodItem.schema");

/**
 * A private, reusable food definition in the user&#39;s personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.
 *
 * Schema loaded from schemas/foodItem.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const FoodItem = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = FoodItem;
