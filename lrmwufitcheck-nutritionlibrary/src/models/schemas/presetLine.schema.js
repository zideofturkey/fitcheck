const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for presetLine
 * Generated: 2026-06-29T09:47:08.916Z
 */
const schemaDef = {
  objectName: "presetLine",
  modelName: "PresetLine",
  description: `A single food item or dish entry within a preset meal template. References exactly one of foodItemId or dishId. Stores a gram amount and snapshot nutrition values calculated at line creation (scaled per-100g for a foodItem, or scaled against the dish's own total gram weight for a dish). Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).`,
  dbType: "postgresql",
  useSoftDelete: true,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    presetMealId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
    },
    foodItemId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    dishId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lineFoodName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    gramAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    lineCalories: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    lineProtein: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    lineCarbohydrates: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    lineFat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    lineSugar: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    lineFiber: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
    _archivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "preset_lines_preset_meal_id",
      unique: false,
      fields: ["presetMealId"],
      where: { isActive: true },
    },
    {
      name: "preset_lines_food_item_id",
      unique: false,
      fields: ["foodItemId"],
      where: { isActive: true },
    },
    {
      name: "preset_lines_dish_id",
      unique: false,
      fields: ["dishId"],
      where: { isActive: true },
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
