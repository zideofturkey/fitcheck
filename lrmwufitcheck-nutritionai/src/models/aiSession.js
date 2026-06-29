const { sequelize } = require("common");
const schemaDef = require("./schemas/aiSession.schema");

/**
 * Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.
 *
 * Schema loaded from schemas/aiSession.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const AiSession = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = AiSession;
