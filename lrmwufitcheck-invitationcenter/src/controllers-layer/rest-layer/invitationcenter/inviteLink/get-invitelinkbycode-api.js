const { GetInviteLinkByCodeManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class GetInviteLinkByCodeRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("getInviteLinkByCode", "getinvitelinkbycode", req, res);
    this.dataName = "inviteLink";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetInviteLinkByCodeManager(this._req, "rest");
  }
}

const getInviteLinkByCode = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = false;
  const controller = new GetInviteLinkByCodeRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getInviteLinkByCode;
