const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for aiCandidateLine
 * Generated: 2026-06-29T13:46:11.008Z
 */
const schemaDef = {
  objectName: "aiCandidateLine",
  modelName: "AiCandidateLine",
  description: `Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user&#39;s choice to save the food to their library.`,
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
    aiCandidateMealId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
    },
    detectedFoodName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    estimatedGrams: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    estimatedCalories: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    estimatedProtein: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    estimatedCarbohydrates: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    estimatedFat: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    estimatedSugar: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    estimatedFiber: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    quantityConfidence: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    nutritionReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    saveAsFood: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "ai_candidate_lines_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "ai_candidate_lines_ai_candidate_meal_id",
      unique: false,
      fields: ["aiCandidateMealId"],
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
