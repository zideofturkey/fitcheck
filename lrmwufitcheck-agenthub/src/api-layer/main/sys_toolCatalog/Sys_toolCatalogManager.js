const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const AgentHubServiceManager = require("../../service-manager/AgentHubServiceManager");

/* Base Class For the Crud Routes Of DbObject Sys_toolCatalog */
class Sys_toolCatalogManager extends AgentHubServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "sys_toolCatalog";
    this.modelName = "Sys_toolCatalog";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = Sys_toolCatalogManager;
