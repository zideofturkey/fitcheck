const nutritionlibraryMcpRouters = require("./nutritionlibrary");
const sessionRouter = require("./session-router");

const dataVisualizationTools = require("./data-visualization-tools");
module.exports = (headers) => {
  return {
    ...nutritionlibraryMcpRouters(headers),
    NutritionLibraryServiceMcpController: require("./NutritionLibraryServiceMcpController"),
    ...dataVisualizationTools(headers),
    ...sessionRouter,
  };
};
