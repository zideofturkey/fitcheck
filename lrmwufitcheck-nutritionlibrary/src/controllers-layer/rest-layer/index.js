const nutritionlibraryRouters = require("./nutritionlibrary");

const sessionRouter = require("./session-router");

const geoRouter = require("./geo-router");
const { dbAdminRouter } = require("./dbadmin-controller");
module.exports = {
  ...nutritionlibraryRouters,
  NutritionLibraryServiceRestController: require("./NutritionLibraryServiceRestController"),
  ...sessionRouter,
  geoRouter,
  dbAdminRouter,
};
