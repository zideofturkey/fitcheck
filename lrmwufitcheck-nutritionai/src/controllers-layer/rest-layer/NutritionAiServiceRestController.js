const RestController = require("./RestController");

class NutritionAiServiceRestController extends RestController {
  constructor(name, routeName, req, res) {
    super(name, routeName, req, res);
    this.projectCodename = "lrmwufitcheck";
    this.isMultiTenant = false;
    this.tenantName = "";
    this.tenantId = "";
    this.tenantCodename = null;
    this.isLoginApi = false;
  }

  createApiManager() {
    return null;
  }
}

module.exports = NutritionAiServiceRestController;
