const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for nutritionDay
 * Generated: 2026-06-29T09:50:49.248Z
 */
const schemaDef = {
  objectName: "nutritionDay",
  modelName: "NutritionDay",
  description: `A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.`,
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
    summaryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    consumedCalories: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    consumedProtein: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    consumedCarbohydrates: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    consumedFat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    consumedSugar: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    consumedFiber: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    targetCalories: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    targetProtein: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    targetCarbohydrates: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    targetFat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    targetSugar: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    targetFiber: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    exceededMetrics: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mealCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "nutrition_days_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "nutrition_days_summary_date",
      unique: false,
      fields: ["summaryDate"],
    },
    {
      name: "nutrition_days_user_id_summary_date",
      unique: true,
      fields: ["userId", "summaryDate"],
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
