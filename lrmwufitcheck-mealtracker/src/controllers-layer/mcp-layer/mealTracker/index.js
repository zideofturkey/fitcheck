module.exports = (headers) => {
  // mealTracker Database Crud Object Mcp Api Routers
  return {
    mealLogMcpRouter: require("./mealLog")(headers),
    mealLineMcpRouter: require("./mealLine")(headers),
    nutritionDayMcpRouter: require("./nutritionDay")(headers),
  };
};
