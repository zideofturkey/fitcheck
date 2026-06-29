const { runMScript } = require("common");

const AiCandidateMealManager = require("./AiCandidateMealManager");

const {
  dbScriptRejectCandidatemeal,
  updateAiSessionByQuery,
} = require("dbLayer");
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

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class RejectCandidateMealManager extends AiCandidateMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "rejectCandidateMeal",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiCandidateMeal";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.aiCandidateMealId = this.aiCandidateMealId;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.aiCandidateMealId = request.params?.["aiCandidateMealId"];
    this.userId = request.session?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.aiCandidateMealId = this.aiCandidateMealId ?? this.id;
    this.id = this.aiCandidateMealId;
  }

  readMcpParameters(request) {
    this.aiCandidateMealId = request.mcpParams?.["aiCandidateMealId"];
    this.userId = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.aiCandidateMealId = this.aiCandidateMealId ?? this.id;
    this.id = this.aiCandidateMealId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({
        id: this.aiCandidateMealId,
        userId: this.session.userId,
        isConfirmed: false,
        isCommitted: false,
      }),
      { path: "services[4].businessLogic[8].whereClause.fullWhereClause" },
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
      isConfirmed: false,
      isCommitted: false,
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
        ["userId", false],
        ["aiSessionId", false],
        ["committedMealLogId", false],
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
    const { getAiCandidateMealByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.aiCandidateMeal = await getAiCandidateMealByQuery(this.whereClause);
    if (!this.aiCandidateMeal) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.aiCandidateMeal;
    this.instance = this.aiCandidateMeal;
  }

  async checkInstance() {
    if (!this.aiCandidateMeal) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }

    if (!this.checkAbsolute()) {
      // Owner-field safety net: if the resolved owner field on the record is
      // null/undefined, the isOwner comparison could never succeed — either
      // the spec is missing a sessionSettings.isOwnerField property (so the
      // codegen wired the synthetic "_owner" column that does not exist), or
      // the record was written without the owner column. Throw a distinct,
      // attributable 403 instead of the misleading "wrong user" message that
      // sends operators chasing user-identity bugs that are really config bugs.
      if (this.aiCandidateMeal?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_aiCandidateMealId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_aiCandidateMealId() {
    if (this.aiCandidateMealId == null) {
      throw new BadRequestError("errMsg_aiCandidateMealIdisRequired");
    }

    if (Array.isArray(this.aiCandidateMealId)) {
      throw new BadRequestError("errMsg_aiCandidateMealIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_aiCandidateMealId(this.aiCandidateMealId)) {
      throw new BadRequestError("errMsg_aiCandidateMealIdTypeIsNotValid");
    }
  }

  checkParameterType_userId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_userId() {
    if (this.userId == null) return;

    if (Array.isArray(this.userId)) {
      throw new BadRequestError("errMsg_userIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_userId(this.userId)) {
      throw new BadRequestError("errMsg_userIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.aiCandidateMealId === "") this.aiCandidateMealId = null;
    this.checkParameter_aiCandidateMealId();

    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.aiCandidateMeal?.userId === this.session.userId;
  }

  checkAbsolute() {
    if (this.absoluteAuth !== null) return this.absoluteAuth;

    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole("superAdmin")) {
      this.absoluteAuth = true;
      return true;
    }
    this.absoluteAuth = false;
    return false;
  }

  async executeMainOperation() {
    return await dbScriptRejectCandidatemeal(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.aiCandidateMeal, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterMainUpdateOperation() {
    try {
      await this.updateSessionStateFailed();
    } catch (err) {
      console.log("updateSessionStateFailed Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Update the parent aiSession to failed state when the candidate meal is
   ** rejected
   ***********************************************************************/
  async updateSessionStateFailed() {
    // Aggregated Update Operation on childObject aiSession

    const params = {
      sessionState: "failed",
      finalResponseText: "Kullanıcı öğünü reddetti.",
    };
    const userQuery = runMScript(
      () => ({ id: this.aiCandidateMeal.aiSessionId }),
      {
        path: "services[4].businessLogic[8].actions.updateCrudActions[0].whereClause",
      },
    );

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);

    const result = await updateAiSessionByQuery(params, query, this);
    if (!result) return null;

    const resultArray = Array.isArray(result) ? result : [result];
    // if updated record is in main data update main data
    if (this.dbResult) {
      for (const item of resultArray) {
        if (item.id == this.dbResult.id) {
          Object.assign(this.dbResult, item);
          this.aiCandidateMeal = this.dbResult;
        }
      }
    }
    if (resultArray.length == 0) return null;
    if (resultArray.length == 1) return resultArray[0];
    return resultArray;
  }
}

module.exports = RejectCandidateMealManager;
