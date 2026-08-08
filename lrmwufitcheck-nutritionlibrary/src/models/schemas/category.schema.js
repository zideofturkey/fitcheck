const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for category
 * Generated: 2026-08-08T00:00:00.000Z
 *
 * Note: unlike the other entities in this file, `category` is NOT served
 * through a Mindbricks Manager/dbApiScripts/MCP/gRPC stack - it's read and
 * written directly via src/routes/category-admin.js (plain Sequelize model
 * access). This table only holds "placeholder" categories - ones an admin
 * created that have zero rows using them yet. Once at least one foodItem/
 * dish/presetMeal carries a matching category value, listCategories derives
 * the category from that row instead; the placeholder row just makes an
 * empty category selectable before any row uses it. `entity` scopes the
 * category to one of the three separate value spaces (food/dish/preset -
 * mirrors ENTITY_CONFIG in category-admin.js). This schema file exists
 * solely so the model participates in the migration-diff system the same
 * way every other table does.
 */
const schemaDef = {
  objectName: "category",
  modelName: "Category",
  description: `A placeholder category value (scoped to food/dish/preset) created by an admin with no rows using it yet, so it shows up as selectable before any row uses it.`,
  dbType: "postgresql",
  useSoftDelete: false,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "categories_entity_category_name",
      unique: true,
      fields: ["entity", "categoryName"],
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
