const SseController = require("./SseController");

class AuthServiceSseController extends SseController {
  constructor(name, routeName, req, res) {
    super(name, routeName, req, res);
    this.projectCodename = "lrmwufitcheck";
    this.isMultiTenant = false;
    this.tenantName = "";
    this.tenantId = "";
    this.tenantCodename = null;
    this.isLoginApi = true;
  }

  createApiManager() {
    return null;
  }
}

module.exports = AuthServiceSseController;
