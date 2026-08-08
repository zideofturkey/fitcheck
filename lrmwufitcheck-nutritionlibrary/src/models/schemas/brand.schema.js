const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for brand
 * Generated: 2026-08-08T00:00:00.000Z
 *
 * Note: unlike the other entities in this file, `brand` is NOT served
 * through a Mindbricks Manager/dbApiScripts/MCP/gRPC stack - it's read and
 * written directly via src/routes/brand-admin.js (plain Sequelize model
 * access). This table only holds "placeholder" brands - ones an admin
 * created that have zero foodItems attached yet. Once at least one foodItem
 * carries a brandName, listBrands derives the brand from that foodItem
 * instead; the placeholder row just makes an empty brand name selectable
 * before any foodItem uses it. This schema file exists solely so the model
 * participates in the migration-diff system the same way every other table
 * does.
 */
const schemaDef = {
  objectName: "brand",
  modelName: "Brand",
  description: `A placeholder brand name created by an admin with no foodItems attached yet, so it shows up as selectable before any foodItem uses it.`,
  dbType: "postgresql",
  useSoftDelete: false,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    brandName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "brands_brand_name",
      unique: true,
      fields: ["brandName"],
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
