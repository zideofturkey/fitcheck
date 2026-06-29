const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const AgentHubServiceManager = require("../../service-manager/AgentHubServiceManager");

/* Base Class For the Crud Routes Of DbObject Sys_agentExecution */
class Sys_agentExecutionManager extends AgentHubServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "sys_agentExecution";
    this.modelName = "Sys_agentExecution";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = Sys_agentExecutionManager;
