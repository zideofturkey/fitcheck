const { GetAgentExecutionManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class GetAgentExecutionRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("getAgentExecution", "getagentexecution", req, res);
    this.dataName = "sys_agentExecution";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetAgentExecutionManager(this._req, "rest");
  }
}

const getAgentExecution = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetAgentExecutionRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getAgentExecution;
