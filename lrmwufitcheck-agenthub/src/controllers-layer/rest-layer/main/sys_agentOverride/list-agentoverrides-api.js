const { ListAgentOverridesManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class ListAgentOverridesRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("listAgentOverrides", "listagentoverrides", req, res);
    this.dataName = "sys_agentOverrides";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListAgentOverridesManager(this._req, "rest");
  }
}

const listAgentOverrides = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListAgentOverridesRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listAgentOverrides;
