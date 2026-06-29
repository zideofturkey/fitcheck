const mealTrackerMcpRouters = require("./mealTracker");
const sessionRouter = require("./session-router");

const dataVisualizationTools = require("./data-visualization-tools");
module.exports = (headers) => {
  return {
    ...mealTrackerMcpRouters(headers),
    MealTrackerServiceMcpController: require("./MealTrackerServiceMcpController"),
    ...dataVisualizationTools(headers),
    ...sessionRouter,
  };
};
