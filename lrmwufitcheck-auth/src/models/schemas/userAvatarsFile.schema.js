const { DataTypes, Op } = require("sequelize");

/**
 * Schema definition for userAvatarsFile
 * Generated: 2026-06-29T09:36:46.864Z
 */
const schemaDef = {
  objectName: "userAvatarsFile",
  modelName: "UserAvatarsFile",
  description: `Auto-generated file storage for the userAvatars database bucket. Files are stored as BYTEA in PostgreSQL.`,
  dbType: "postgresql",
  useSoftDelete: false,

  // Columns definition - used directly in sequelize.define()
  columns: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    accessKey: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    fileData: {
      type: DataTypes.BLOB,
      allowNull: false,
      defaultValue: Buffer.alloc(0),
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    scanStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    scanResult: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scannedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },

  // Indexes definition - used directly in sequelize.define() options
  indexes: [
    {
      name: "user_avatars_files_file_name",
      unique: false,
      fields: ["fileName"],
    },
    {
      name: "user_avatars_files_mime_type",
      unique: false,
      fields: ["mimeType"],
    },
    {
      name: "user_avatars_files_owner_id",
      unique: false,
      fields: ["ownerId"],
    },
    {
      name: "user_avatars_files_scan_status",
      unique: false,
      fields: ["scanStatus"],
    },
    {
      name: "user_avatars_files_user_id",
      unique: false,
      fields: ["userId"],
    },
    {
      name: "user_avatars_files_access_key",
      unique: true,
      fields: ["accessKey"],
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
