const ApiManager = require("./ApiManager");

const { md5 } = require("common");

class InvitationCenterServiceManager extends ApiManager {
  constructor(request, options) {
    super(request, options);
    this.serviceCodename = "lrmwufitcheck-invitationcenter-service";
    this.membershipCache = new Map();
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }
}

module.exports = InvitationCenterServiceManager;
