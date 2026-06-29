const ToolRegistry = require("agentLayer/ToolRegistry");

function buildNutritionGuidanceAgentToolRegistry(serviceContext) {
  const registry = new ToolRegistry();
  const dbLayer = serviceContext.dbLayer;
  const lib = serviceContext.lib;

  if (serviceContext.apiHandlers?.["getMyMacroTarget"]) {
    registry.registerApiTool(
      "getMyMacroTarget",
      serviceContext.apiHandlers["getMyMacroTarget"],
    );
  }
  if (serviceContext.apiHandlers?.["getMyMacroTargetForLogging"]) {
    registry.registerApiTool(
      "getMyMacroTargetForLogging",
      serviceContext.apiHandlers["getMyMacroTargetForLogging"],
    );
  }
  if (serviceContext.apiHandlers?.["listMealLogs"]) {
    registry.registerApiTool(
      "listMealLogs",
      serviceContext.apiHandlers["listMealLogs"],
    );
  }
  if (serviceContext.apiHandlers?.["getMealLog"]) {
    registry.registerApiTool(
      "getMealLog",
      serviceContext.apiHandlers["getMealLog"],
    );
  }
  if (serviceContext.apiHandlers?.["listMealLines"]) {
    registry.registerApiTool(
      "listMealLines",
      serviceContext.apiHandlers["listMealLines"],
    );
  }
  if (serviceContext.apiHandlers?.["getDailyProgress"]) {
    registry.registerApiTool(
      "getDailyProgress",
      serviceContext.apiHandlers["getDailyProgress"],
    );
  }
  if (serviceContext.apiHandlers?.["getNutritionDay"]) {
    registry.registerApiTool(
      "getNutritionDay",
      serviceContext.apiHandlers["getNutritionDay"],
    );
  }
  if (serviceContext.apiHandlers?.["listNutritionDays"]) {
    registry.registerApiTool(
      "listNutritionDays",
      serviceContext.apiHandlers["listNutritionDays"],
    );
  }
  if (serviceContext.apiHandlers?.["getWeeklyAnalytics"]) {
    registry.registerApiTool(
      "getWeeklyAnalytics",
      serviceContext.apiHandlers["getWeeklyAnalytics"],
    );
  }
  if (serviceContext.apiHandlers?.["getMonthlyAnalytics"]) {
    registry.registerApiTool(
      "getMonthlyAnalytics",
      serviceContext.apiHandlers["getMonthlyAnalytics"],
    );
  }
  if (serviceContext.apiHandlers?.["listFoodItems"]) {
    registry.registerApiTool(
      "listFoodItems",
      serviceContext.apiHandlers["listFoodItems"],
    );
  }
  if (serviceContext.apiHandlers?.["getFoodItem"]) {
    registry.registerApiTool(
      "getFoodItem",
      serviceContext.apiHandlers["getFoodItem"],
    );
  }

  return registry;
}

module.exports = { buildNutritionGuidanceAgentToolRegistry };
