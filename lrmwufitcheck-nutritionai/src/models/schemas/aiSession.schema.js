const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for aiSession
 * Generated: 2026-06-29T13:46:11.006Z
 */
const schemaDef = {
  objectName: "aiSession",
  modelName: "AiSession",
  description: `Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.`,
  dbType: "postgresql",
  useSoftDelete: false,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
    },
    sessionType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "mealParsing",
    },
    inputText: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "text",
    },
    detectedLanguage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sessionState: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    confidenceScore: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    finalResponseText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "ai_sessions_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "ai_sessions_session_type",
      unique: false,
      fields: ["sessionType"],
    },
    {
      name: "ai_sessions_session_state",
      unique: false,
      fields: ["sessionState"],
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
