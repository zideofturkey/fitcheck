const { ListInviteLinksManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class ListInviteLinksRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("listInviteLinks", "listinvitelinks", req, res);
    this.dataName = "inviteLinks";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListInviteLinksManager(this._req, "rest");
  }
}

const listInviteLinks = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListInviteLinksRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listInviteLinks;
