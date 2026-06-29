const ApiManager = require("./ApiManager");

const { md5 } = require("common");

class AuthServiceManager extends ApiManager {
  constructor(request, options) {
    super(request, options);
    this.serviceCodename = "lrmwufitcheck-auth-service";
    this.membershipCache = new Map();
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }
}

module.exports = AuthServiceManager;
