const { CreateInviteLinkManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class CreateInviteLinkRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("createInviteLink", "createinvitelink", req, res);
    this.dataName = "inviteLink";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateInviteLinkManager(this._req, "rest");
  }
}

const createInviteLink = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new CreateInviteLinkRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createInviteLink;
