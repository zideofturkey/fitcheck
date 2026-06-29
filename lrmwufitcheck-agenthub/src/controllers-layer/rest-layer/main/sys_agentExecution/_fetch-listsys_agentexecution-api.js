const { _fetchListSys_agentExecutionManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class _fetchListSys_agentExecutionRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super(
      "_fetchListSys_agentExecution",
      "_fetchlistsys_agentexecution",
      req,
      res,
    );
    this.dataName = "sys_agentExecutions";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListSys_agentExecutionManager(this._req, "rest");
  }
}

const _fetchListSys_agentExecution = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListSys_agentExecutionRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListSys_agentExecution;
