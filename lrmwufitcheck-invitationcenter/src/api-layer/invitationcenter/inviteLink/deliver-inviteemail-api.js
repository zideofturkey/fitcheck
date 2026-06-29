const { runMScript } = require("common");

const InviteLinkManager = require("./InviteLinkManager");

const {
  dbScriptDeliverInviteemail,
  createInviteAudit,
  getInviteLinkByQuery,
} = require("dbLayer");
const { ElasticIndexer, ServicePublisher } = require("serviceCommon");
const {
  hexaLogger,
  PaymentGateError,
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  isValidObjectId,
  isValidUUID,
  getRedisData,
} = require("common");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class DeliverInviteEmailManager extends InviteLinkManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deliverInviteEmail",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "inviteLink";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inviteLinkId = this.inviteLinkId;
    jsonObj.ownerUserId = this.ownerUserId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.inviteLinkId = request.params?.["inviteLinkId"];
    this.ownerUserId = request.session?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.inviteLinkId = this.inviteLinkId ?? this.id;
    this.id = this.inviteLinkId;
  }

  readMcpParameters(request) {
    this.inviteLinkId = request.mcpParams?.["inviteLinkId"];
    this.ownerUserId = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.inviteLinkId = this.inviteLinkId ?? this.id;
    this.id = this.inviteLinkId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.inviteLinkId, inviteState: "active" }),
      { path: "services[1].businessLogic[3].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  // data clause methods

  async buildDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      deliveryRequestedAt: runMScript(() => LIB.now(), {
        path: "services[1].businessLogic[3].dataClauseItems[0].value",
      }),
    };

    // Resolve any Promise-valued fields. Designers should normally write
    // `await LIB.xx()` in MScript when the call is async, but if they
    // forget the `await`, runMScript returns the unresolved Promise and
    // it lands here. Awaiting Promise values keeps the row write safe;
    // sync values pass through untouched (no microtask cost).
    for (const _dcKey of Object.keys(dataClause)) {
      const _dcVal = dataClause[_dcKey];
      if (_dcVal && typeof _dcVal.then === "function") {
        dataClause[_dcKey] = await _dcVal;
      }
    }

    // ID-typed dataClause fields strict-validation
    {
      const { isValidUUID } = require("common");
      const _idValidator = isValidUUID;
      const _idFieldsAndIsArray = [
        ["ownerUserId", false],
        ["registeredUserId", false],
      ];
      for (const [_idKey, _isArr] of _idFieldsAndIsArray) {
        const _idVal = dataClause[_idKey];
        if (_idVal == null) continue; // nullable / unset ID columns OK
        if (_isArr) {
          if (!Array.isArray(_idVal)) {
            throw new BadRequestError(`errMsg_${_idKey}MustBeAnArray`);
          }
          for (const _item of _idVal) {
            if (_item == null) continue;
            if (!_idValidator(_item)) {
              throw new BadRequestError(
                `errMsg_${_idKey}ArrayHasAnInvalidItem`,
              );
            }
          }
        } else {
          if (!_idValidator(_idVal)) {
            throw new BadRequestError(`errMsg_${_idKey}TypeIsNotValid`);
          }
        }
      }
    }

    return dataClause;
  }

  async fetchInstance() {
    const { getInviteLinkByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.inviteLink = await getInviteLinkByQuery(this.whereClause);
    if (!this.inviteLink) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.inviteLink;
    this.instance = this.inviteLink;
  }

  async checkInstance() {
    if (!this.inviteLink) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_inviteLinkId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_inviteLinkId() {
    if (this.inviteLinkId == null) {
      throw new BadRequestError("errMsg_inviteLinkIdisRequired");
    }

    if (Array.isArray(this.inviteLinkId)) {
      throw new BadRequestError("errMsg_inviteLinkIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_inviteLinkId(this.inviteLinkId)) {
      throw new BadRequestError("errMsg_inviteLinkIdTypeIsNotValid");
    }
  }

  checkParameterType_ownerUserId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_ownerUserId() {
    if (this.ownerUserId == null) return;

    if (Array.isArray(this.ownerUserId)) {
      throw new BadRequestError("errMsg_ownerUserIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_ownerUserId(this.ownerUserId)) {
      throw new BadRequestError("errMsg_ownerUserIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.inviteLinkId === "") this.inviteLinkId = null;
    this.checkParameter_inviteLinkId();

    if (this.ownerUserId === "") this.ownerUserId = null;
    this.checkParameter_ownerUserId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.inviteLink?.ownerUserId === this.session.userId;
  }

  checkAbsolute() {
    if (this.absoluteAuth !== null) return this.absoluteAuth;

    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole("admin") || this.userHasRole("superAdmin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptDeliverInviteemail(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.inviteLink, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      await this.checkActiveWithEmail();
    } catch (err) {
      console.log("checkActiveWithEmail Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.inviteLinkRecord = await this.fetchInviteLinkRecord();
    } catch (err) {
      console.log("fetchInviteLinkRecord Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainUpdateOperation() {
    try {
      await this.publishDeliveryEvent();
    } catch (err) {
      console.log("publishDeliveryEvent Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.createAuditOnDeliver();
    } catch (err) {
      console.log("createAuditOnDeliver Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Insert an inviteAudit row recording the 'delivered' lifecycle event
   ***********************************************************************/
  async createAuditOnDeliver() {
    // Aggregated Update Operation on childObject inviteAudit

    const params = {
      inviteLinkId: runMScript(() => this.inviteLinkId, {
        path: "services[1].businessLogic[3].actions.createCrudActions[0].dataClause[0].dataValue",
      }),
      eventType: "delivered",
      eventAt: runMScript(() => LIB.now(), {
        path: "services[1].businessLogic[3].actions.createCrudActions[0].dataClause[2].dataValue",
      }),
      actorUserId: runMScript(() => this.session.userId, {
        path: "services[1].businessLogic[3].actions.createCrudActions[0].dataClause[3].dataValue",
      }),
      relatedEmail: runMScript(() => this.inviteLinkRecord.invitedEmail, {
        path: "services[1].businessLogic[3].actions.createCrudActions[0].dataClause[4].dataValue",
      }),
    };

    return await createInviteAudit(params, this);
  }

  /***********************************************************************
   ** Verify the invite link is active and has an invitedEmail before
   ** delivering
   ***********************************************************************/

  async checkActiveWithEmail() {
    let isValid;
    try {
      isValid = runMScript(
        () =>
          this.inviteLink &&
          this.inviteLink.inviteState === "active" &&
          this.inviteLink.invitedEmail,
        {
          path: "services[1].businessLogic[3].actions.validationActions[0].validationScript",
        },
      );
      // Async-safety: when the validation script calls an async LIB
      // function without `await` (e.g. `LIB.validateGroupMembership(...)`
      // instead of `await LIB.validateGroupMembership(...)`), the
      // expression evaluates to an unresolved Promise. Without this pass,
      // the Promise is stored in isValid/isError, the `if (!isValid)`
      // check below sees a truthy thenable (so passes), and the eventual
      // rejection surfaces as an unhandled rejection → 500 instead of the
      // intended typed 4xx. Mirrors the dataClause Promise-resolve pass
      // in inc.dataclausemethod.ejs.
      if (isValid && typeof isValid.then === "function") {
        isValid = await isValid;
      }
    } catch (err) {
      // Designer-emitted 4xx throws (BadRequestError, ForbiddenError,
      // NotFoundError, ConflictError, UnprocessableEntityError, …) propagate
      // verbatim — the MScript intentionally surfaced a typed business
      // validation failure and its message belongs in the response. Only
      // wrap genuinely unexpected exceptions (TypeError, ReferenceError,
      // null-deref, etc.) as 500 so operators can tell "rule rejected
      // input" from "the validation itself crashed".
      if (
        err &&
        typeof err.status === "number" &&
        err.status >= 400 &&
        err.status < 500
      ) {
        throw err;
      }
      throw new HttpServerError(
        `Validation 'checkActiveWithEmail' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new BadRequestError(
        "Invite link must be active and have an invitedEmail to deliver",
      );
    }
    return isValid;
  }

  /***********************************************************************
   ** Fetch the full inviteLink record to use in the Kafka event payload
   ***********************************************************************/
  async fetchInviteLinkRecord() {
    // Fetch Object on childObject inviteLink

    const userQuery = {
      id: runMScript(() => this.inviteLinkId, {
        path: "services[1].businessLogic[3].actions.fetchObjectActions[0].matchValue",
      }),
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getInviteLinkByQuery(scriptQuery);

    if (!data) {
      throw new NotFoundError("errMsg_FethcedObjectNotFound:inviteLink");
    }

    return data;
  }

  /***********************************************************************
   ** Publish a Kafka event for the notification service to send the invite
   ** email
   ***********************************************************************/
  async publishDeliveryEvent() {
    const message = {
      inviteLinkId: this.inviteLinkRecord.id,
      inviteCode: this.inviteLinkRecord.inviteCode,
      invitedEmail: this.inviteLinkRecord.invitedEmail,
      usageMode: this.inviteLinkRecord.usageMode,
      usageLimit: this.inviteLinkRecord.usageLimit,
    };

    // Publish event to the configured topic
    const _publisher = new ServicePublisher(
      "invitationCenter.inviteLinkDelivered",
      message,
      this.session,
      this.requestId,
    );
    await _publisher.publish();
    return true;
  }
}

module.exports = DeliverInviteEmailManager;
