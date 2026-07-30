const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for mealLine
 * Generated: 2026-06-29T09:50:49.247Z
 */
const schemaDef = {
  objectName: "mealLine",
  modelName: "MealLine",
  description: `An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.`,
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
    mealLogId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
    },
    sourceFoodItemId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    sourcePresetMealId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    sourceDishId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    consumedGrams: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    itemCalories: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    itemProtein: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    itemCarbohydrates: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    itemFat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    itemSugar: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    itemFiber: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    lineSource: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "foodLibrary",
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "meal_lines_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "meal_lines_meal_log_id",
      unique: false,
      fields: ["mealLogId"],
    },
    {
      name: "meal_lines_source_dish_id",
      unique: false,
      fields: ["sourceDishId"],
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
