const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for mealLog
 * Generated: 2026-06-29T09:50:49.243Z
 */
const schemaDef = {
  objectName: "mealLog",
  modelName: "MealLog",
  description: `A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.`,
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
    mealDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    mealTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    slotName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    logSource: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "foodLibrary",
    },
    noteText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalCalories: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    totalProtein: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    totalCarbohydrates: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    totalFat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    totalSugar: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    totalFiber: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "meal_logs_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "meal_logs_meal_date",
      unique: false,
      fields: ["mealDate"],
    },
    {
      name: "meal_logs_log_source",
      unique: false,
      fields: ["logSource"],
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
