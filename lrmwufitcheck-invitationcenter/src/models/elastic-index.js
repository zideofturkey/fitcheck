const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const inviteLinkMapping = {
  id: { type: "keyword" },
  ownerUserId: { type: "keyword", index: false },
  inviteCode: { type: "keyword", index: false },
  invitedEmail: { type: "keyword", index: false },
  usageMode: { type: "keyword", index: false },
  usageMode_idx: { type: "integer" },
  usageLimit: { type: "integer", index: false },
  usageCount: { type: "integer", index: false },
  inviteState: { type: "keyword", index: false },
  inviteState_idx: { type: "integer" },
  expiresAt: { type: "date", index: false },
  lastUsedAt: { type: "date", index: false },
  registeredUserId: { type: "keyword", index: false },
  deliveryRequestedAt: { type: "date", index: false },
  lastDeliveredAt: { type: "date", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const inviteAuditMapping = {
  id: { type: "keyword" },
  inviteLinkId: { type: "keyword", index: false },
  eventType: { type: "keyword", index: false },
  eventType_idx: { type: "integer" },
  eventAt: { type: "date", index: false },
  actorUserId: { type: "keyword", index: false },
  eventNote: { type: "keyword", index: false },
  relatedEmail: { type: "keyword", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};

// Mappings registry for external access
const ELASTIC_MAPPINGS = {
  inviteLink: inviteLinkMapping,
  inviteAudit: inviteAuditMapping,
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("inviteLink", inviteLinkMapping);
    await new ElasticIndexer("inviteLink").updateMapping(inviteLinkMapping);
    ElasticIndexer.addMapping("inviteAudit", inviteAuditMapping);
    await new ElasticIndexer("inviteAudit").updateMapping(inviteAuditMapping);
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
