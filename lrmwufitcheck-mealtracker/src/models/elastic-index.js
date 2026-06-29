const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const mealLogMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: true },
  mealDate: { type: "date", index: true },
  mealTime: { type: "keyword", index: false },
  slotName: { type: "keyword", index: false },
  logSource: { type: "keyword", index: true },
  logSource_idx: { type: "integer" },
  noteText: { type: "keyword", index: false },
  totalCalories: { type: "double", index: false },
  totalProtein: { type: "double", index: false },
  totalCarbohydrates: { type: "double", index: false },
  totalFat: { type: "double", index: false },
  totalSugar: { type: "double", index: false },
  totalFiber: { type: "double", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const mealLineMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: true },
  mealLogId: { type: "keyword", index: true },
  sourceFoodItemId: { type: "keyword", index: false },
  sourcePresetMealId: { type: "keyword", index: false },
  itemName: { type: "keyword", index: false },
  consumedGrams: { type: "double", index: false },
  itemCalories: { type: "double", index: false },
  itemProtein: { type: "double", index: false },
  itemCarbohydrates: { type: "double", index: false },
  itemFat: { type: "double", index: false },
  itemSugar: { type: "double", index: false },
  itemFiber: { type: "double", index: false },
  lineSource: { type: "keyword", index: false },
  lineSource_idx: { type: "integer" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const nutritionDayMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: true },
  summaryDate: { type: "date", index: true },
  consumedCalories: { type: "double", index: false },
  consumedProtein: { type: "double", index: false },
  consumedCarbohydrates: { type: "double", index: false },
  consumedFat: { type: "double", index: false },
  consumedSugar: { type: "double", index: false },
  consumedFiber: { type: "double", index: false },
  targetCalories: { type: "double", index: false },
  targetProtein: { type: "double", index: false },
  targetCarbohydrates: { type: "double", index: false },
  targetFat: { type: "double", index: false },
  targetSugar: { type: "double", index: false },
  targetFiber: { type: "double", index: false },
  exceededMetrics: { type: "keyword", index: false },
  mealCount: { type: "integer", index: false },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};

// Mappings registry for external access
const ELASTIC_MAPPINGS = {
  mealLog: mealLogMapping,
  mealLine: mealLineMapping,
  nutritionDay: nutritionDayMapping,
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("mealLog", mealLogMapping);
    await new ElasticIndexer("mealLog").updateMapping(mealLogMapping);
    ElasticIndexer.addMapping("mealLine", mealLineMapping);
    await new ElasticIndexer("mealLine").updateMapping(mealLineMapping);
    ElasticIndexer.addMapping("nutritionDay", nutritionDayMapping);
    await new ElasticIndexer("nutritionDay").updateMapping(nutritionDayMapping);
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
