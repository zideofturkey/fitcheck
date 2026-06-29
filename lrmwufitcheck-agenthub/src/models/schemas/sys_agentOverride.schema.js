const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for sys_agentOverride
 * Generated: 2026-06-29T09:55:50.697Z
 */
const schemaDef = {
  objectName: "sys_agentOverride",
  modelName: "Sys_agentOverride",
  description: `Runtime overrides for design-time agents. Null fields use the design default.`,
  dbType: "postgresql",
  useSoftDelete: false,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    agentName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    systemPrompt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    temperature: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    maxTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    responseFormat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    selectedTools: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    guardrails: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "sys_agent_overrides_enabled",
      unique: false,
      fields: ["enabled"],
    },
    {
      name: "sys_agent_overrides_agent_name",
      unique: true,
      fields: ["agentName"],
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
