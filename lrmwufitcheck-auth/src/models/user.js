const { sequelize } = require("common");
const schemaDef = require("./schemas/user.schema");

/**
 * A data object that stores the user information and handles login settings.
 *
 * Schema loaded from schemas/user.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const User = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = User;
