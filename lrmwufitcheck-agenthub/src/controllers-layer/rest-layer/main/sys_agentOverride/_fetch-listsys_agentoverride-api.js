const { _fetchListSys_agentOverrideManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class _fetchListSys_agentOverrideRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super(
      "_fetchListSys_agentOverride",
      "_fetchlistsys_agentoverride",
      req,
      res,
    );
    this.dataName = "sys_agentOverrides";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListSys_agentOverrideManager(this._req, "rest");
  }
}

const _fetchListSys_agentOverride = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListSys_agentOverrideRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListSys_agentOverride;
