const { sequelize } = require("common");
const schemaDef = require("./schemas/inviteLink.schema");

/**
 * Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.
 *
 * Schema loaded from schemas/inviteLink.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const InviteLink = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = InviteLink;
