const NutritionAiServiceMcpController = require("./NutritionAiServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new NutritionAiServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
