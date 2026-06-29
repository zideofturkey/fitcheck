const NutritionAiServiceRestController = require("./NutritionAiServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new NutritionAiServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
