const { sequelize } = require("common");
const schemaDef = require("./schemas/presetLine.schema");

/**
 * A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).
 *
 * Schema loaded from schemas/presetLine.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const PresetLine = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = PresetLine;
