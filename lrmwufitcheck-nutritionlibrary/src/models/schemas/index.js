/**
 * Schema Index File
 *
 * Exports all schema definitions for use in:
 * - Migration tracking (uses serialize() for JSON snapshots)
 * - Schema comparison
 * - API introspection
 *
 * Each schema is a JS object with actual DataTypes/Schema.Types.
 * The serialize() method converts types to strings for storage.
 */

// Import all schema definitions (JS objects with actual types)
const schemas = {
  macroTarget: require("./macroTarget.schema"),
  foodItem: require("./foodItem.schema"),
  presetMeal: require("./presetMeal.schema"),
  presetLine: require("./presetLine.schema"),
  dish: require("./dish.schema"),
  dishLine: require("./dishLine.schema"),
  suggestion: require("./suggestion.schema"),
};

/**
 * Get schema for a specific DataObject
 * @param {string} objectName - Name of the DataObject
 * @returns {object|null} Schema definition or null if not found
 */
function getSchema(objectName) {
  return schemas[objectName] || null;
}

/**
 * Get serialized schema for a specific DataObject (for storage/comparison)
 * @param {string} objectName - Name of the DataObject
 * @returns {object|null} Serialized schema with string types, or null if not found
 */
function getSerializedSchema(objectName) {
  const schema = schemas[objectName];
  return schema ? schema.serialize() : null;
}

/**
 * Get all schemas
 * @returns {object} All schema definitions keyed by object name
 */
function getAllSchemas() {
  return { ...schemas };
}

/**
 * Get all serialized schemas (for storage/comparison)
 * @returns {object} All serialized schemas keyed by object name
 */
function getAllSerializedSchemas() {
  const result = {};
  for (const [name, schema] of Object.entries(schemas)) {
    result[name] = schema.serialize();
  }
  return result;
}

/**
 * Get list of all DataObject names
 * @returns {string[]} Array of object names
 */
function getObjectNames() {
  return Object.keys(schemas);
}

/**
 * Get combined schema hash for all objects
 * Useful for quick comparison of entire service schema state
 * @returns {string} Combined hash of all schemas
 */
function getCombinedSchemaHash() {
  const crypto = require("crypto");
  const combined = Object.keys(schemas)
    .sort()
    .map((name) => JSON.stringify(schemas[name].serialize()))
    .join("|");
  return crypto
    .createHash("sha256")
    .update(combined)
    .digest("hex")
    .substring(0, 16);
}

/**
 * Get schema metadata summary
 * @returns {object} Summary of all schemas
 */
function getSchemaSummary() {
  return {
    dbType: "postgresql",
    objectCount: Object.keys(schemas).length,
    objects: Object.keys(schemas).map((name) => {
      const s = schemas[name];
      return {
        name,
        columnCount: Object.keys(s.columns || s.fields || {}).length,
        indexCount: (s.indexes || []).length,
        useSoftDelete: s.useSoftDelete || false,
      };
    }),
    combinedHash: getCombinedSchemaHash(),
  };
}

module.exports = {
  schemas,
  getSchema,
  getSerializedSchema,
  getAllSchemas,
  getAllSerializedSchemas,
  getObjectNames,
  getCombinedSchemaHash,
  getSchemaSummary,
};
