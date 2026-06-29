const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const InvitationCenterServiceManager = require("../../service-manager/InvitationCenterServiceManager");

/* Base Class For the Crud Routes Of DbObject InviteLink */
class InviteLinkManager extends InvitationCenterServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "inviteLink";
    this.modelName = "InviteLink";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = InviteLinkManager;
