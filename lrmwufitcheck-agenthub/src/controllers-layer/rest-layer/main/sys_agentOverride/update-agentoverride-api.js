const { UpdateAgentOverrideManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class UpdateAgentOverrideRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("updateAgentOverride", "updateagentoverride", req, res);
    this.dataName = "sys_agentOverride";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateAgentOverrideManager(this._req, "rest");
  }
}

const updateAgentOverride = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new UpdateAgentOverrideRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateAgentOverride;
