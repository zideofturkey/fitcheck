const { _fetchListSys_agentConversationManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class _fetchListSys_agentConversationRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super(
      "_fetchListSys_agentConversation",
      "_fetchlistsys_agentconversation",
      req,
      res,
    );
    this.dataName = "sys_agentConversations";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListSys_agentConversationManager(this._req, "rest");
  }
}

const _fetchListSys_agentConversation = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListSys_agentConversationRestController(
    req,
    res,
  );
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListSys_agentConversation;
