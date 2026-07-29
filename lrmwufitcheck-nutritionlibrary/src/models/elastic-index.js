const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const macroTargetMapping = {
  id: { type: "keyword" },
  // Must be searchable (not index:false): mealtracker's upsertNutritionDay
  // fetches the caller's active macro target cross-service via
  // fetchRemoteObjectByMQuery("macroTarget", { userId }), which queries this
  // Elasticsearch index directly - a non-indexed field can never match a
  // term query, so the dashboard's daily-progress target silently fell back
  // to all-zeros for every user.
  userId: { type: "keyword" },
  calorieTarget: { type: "double", index: false },
  proteinTarget: { type: "double", index: false },
  carbohydrateTarget: { type: "double", index: false },
  fatTarget: { type: "double", index: false },
  sugarTarget: { type: "double", index: false },
  fiberTarget: { type: "double", index: false },
  effectiveFrom: { type: "date", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const foodItemMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: false },
  foodName: {
    type: "keyword",
    index: true,
    fields: { ftext: { type: "text" } },
  },
  caloriePer100g: { type: "double", index: false },
  proteinPer100g: { type: "double", index: false },
  carbohydratePer100g: { type: "double", index: false },
  fatPer100g: { type: "double", index: false },
  sugarPer100g: { type: "double", index: false },
  fiberPer100g: { type: "double", index: false },
  brandName: { type: "keyword", index: false },
  baseName: { type: "keyword", index: true },
  parentIngredientId: { type: "keyword", index: true },
  foodCategory: { type: "keyword", index: true },
  creationSource: { type: "keyword", index: true },
  creationSource_idx: { type: "integer" },
  isGlobal: { type: "boolean" },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const presetMealMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: false },
  templateName: {
    type: "keyword",
    index: true,
    fields: { ftext: { type: "text" } },
  },
  descriptionText: { type: "keyword", index: false },
  totalCalories: { type: "double", index: false },
  totalProtein: { type: "double", index: false },
  totalCarbohydrates: { type: "double", index: false },
  totalFat: { type: "double", index: false },
  totalSugar: { type: "double", index: false },
  totalFiber: { type: "double", index: false },
  isGlobal: { type: "boolean" },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const presetLineMapping = {
  id: { type: "keyword" },
  presetMealId: { type: "keyword", index: true },
  foodItemId: { type: "keyword", index: false },
  dishId: { type: "keyword", index: true },
  lineFoodName: { type: "keyword", index: false },
  gramAmount: { type: "double", index: false },
  lineCalories: { type: "double", index: false },
  lineProtein: { type: "double", index: false },
  lineCarbohydrates: { type: "double", index: false },
  lineFat: { type: "double", index: false },
  lineSugar: { type: "double", index: false },
  lineFiber: { type: "double", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const dishMapping = {
  id: { type: "keyword" },
  userId: { type: "keyword", index: false },
  dishName: {
    type: "keyword",
    index: true,
    fields: { ftext: { type: "text" } },
  },
  descriptionText: { type: "keyword", index: false },
  totalCalories: { type: "double", index: false },
  totalProtein: { type: "double", index: false },
  totalCarbohydrates: { type: "double", index: false },
  totalFat: { type: "double", index: false },
  totalSugar: { type: "double", index: false },
  totalFiber: { type: "double", index: false },
  totalGramWeight: { type: "double", index: false },
  isGlobal: { type: "boolean" },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};
const dishLineMapping = {
  id: { type: "keyword" },
  dishId: { type: "keyword", index: true },
  foodItemId: { type: "keyword", index: false },
  lineFoodName: { type: "keyword", index: false },
  gramAmount: { type: "double", index: false },
  lineCalories: { type: "double", index: false },
  lineProtein: { type: "double", index: false },
  lineCarbohydrates: { type: "double", index: false },
  lineFat: { type: "double", index: false },
  lineSugar: { type: "double", index: false },
  lineFiber: { type: "double", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  _owner: { type: "keyword" },
};

// Mappings registry for external access
const ELASTIC_MAPPINGS = {
  macroTarget: macroTargetMapping,
  foodItem: foodItemMapping,
  presetMeal: presetMealMapping,
  presetLine: presetLineMapping,
  dish: dishMapping,
  dishLine: dishLineMapping,
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("macroTarget", macroTargetMapping);
    await new ElasticIndexer("macroTarget").updateMapping(macroTargetMapping);
    ElasticIndexer.addMapping("foodItem", foodItemMapping);
    await new ElasticIndexer("foodItem").updateMapping(foodItemMapping);
    ElasticIndexer.addMapping("presetMeal", presetMealMapping);
    await new ElasticIndexer("presetMeal").updateMapping(presetMealMapping);
    ElasticIndexer.addMapping("presetLine", presetLineMapping);
    await new ElasticIndexer("presetLine").updateMapping(presetLineMapping);
    ElasticIndexer.addMapping("dish", dishMapping);
    await new ElasticIndexer("dish").updateMapping(dishMapping);
    ElasticIndexer.addMapping("dishLine", dishLineMapping);
    await new ElasticIndexer("dishLine").updateMapping(dishLineMapping);
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
