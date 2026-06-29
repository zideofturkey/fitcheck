const nutritionaiRouters = require("./nutritionai");

const sessionRouter = require("./session-router");

const geoRouter = require("./geo-router");
const { dbAdminRouter } = require("./dbadmin-controller");
module.exports = {
  ...nutritionaiRouters,
  NutritionAiServiceRestController: require("./NutritionAiServiceRestController"),
  ...sessionRouter,
  geoRouter,
  dbAdminRouter,
};
