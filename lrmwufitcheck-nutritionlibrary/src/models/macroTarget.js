const { sequelize } = require("common");
const schemaDef = require("./schemas/macroTarget.schema");

/**
 * Stores the authenticated user&#39;s six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.
 *
 * Schema loaded from schemas/macroTarget.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const MacroTarget = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = MacroTarget;
