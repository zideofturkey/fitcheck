const { ConsumeInviteLinkManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class ConsumeInviteLinkRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("consumeInviteLink", "consumeinvitelink", req, res);
    this.dataName = "inviteLink";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new ConsumeInviteLinkManager(this._req, "rest");
  }
}

const consumeInviteLink = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ConsumeInviteLinkRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = consumeInviteLink;
