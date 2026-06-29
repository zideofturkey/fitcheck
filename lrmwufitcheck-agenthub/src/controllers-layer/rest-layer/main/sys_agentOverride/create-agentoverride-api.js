const { CreateAgentOverrideManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class CreateAgentOverrideRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("createAgentOverride", "createagentoverride", req, res);
    this.dataName = "sys_agentOverride";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateAgentOverrideManager(this._req, "rest");
  }
}

const createAgentOverride = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new CreateAgentOverrideRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createAgentOverride;
