const ToolRegistry = require("agentLayer/ToolRegistry");

function buildMealParsingAgentToolRegistry(serviceContext) {
  const registry = new ToolRegistry();
  const dbLayer = serviceContext.dbLayer;
  const lib = serviceContext.lib;

  if (serviceContext.apiHandlers?.["parseMeal"]) {
    registry.registerApiTool(
      "parseMeal",
      serviceContext.apiHandlers["parseMeal"],
    );
  }
  if (serviceContext.apiHandlers?.["getAiCandidateMeal"]) {
    registry.registerApiTool(
      "getAiCandidateMeal",
      serviceContext.apiHandlers["getAiCandidateMeal"],
    );
  }
  if (serviceContext.apiHandlers?.["listAiCandidateMeals"]) {
    registry.registerApiTool(
      "listAiCandidateMeals",
      serviceContext.apiHandlers["listAiCandidateMeals"],
    );
  }
  if (serviceContext.apiHandlers?.["updateAiCandidateLine"]) {
    registry.registerApiTool(
      "updateAiCandidateLine",
      serviceContext.apiHandlers["updateAiCandidateLine"],
    );
  }
  if (serviceContext.apiHandlers?.["confirmCandidateMeal"]) {
    registry.registerApiTool(
      "confirmCandidateMeal",
      serviceContext.apiHandlers["confirmCandidateMeal"],
    );
  }
  if (serviceContext.apiHandlers?.["rejectCandidateMeal"]) {
    registry.registerApiTool(
      "rejectCandidateMeal",
      serviceContext.apiHandlers["rejectCandidateMeal"],
    );
  }
  if (serviceContext.apiHandlers?.["getMyMacroTargetForLogging"]) {
    registry.registerApiTool(
      "getMyMacroTargetForLogging",
      serviceContext.apiHandlers["getMyMacroTargetForLogging"],
    );
  }
  if (serviceContext.apiHandlers?.["listFoodItems"]) {
    registry.registerApiTool(
      "listFoodItems",
      serviceContext.apiHandlers["listFoodItems"],
    );
  }
  if (serviceContext.apiHandlers?.["createMealLog"]) {
    registry.registerApiTool(
      "createMealLog",
      serviceContext.apiHandlers["createMealLog"],
    );
  }
  if (serviceContext.apiHandlers?.["createMealLine"]) {
    registry.registerApiTool(
      "createMealLine",
      serviceContext.apiHandlers["createMealLine"],
    );
  }

  return registry;
}

module.exports = { buildMealParsingAgentToolRegistry };
