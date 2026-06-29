const mainMcpRouters = require("./main");
const sessionRouter = require("./session-router");

const dataVisualizationTools = require("./data-visualization-tools");
module.exports = (headers) => {
  return {
    ...mainMcpRouters(headers),
    AuthServiceMcpController: require("./AuthServiceMcpController"),
    ...dataVisualizationTools(headers),
    ...sessionRouter,
  };
};
