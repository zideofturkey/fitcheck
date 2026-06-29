const AgentHubServiceRestController = require("./AgentHubServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new AgentHubServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
