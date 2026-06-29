const { ListInviteAuditsManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class ListInviteAuditsRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("listInviteAudits", "listinviteaudits", req, res);
    this.dataName = "inviteAudits";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListInviteAuditsManager(this._req, "rest");
  }
}

const listInviteAudits = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new ListInviteAuditsRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listInviteAudits;
