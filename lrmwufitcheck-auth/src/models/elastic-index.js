const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const userMapping = {
  id: { type: "keyword" },
  email: { type: "keyword", index: true, fields: { ftext: { type: "text" } } },
  password: { type: "keyword", index: false },
  fullname: {
    type: "keyword",
    index: true,
    fields: { ftext: { type: "text" } },
  },
  avatar: { type: "keyword", index: false },
  roleId: { type: "keyword", index: true },
  emailVerified: { type: "boolean", null_value: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const userAvatarsFileMapping = {
  id: { type: "keyword" },
  fileName: { type: "keyword", index: true },
  mimeType: { type: "keyword", index: true },
  fileSize: { type: "integer", index: true },
  accessKey: { type: "keyword", index: false },
  ownerId: { type: "keyword", index: true },
  fileData: { type: "binary" },
  metadata: { type: "object", enabled: false },
  scanStatus: { type: "keyword", index: true },
  scanResult: { type: "text", index: false },
  scannedAt: { type: "date", index: false },
  userId: { type: "keyword", index: true },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};

// Mappings registry for external access
const ELASTIC_MAPPINGS = {
  user: userMapping,
  userAvatarsFile: userAvatarsFileMapping,
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("user", userMapping);
    await new ElasticIndexer("user").updateMapping(userMapping);
    ElasticIndexer.addMapping("userAvatarsFile", userAvatarsFileMapping);
    await new ElasticIndexer("userAvatarsFile").updateMapping(
      userAvatarsFileMapping,
    );
  } catch (err) {
    hexaLogger.insertError(
      "UpdateElasticIndexMappingsError",
      { function: "updateElasticIndexMappings" },
      "elastic-index.js->updateElasticIndexMappings",
      err,
    );
  }
};

// Get mapping for a specific data object
const getElasticMapping = (dataObjectName) => {
  return (
    ELASTIC_MAPPINGS[dataObjectName] ||
    ELASTIC_MAPPINGS[dataObjectName.toLowerCase()]
  );
};

module.exports = {
  updateElasticIndexMappings,
  getElasticMapping,
  ELASTIC_MAPPINGS,
};
