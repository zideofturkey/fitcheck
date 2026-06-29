const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for sys_agentConversation
 * Generated: 2026-06-29T09:55:50.699Z
 */
const schemaDef = {
  objectName: "sys_agentConversation",
  modelName: "Sys_agentConversation",
  description: `Conversation history for chat-mode AI agents. One record per session, keyed by sessionId.`,
  dbType: "postgresql",
  useSoftDelete: false,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    agentName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    messages: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    messageCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "sys_agent_conversations_agent_name",
      unique: false,
      fields: ["agentName"],
    },
    {
      name: "sys_agent_conversations_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "sys_agent_conversations_session_id",
      unique: true,
      fields: ["sessionId"],
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
