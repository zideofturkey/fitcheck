const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for suggestion
 * Generated: 2026-07-27T00:00:00.000Z
 *
 * Note: unlike the other entities in this file, `suggestion` is NOT served
 * through a Mindbricks Manager/dbApiScripts/MCP/gRPC stack - it's read and
 * written directly via src/routes/suggestions.js (plain Sequelize model
 * access). This schema file exists solely so the model participates in the
 * migration-diff system the same way every other table does.
 */
const schemaDef = {
  objectName: "suggestion",
  modelName: "Suggestion",
  description: `A user's request to promote one of their private foodItem/dish/presetMeal records to a global (admin-approved, shared) record. Reviewed by an admin, who either approves it (creating an independent global copy of the source record) or rejects it. The source record itself is never modified by a suggestion.`,
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
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "foodItem",
    },
    sourceRecordId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    reviewNote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "suggestions_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "suggestions_status",
      unique: false,
      fields: ["status"],
    },
    {
      name: "suggestions_source_record_id",
      unique: false,
      fields: ["sourceRecordId"],
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
