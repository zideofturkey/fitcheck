const { DataTypes } = require("sequelize");

/**
 * Schema definition for feedback
 * Generated: 2026-08-08T00:00:00.000Z
 *
 * Note: like `suggestion`, `feedback` is NOT served through a Mindbricks
 * Manager/dbApiScripts/MCP/gRPC stack - it's read and written directly via
 * src/routes/feedback.js (plain Sequelize model access). This schema file
 * exists solely so the model participates in the migration-diff system the
 * same way every other table does.
 */
const schemaDef = {
  objectName: "feedback",
  modelName: "Feedback",
  description: `A free-form message submitted by a (possibly anonymous) user via the site footer's "Geri Bildirim" form, reviewed by an admin.`,
  dbType: "postgresql",
  useSoftDelete: false,

  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "general",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "new",
    },
  },

  indexes: [
    {
      name: "feedback_status",
      unique: false,
      fields: ["status"],
    },
    {
      name: "feedback_created_at",
      unique: false,
      fields: ["createdAt"],
    },
  ],
};

schemaDef.serialize = function () {
  const serializeType = (type) => {
    if (!type) return "STRING";
    if (type.key === "ARRAY" && type.type) {
      const innerType = serializeType(type.type);
      return `ARRAY(${innerType})`;
    }
    const str = type.toString();
    if (str.includes("(")) {
      return str;
    }
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
