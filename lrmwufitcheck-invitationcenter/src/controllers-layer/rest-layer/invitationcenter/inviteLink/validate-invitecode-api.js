const { ValidateInviteCodeManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class ValidateInviteCodeRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("validateInviteCode", "validateinvitecode", req, res);
    this.dataName = "inviteLink";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new ValidateInviteCodeManager(this._req, "rest");
  }
}

const validateInviteCode = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = false;
  const controller = new ValidateInviteCodeRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = validateInviteCode;
