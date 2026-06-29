const { GetAgentChatMessagesManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class GetAgentChatMessagesRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("getAgentChatMessages", "getagentchatmessages", req, res);
    this.dataName = "sys_agentConversation";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetAgentChatMessagesManager(this._req, "rest");
  }
}

const getAgentChatMessages = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetAgentChatMessagesRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getAgentChatMessages;
