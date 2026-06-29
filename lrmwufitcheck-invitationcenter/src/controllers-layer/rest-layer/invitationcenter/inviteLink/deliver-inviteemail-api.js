const { DeliverInviteEmailManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class DeliverInviteEmailRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("deliverInviteEmail", "deliverinviteemail", req, res);
    this.dataName = "inviteLink";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new DeliverInviteEmailManager(this._req, "rest");
  }
}

const deliverInviteEmail = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new DeliverInviteEmailRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deliverInviteEmail;
