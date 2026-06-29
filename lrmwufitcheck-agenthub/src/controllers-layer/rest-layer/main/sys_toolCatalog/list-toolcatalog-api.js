const { ListToolCatalogManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class ListToolCatalogRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("listToolCatalog", "listtoolcatalog", req, res);
    this.dataName = "sys_toolCatalogs";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListToolCatalogManager(this._req, "rest");
  }
}

const listToolCatalog = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListToolCatalogRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listToolCatalog;
