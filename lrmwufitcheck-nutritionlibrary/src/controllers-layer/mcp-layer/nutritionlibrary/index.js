module.exports = (headers) => {
  // nutritionlibrary Database Crud Object Mcp Api Routers
  return {
    macroTargetMcpRouter: require("./macroTarget")(headers),
    foodItemMcpRouter: require("./foodItem")(headers),
    presetMealMcpRouter: require("./presetMeal")(headers),
    presetLineMcpRouter: require("./presetLine")(headers),
  };
};
