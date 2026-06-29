const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for sys_toolCatalog
 * Generated: 2026-06-29T09:55:50.698Z
 */
const schemaDef = {
  objectName: "sys_toolCatalog",
  modelName: "Sys_toolCatalog",
  description: `Cached tool catalog discovered from project services. Refreshed periodically.`,
  dbType: "postgresql",
  useSoftDelete: false,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    toolName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parameters: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    lastRefreshed: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "sys_tool_catalogs_service_name",
      unique: false,
      fields: ["serviceName"],
    },
    {
      name: "sys_tool_catalogs_tool_name",
      unique: true,
      fields: ["toolName"],
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
