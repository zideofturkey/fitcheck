const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for inviteLink
 * Generated: 2026-06-29T09:46:09.026Z
 */
const schemaDef = {
  objectName: "inviteLink",
  modelName: "InviteLink",
  description: `Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.`,
  dbType: "postgresql",
  useSoftDelete: false,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    ownerUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    invitedEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usageMode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "singleUse",
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    inviteState: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "draft",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    registeredUserId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    deliveryRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastDeliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "invite_links_owner_user_id",
      unique: false,
      fields: ["ownerUserId"],
    },
    {
      name: "invite_links_usage_mode",
      unique: false,
      fields: ["usageMode"],
    },
    {
      name: "invite_links_invite_state",
      unique: false,
      fields: ["inviteState"],
    },
    {
      name: "invite_links_invite_code",
      unique: true,
      fields: ["inviteCode"],
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
