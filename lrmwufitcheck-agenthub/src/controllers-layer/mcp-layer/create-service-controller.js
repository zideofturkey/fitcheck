const AgentHubServiceMcpController = require("./AgentHubServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new AgentHubServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
