const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const sys_agentOverrideMapping = {
  id: { type: "keyword" },
  agentName: { type: "keyword", index: true },
  provider: { type: "keyword", index: false },
  model: { type: "keyword", index: false },
  systemPrompt: { type: "text", index: false },
  temperature: { type: "double", index: false },
  maxTokens: { type: "integer", index: false },
  responseFormat: { type: "keyword", index: false },
  selectedTools: { type: "object", enabled: false },
  guardrails: { type: "object", enabled: false },
  enabled: { type: "boolean", null_value: false },
  updatedBy: { type: "keyword", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const sys_agentExecutionMapping = {
  id: { type: "keyword" },
  agentName: { type: "keyword", index: true },
  agentType: { type: "keyword", index: true },
  agentType_idx: { type: "integer" },
  source: { type: "keyword", index: true },
  source_idx: { type: "integer" },
  userId: { type: "keyword", index: true },
  input: { type: "object", enabled: false },
  output: { type: "object", enabled: false },
  toolCalls: { type: "integer", index: true },
  tokenUsage: { type: "object", enabled: false },
  durationMs: { type: "integer", index: true },
  status: { type: "keyword", index: true },
  status_idx: { type: "integer" },
  error: { type: "text", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const sys_toolCatalogMapping = {
  id: { type: "keyword" },
  toolName: { type: "keyword", index: true },
  serviceName: { type: "keyword", index: true },
  description: { type: "text", index: true },
  parameters: { type: "object", enabled: false },
  lastRefreshed: { type: "date", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const sys_agentConversationMapping = {
  id: { type: "keyword" },
  sessionId: { type: "keyword", index: true },
  agentName: { type: "keyword", index: true },
  userId: { type: "keyword", index: true },
  messages: { type: "object", enabled: false },
  messageCount: { type: "integer", index: true },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};

// Mappings registry for external access
const ELASTIC_MAPPINGS = {
  sys_agentOverride: sys_agentOverrideMapping,
  sys_agentExecution: sys_agentExecutionMapping,
  sys_toolCatalog: sys_toolCatalogMapping,
  sys_agentConversation: sys_agentConversationMapping,
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("sys_agentOverride", sys_agentOverrideMapping);
    await new ElasticIndexer("sys_agentOverride").updateMapping(
      sys_agentOverrideMapping,
    );
    ElasticIndexer.addMapping("sys_agentExecution", sys_agentExecutionMapping);
    await new ElasticIndexer("sys_agentExecution").updateMapping(
      sys_agentExecutionMapping,
    );
    ElasticIndexer.addMapping("sys_toolCatalog", sys_toolCatalogMapping);
    await new ElasticIndexer("sys_toolCatalog").updateMapping(
      sys_toolCatalogMapping,
    );
    ElasticIndexer.addMapping(
      "sys_agentConversation",
      sys_agentConversationMapping,
    );
    await new ElasticIndexer("sys_agentConversation").updateMapping(
      sys_agentConversationMapping,
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
