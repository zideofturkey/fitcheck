const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for aiGuidanceNote
 * Generated: 2026-06-29T11:47:54.838Z
 */
const schemaDef = {
  objectName: "aiGuidanceNote",
  modelName: "AiGuidanceNote",
  description: `Persists the structured outcome of a nutrition guidance Q&amp;A interaction — stores question classification, time range context, the summarized answer, rationale, referenced metrics, and any caution text, linked to the parent aiSession.`,
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
    aiSessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
    },
    questionType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    contextRange: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    answerSummary: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "text",
    },
    rationaleText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    referencedMetricKeys: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cautionText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "ai_guidance_notes_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "ai_guidance_notes_ai_session_id",
      unique: false,
      fields: ["aiSessionId"],
    },
    {
      name: "ai_guidance_notes_question_type",
      unique: false,
      fields: ["questionType"],
    },
    {
      name: "ai_guidance_notes_context_range",
      unique: false,
      fields: ["contextRange"],
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
