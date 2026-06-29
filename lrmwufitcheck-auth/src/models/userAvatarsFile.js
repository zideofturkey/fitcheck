const { sequelize } = require("common");
const schemaDef = require("./schemas/userAvatarsFile.schema");

/**
 * Auto-generated file storage for the userAvatars database bucket. Files are stored as BYTEA in PostgreSQL.
 *
 * Schema loaded from schemas/userAvatarsFile.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const UserAvatarsFile = sequelize.define(
  schemaDef.objectName,
  schemaDef.columns,
  { indexes: schemaDef.indexes },
);

module.exports = UserAvatarsFile;
