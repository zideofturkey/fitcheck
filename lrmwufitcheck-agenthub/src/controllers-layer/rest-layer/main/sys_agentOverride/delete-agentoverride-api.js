const { DeleteAgentOverrideManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class DeleteAgentOverrideRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("deleteAgentOverride", "deleteagentoverride", req, res);
    this.dataName = "sys_agentOverride";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteAgentOverrideManager(this._req, "rest");
  }
}

const deleteAgentOverride = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeleteAgentOverrideRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteAgentOverride;
