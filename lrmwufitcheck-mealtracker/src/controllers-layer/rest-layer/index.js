const mealTrackerRouters = require("./mealTracker");

const sessionRouter = require("./session-router");

const geoRouter = require("./geo-router");
const { dbAdminRouter } = require("./dbadmin-controller");
module.exports = {
  ...mealTrackerRouters,
  MealTrackerServiceRestController: require("./MealTrackerServiceRestController"),
  ...sessionRouter,
  geoRouter,
  dbAdminRouter,
};
