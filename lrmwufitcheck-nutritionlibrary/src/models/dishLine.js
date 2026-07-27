const { sequelize } = require("common");
const schemaDef = require("./schemas/dishLine.schema");

/**
 * A single food item entry within a dish. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a dish; individual lines are not edited (replace pattern).
 *
 * Schema loaded from schemas/dishLine.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const DishLine = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = DishLine;
