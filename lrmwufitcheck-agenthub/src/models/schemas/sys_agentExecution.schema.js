const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for sys_agentExecution
 * Generated: 2026-06-29T09:55:50.698Z
 */
const schemaDef = {
  objectName: "sys_agentExecution",
  modelName: "Sys_agentExecution",
  description: `Agent execution log. Records each agent invocation with input, output, and performance metrics.`,
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
    agentType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "design",
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "rest",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    input: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    output: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    toolCalls: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tokenUsage: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    durationMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "success",
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "sys_agent_executions_agent_name",
      unique: false,
      fields: ["agentName"],
    },
    {
      name: "sys_agent_executions_agent_type",
      unique: false,
      fields: ["agentType"],
    },
    {
      name: "sys_agent_executions_source",
      unique: false,
      fields: ["source"],
    },
    {
      name: "sys_agent_executions_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "sys_agent_executions_status",
      unique: false,
      fields: ["status"],
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
