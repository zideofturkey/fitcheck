const { _fetchListInviteLinkManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class _fetchListInviteLinkRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("_fetchListInviteLink", "_fetchlistinvitelink", req, res);
    this.dataName = "inviteLinks";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListInviteLinkManager(this._req, "rest");
  }
}

const _fetchListInviteLink = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListInviteLinkRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListInviteLink;
