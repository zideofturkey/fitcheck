const { sequelize } = require("common");
const schemaDef = require("./schemas/inviteAudit.schema");

/**
 * Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.
 *
 * Schema loaded from schemas/inviteAudit.schema.js
 * The schema is the SINGLE SOURCE OF TRUTH for both model definition and migrations.
 */
const InviteAudit = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = InviteAudit;
