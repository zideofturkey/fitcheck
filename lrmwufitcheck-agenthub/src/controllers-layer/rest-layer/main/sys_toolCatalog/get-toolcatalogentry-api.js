const { GetToolCatalogEntryManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class GetToolCatalogEntryRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("getToolCatalogEntry", "gettoolcatalogentry", req, res);
    this.dataName = "sys_toolCatalog";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetToolCatalogEntryManager(this._req, "rest");
  }
}

const getToolCatalogEntry = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetToolCatalogEntryRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getToolCatalogEntry;
