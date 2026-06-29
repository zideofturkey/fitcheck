const { GetInviteLinkManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class GetInviteLinkRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("getInviteLink", "getinvitelink", req, res);
    this.dataName = "inviteLink";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetInviteLinkManager(this._req, "rest");
  }
}

const getInviteLink = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new GetInviteLinkRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getInviteLink;
