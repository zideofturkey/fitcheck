const RestController = require("./RestController");

class MealTrackerServiceRestController extends RestController {
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

module.exports = MealTrackerServiceRestController;
