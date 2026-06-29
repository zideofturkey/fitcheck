const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const aiSessionMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: true },
  sessionType: { type: "keyword", index: true },
  sessionType_idx: { type: "integer" },
  inputText: { type: "text", index: false },
  detectedLanguage: { type: "keyword", index: false },
  sessionState: { type: "keyword", index: true },
  sessionState_idx: { type: "integer" },
  confidenceScore: { type: "double", index: false },
  finalResponseText: { type: "text", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const aiCandidateMealMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: true },
  aiSessionId: { type: "keyword", index: true },
  proposedMealDate: { type: "date", index: false },
  proposedMealTime: { type: "keyword", index: false },
  proposedSlotName: { type: "keyword", index: false },
  candidateSource: { type: "keyword", index: false },
  candidateSource_idx: { type: "integer" },
  warningText: { type: "text", index: false },
  confirmationRequired: { type: "boolean", null_value: false },
  isConfirmed: { type: "boolean", null_value: false },
  isCommitted: { type: "boolean", null_value: false },
  totalCalories: { type: "double", index: false },
  totalProtein: { type: "double", index: false },
  totalCarbohydrates: { type: "double", index: false },
  totalFat: { type: "double", index: false },
  totalSugar: { type: "double", index: false },
  totalFiber: { type: "double", index: false },
  committedMealLogId: { type: "keyword", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const aiCandidateLineMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: true },
  aiCandidateMealId: { type: "keyword", index: true },
  detectedFoodName: { type: "keyword", index: false },
  estimatedGrams: { type: "double", index: false },
  estimatedCalories: { type: "double", index: false },
  estimatedProtein: { type: "double", index: false },
  estimatedCarbohydrates: { type: "double", index: false },
  estimatedFat: { type: "double", index: false },
  estimatedSugar: { type: "double", index: false },
  estimatedFiber: { type: "double", index: false },
  quantityConfidence: { type: "double", index: false },
  nutritionReference: { type: "keyword", index: false },
  saveAsFood: { type: "boolean", null_value: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const aiGuidanceNoteMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: true },
  aiSessionId: { type: "keyword", index: true },
  questionType: { type: "keyword", index: true },
  contextRange: { type: "keyword", index: true },
  answerSummary: { type: "text", index: false },
  rationaleText: { type: "text", index: false },
  referencedMetricKeys: { type: "keyword", index: false },
  cautionText: { type: "text", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};

// Mappings registry for external access
const ELASTIC_MAPPINGS = {
  aiSession: aiSessionMapping,
  aiCandidateMeal: aiCandidateMealMapping,
  aiCandidateLine: aiCandidateLineMapping,
  aiGuidanceNote: aiGuidanceNoteMapping,
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("aiSession", aiSessionMapping);
    await new ElasticIndexer("aiSession").updateMapping(aiSessionMapping);
    ElasticIndexer.addMapping("aiCandidateMeal", aiCandidateMealMapping);
    await new ElasticIndexer("aiCandidateMeal").updateMapping(
      aiCandidateMealMapping,
    );
    ElasticIndexer.addMapping("aiCandidateLine", aiCandidateLineMapping);
    await new ElasticIndexer("aiCandidateLine").updateMapping(
      aiCandidateLineMapping,
    );
    ElasticIndexer.addMapping("aiGuidanceNote", aiGuidanceNoteMapping);
    await new ElasticIndexer("aiGuidanceNote").updateMapping(
      aiGuidanceNoteMapping,
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
