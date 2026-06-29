const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for aiCandidateMeal
 * Generated: 2026-06-29T11:47:54.836Z
 */
const schemaDef = {
  objectName: "aiCandidateMeal",
  modelName: "AiCandidateMeal",
  description: `Stores the structured meal proposal produced by AI parsing of a user&#39;s natural-language input — holds proposed slot, date, nutrition totals, warning flags, and a confirmation status before the meal is committed to mealTracker.`,
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
    proposedMealDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    proposedMealTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    proposedSlotName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    candidateSource: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "aiAssistant",
    },
    warningText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    confirmationRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isCommitted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    totalCalories: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    totalProtein: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    totalCarbohydrates: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    totalFat: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    totalSugar: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    totalFiber: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    committedMealLogId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "ai_candidate_meals_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "ai_candidate_meals_ai_session_id",
      unique: false,
      fields: ["aiSessionId"],
    },
    {
      name: "ai_candidate_meals_is_confirmed",
      unique: false,
      fields: ["isConfirmed"],
    },
    {
      name: "ai_candidate_meals_is_committed",
      unique: false,
      fields: ["isCommitted"],
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
