const { RevokeInviteLinkManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class RevokeInviteLinkRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("revokeInviteLink", "revokeinvitelink", req, res);
    this.dataName = "inviteLink";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new RevokeInviteLinkManager(this._req, "rest");
  }
}

const revokeInviteLink = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new RevokeInviteLinkRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = revokeInviteLink;
