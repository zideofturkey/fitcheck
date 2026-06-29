const NutritionLibraryServiceMcpController = require("./NutritionLibraryServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new NutritionLibraryServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
