const { ListAgentChatsManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class ListAgentChatsRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("listAgentChats", "listagentchats", req, res);
    this.dataName = "sys_agentConversations";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListAgentChatsManager(this._req, "rest");
  }
}

const listAgentChats = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListAgentChatsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listAgentChats;
