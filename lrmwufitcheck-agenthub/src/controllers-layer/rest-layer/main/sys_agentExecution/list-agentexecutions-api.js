const { ListAgentExecutionsManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class ListAgentExecutionsRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("listAgentExecutions", "listagentexecutions", req, res);
    this.dataName = "sys_agentExecutions";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListAgentExecutionsManager(this._req, "rest");
  }
}

const listAgentExecutions = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListAgentExecutionsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listAgentExecutions;
