const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for foodItem
 * Generated: 2026-06-29T09:47:08.915Z
 */
const schemaDef = {
  objectName: "foodItem",
  modelName: "FoodItem",
  description: `A private, reusable food definition in the user&#39;s personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.`,
  dbType: "postgresql",
  useSoftDelete: true,

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
    foodName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    caloriePer100g: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    proteinPer100g: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    carbohydratePer100g: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    fatPer100g: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    sugarPer100g: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    fiberPer100g: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    brandName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    baseName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parentIngredientId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    foodCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creationSource: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "manualEntry",
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
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
      name: "food_items_user_id",
      unique: false,
      fields: ["userId"],
      where: { isActive: true },
    },
    {
      name: "food_items_food_name",
      unique: false,
      fields: ["foodName"],
      where: { isActive: true },
    },
    {
      name: "food_items_food_category",
      unique: false,
      fields: ["foodCategory"],
      where: { isActive: true },
    },
    {
      name: "food_items_creation_source",
      unique: false,
      fields: ["creationSource"],
      where: { isActive: true },
    },
    {
      name: "food_items_base_name",
      unique: false,
      fields: ["baseName"],
      where: { isActive: true },
    },
    {
      name: "food_items_parent_ingredient_id",
      unique: false,
      fields: ["parentIngredientId"],
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
