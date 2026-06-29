const { _fetchListSys_toolCatalogManager } = require("apiLayer");

const AgentHubServiceRestController = require("../../AgentHubServiceRestController");

class _fetchListSys_toolCatalogRestController extends AgentHubServiceRestController {
  constructor(req, res) {
    super("_fetchListSys_toolCatalog", "_fetchlistsys_toolcatalog", req, res);
    this.dataName = "sys_toolCatalogs";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListSys_toolCatalogManager(this._req, "rest");
  }
}

const _fetchListSys_toolCatalog = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListSys_toolCatalogRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListSys_toolCatalog;
