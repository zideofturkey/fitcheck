const { GetAgentOverrideManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class GetAgentOverrideRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("getAgentOverride", "getagentoverride", req, res);
    this.dataName = "sys_agentOverride";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetAgentOverrideManager(this._req, "rest");
  }
}

const getAgentOverride = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetAgentOverrideRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getAgentOverride;
