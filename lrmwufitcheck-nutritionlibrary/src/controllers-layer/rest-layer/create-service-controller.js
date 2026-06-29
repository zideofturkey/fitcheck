const NutritionLibraryServiceRestController = require("./NutritionLibraryServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new NutritionLibraryServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
