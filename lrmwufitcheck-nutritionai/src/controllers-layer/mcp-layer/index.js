const nutritionaiMcpRouters = require("./nutritionai");
const sessionRouter = require("./session-router");

const dataVisualizationTools = require("./data-visualization-tools");
module.exports = (headers) => {
  return {
    ...nutritionaiMcpRouters(headers),
    NutritionAiServiceMcpController: require("./NutritionAiServiceMcpController"),
    ...dataVisualizationTools(headers),
    ...sessionRouter,
  };
};
