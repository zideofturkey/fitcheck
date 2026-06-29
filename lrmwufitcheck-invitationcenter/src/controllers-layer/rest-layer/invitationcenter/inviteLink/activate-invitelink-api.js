const { ActivateInviteLinkManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class ActivateInviteLinkRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("activateInviteLink", "activateinvitelink", req, res);
    this.dataName = "inviteLink";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new ActivateInviteLinkManager(this._req, "rest");
  }
}

const activateInviteLink = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ActivateInviteLinkRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = activateInviteLink;
