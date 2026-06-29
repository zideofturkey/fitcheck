const mainMcpRouters = require("./main");
const sessionRouter = require("./session-router");

const dataVisualizationTools = require("./data-visualization-tools");
module.exports = (headers) => {
  return {
    ...mainMcpRouters(headers),
    AgentHubServiceMcpController: require("./AgentHubServiceMcpController"),
    ...dataVisualizationTools(headers),
    ...sessionRouter,
  };
};
