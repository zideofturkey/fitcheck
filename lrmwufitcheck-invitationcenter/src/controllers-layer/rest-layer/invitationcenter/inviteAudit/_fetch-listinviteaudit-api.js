const { _fetchListInviteAuditManager } = require("apiLayer");

const InvitationCenterServiceRestController = require("../../InvitationCenterServiceRestController");

class _fetchListInviteAuditRestController extends InvitationCenterServiceRestController {
  constructor(req, res) {
    super("_fetchListInviteAudit", "_fetchlistinviteaudit", req, res);
    this.dataName = "inviteAudits";
    this.crudType = "list";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new _fetchListInviteAuditManager(this._req, "rest");
  }
}

const _fetchListInviteAudit = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new _fetchListInviteAuditRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = _fetchListInviteAudit;
