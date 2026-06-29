const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for inviteAudit
 * Generated: 2026-06-29T09:46:09.027Z
 */
const schemaDef = {
  objectName: "inviteAudit",
  modelName: "InviteAudit",
  description: `Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.`,
  dbType: "postgresql",
  useSoftDelete: false,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    inviteLinkId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "created",
    },
    eventAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    actorUserId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    eventNote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    relatedEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "invite_audits_invite_link_id",
      unique: false,
      fields: ["inviteLinkId"],
    },
    {
      name: "invite_audits_event_type",
      unique: false,
      fields: ["eventType"],
    },
  ],
};

/**
 * Serialize schema for migration storage
 * Converts DataTypes to string representations
 */
schemaDef.serialize = function () {
  const serializeType = (type) => {
    if (!type) return "STRING";
    // Handle ARRAY types specially - preserve inner type so ARRAY(UUID) round-trips correctly
    if (type.key === "ARRAY" && type.type) {
      const innerType = serializeType(type.type);
      return `ARRAY(${innerType})`;
    }
    const str = type.toString();
    // Handle DataTypes like "UUID", "STRING(255)", etc.
    if (str.includes("(")) {
      // Parameterized type
      return str;
    }
    // Get the key name from DataTypes
    for (const [key, val] of Object.entries(DataTypes)) {
      if (val === type || (type.key && type.key === key)) {
        return key;
      }
    }
    return type.key || str;
  };

  const serializedColumns = {};
  for (const [name, def] of Object.entries(this.columns)) {
    serializedColumns[name] = {
      ...def,
      type: serializeType(def.type),
    };
  }

  return {
    objectName: this.objectName,
    modelName: this.modelName,
    dbType: this.dbType,
    useSoftDelete: this.useSoftDelete,
    columns: serializedColumns,
    indexes: this.indexes,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = schemaDef;
