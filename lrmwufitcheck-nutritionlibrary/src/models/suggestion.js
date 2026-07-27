const { sequelize } = require("common");
const schemaDef = require("./schemas/suggestion.schema");

/**
 * A user's request to promote a private foodItem/dish/presetMeal record to
 * global. Unlike the other models in this folder, suggestion is not backed
 * by a Mindbricks Manager stack - it's read/written directly from
 * src/routes/suggestions.js. The schema file exists only so this table
 * participates in the migration-diff system like every other table.
 *
 * Schema loaded from schemas/suggestion.schema.js
 */
const Suggestion = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = Suggestion;
