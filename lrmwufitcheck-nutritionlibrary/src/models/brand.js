const { sequelize } = require("common");
const schemaDef = require("./schemas/brand.schema");

/**
 * A placeholder brand name created by an admin with no foodItems attached
 * yet. Not backed by a Mindbricks Manager stack - read/written directly
 * from src/routes/brand-admin.js. The schema file exists only so this
 * table participates in the migration-diff system like every other table.
 *
 * Schema loaded from schemas/brand.schema.js
 */
const Brand = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = Brand;
