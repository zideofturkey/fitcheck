const ApiManager = require("./ApiManager");

const { md5 } = require("common");

class AgentHubServiceManager extends ApiManager {
  constructor(request, options) {
    super(request, options);
    this.serviceCodename = "lrmwufitcheck-agenthub-service";
    this.membershipCache = new Map();
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }
}

module.exports = AgentHubServiceManager;
