const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for dish
 * Generated: 2026-07-27T00:00:00.000Z
 */
const schemaDef = {
  objectName: "dish",
  modelName: "Dish",
  description: `A reusable dish/recipe definition owned by a user, composed of foodItem-based lines. Stores auto-calculated aggregate nutrition totals and total gram weight derived from its constituent dish lines. Must never be mutated directly except via name/description update or line recompute.`,
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
    dishName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    descriptionText: {
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
    totalGramWeight: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
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
      name: "dishes_user_id",
      unique: false,
      fields: ["userId"],
      where: { isActive: true },
    },
    {
      name: "dishes_dish_name",
      unique: false,
      fields: ["dishName"],
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
