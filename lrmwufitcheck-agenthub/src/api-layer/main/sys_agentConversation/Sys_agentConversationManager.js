const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const AgentHubServiceManager = require("../../service-manager/AgentHubServiceManager");

/* Base Class For the Crud Routes Of DbObject Sys_agentConversation */
class Sys_agentConversationManager extends AgentHubServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "sys_agentConversation";
    this.modelName = "Sys_agentConversation";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = Sys_agentConversationManager;
