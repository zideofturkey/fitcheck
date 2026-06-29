const MealTrackerServiceMcpController = require("./MealTrackerServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new MealTrackerServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
