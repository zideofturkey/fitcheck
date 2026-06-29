const { runMScript } = require("common");

const InviteLinkManager = require("./InviteLinkManager");

const { dbScriptConsumeInvitelink, createInviteAudit } = require("dbLayer");
const { ElasticIndexer } = require("serviceCommon");
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
const { InvitelinkConsumedPublisher } = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class ConsumeInviteLinkManager extends InviteLinkManager {
  constructor(request, controllerType) {
    super(request, {
      name: "consumeInviteLink",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: true,
    });

    // Read M2M token from request (extracted at request analysis level)
    this.M2MToken = request.M2MToken;

    this.dataName = "inviteLink";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.inviteLinkId = this.inviteLinkId;
    jsonObj.registeredUserId = this.registeredUserId;
    jsonObj.relatedEmail = this.relatedEmail;
    jsonObj.ownerUserId = this.ownerUserId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.inviteLinkId = request.params?.["inviteLinkId"];
    this.registeredUserId = request.body?.["registeredUserId"];
    this.relatedEmail = request.body?.["relatedEmail"];
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
    this.registeredUserId = request.mcpParams?.["registeredUserId"];
    this.relatedEmail = request.mcpParams?.["relatedEmail"];
    this.ownerUserId = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.inviteLinkId = this.inviteLinkId ?? this.id;
    this.id = this.inviteLinkId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ id: this.inviteLinkId }), {
      path: "services[1].businessLogic[5].whereClause.fullWhereClause",
    });

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
      registeredUserId: runMScript(() => this.registeredUserId, {
        path: "services[1].businessLogic[5].dataClauseItems[0].value",
      }),
      inviteState: "consumed",
      lastUsedAt: runMScript(() => LIB.now(), {
        path: "services[1].businessLogic[5].dataClauseItems[2].value",
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

  checkParameterType_registeredUserId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_registeredUserId() {
    if (this.registeredUserId == null) {
      throw new BadRequestError("errMsg_registeredUserIdisRequired");
    }

    if (Array.isArray(this.registeredUserId)) {
      throw new BadRequestError("errMsg_registeredUserIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_registeredUserId(this.registeredUserId)) {
      throw new BadRequestError("errMsg_registeredUserIdTypeIsNotValid");
    }
  }

  checkParameter_relatedEmail() {
    if (this.relatedEmail == null) return;

    if (Array.isArray(this.relatedEmail)) {
      throw new BadRequestError("errMsg_relatedEmailMustNotBeAnArray");
    }

    // Parameter Type: String
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

    if (this.registeredUserId === "") this.registeredUserId = null;
    this.checkParameter_registeredUserId();

    this.checkParameter_relatedEmail();

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
    return await dbScriptConsumeInvitelink(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.inviteLink, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    InvitelinkConsumedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      await this.checkInviteLinkExists();
    } catch (err) {
      console.log("checkInviteLinkExists Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainUpdateOperation() {
    try {
      await this.createAuditOnConsume();
    } catch (err) {
      console.log("createAuditOnConsume Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Insert an inviteAudit row recording the 'consumed' lifecycle event
   ***********************************************************************/
  async createAuditOnConsume() {
    // Aggregated Update Operation on childObject inviteAudit

    const params = {
      inviteLinkId: runMScript(() => this.inviteLinkId, {
        path: "services[1].businessLogic[5].actions.createCrudActions[0].dataClause[0].dataValue",
      }),
      eventType: "consumed",
      eventAt: runMScript(() => LIB.now(), {
        path: "services[1].businessLogic[5].actions.createCrudActions[0].dataClause[2].dataValue",
      }),
      actorUserId: runMScript(() => this.session.userId, {
        path: "services[1].businessLogic[5].actions.createCrudActions[0].dataClause[3].dataValue",
      }),
      relatedEmail: runMScript(() => this.relatedEmail, {
        path: "services[1].businessLogic[5].actions.createCrudActions[0].dataClause[4].dataValue",
      }),
    };

    return await createInviteAudit(params, this);
  }

  /***********************************************************************
   ** Verify the invite link record exists
   ***********************************************************************/

  async checkInviteLinkExists() {
    let isValid;
    try {
      isValid = runMScript(
        () => this.inviteLink !== null && this.inviteLink !== undefined,
        {
          path: "services[1].businessLogic[5].actions.validationActions[0].validationScript",
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
        `Validation 'checkInviteLinkExists' script failed: ${err.message}`,
        err,
      );
    }

    if (!isValid) {
      throw new NotFoundError("Invite link not found");
    }
    return isValid;
  }
}

module.exports = ConsumeInviteLinkManager;
