const { sequelize } = require("common");
const schemaDef = require("./schemas/category.schema");

/**
 * A placeholder category value (scoped to food/dish/preset) created by an
 * admin with no rows using it yet. Not backed by a Mindbricks Manager
 * stack - read/written directly from src/routes/category-admin.js. The
 * schema file exists only so this table participates in the migration-diff
 * system like every other table.
 *
 * Schema loaded from schemas/category.schema.js
 */
const Category = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = Category;
