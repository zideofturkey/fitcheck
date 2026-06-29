const MealTrackerServiceRestController = require("./MealTrackerServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new MealTrackerServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
