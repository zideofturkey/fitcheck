const { sequelize } = require("common");
const schemaDef = require("./schemas/feedback.schema");

/**
 * A free-form site-feedback message submitted from the footer form. Not
 * backed by a Mindbricks Manager stack - read/written directly from
 * src/routes/feedback.js.
 *
 * Schema loaded from schemas/feedback.schema.js
 */
const Feedback = sequelize.define(schemaDef.objectName, schemaDef.columns, {
  indexes: schemaDef.indexes,
});

module.exports = Feedback;
