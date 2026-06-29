const AiCandidateMealManager = require("./AiCandidateMealManager");

const {
  dbScript_fetchListaicandidatemeal,
  getAiSessionListByQuery,
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
  convertUserQueryToSequelizeQuery,
} = require("common");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class _fetchListAiCandidateMealManager extends AiCandidateMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListAiCandidateMeal",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiCandidateMeals";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.aiSessionId = this.aiSessionId;
    jsonObj.isConfirmed = this.isConfirmed;
    jsonObj.isCommitted = this.isCommitted;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;

    const hasRole = this.userHasRole("superAdmin") || this.userHasRole("admin");
    if (!hasRole) {
      throw new ForbiddenError("errMsg_UserRoleRequired:[superAdmin , admin]");
    }
  }

  readRestParameters(request) {
    this.userId = request.query?.["userId"];
    this.aiSessionId = request.query?.["aiSessionId"];
    this.isConfirmed = request.query?.["isConfirmed"];
    this.isCommitted = request.query?.["isCommitted"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams?.["userId"];
    this.aiSessionId = request.mcpParams?.["aiSessionId"];
    this.isConfirmed = request.mcpParams?.["isConfirmed"];
    this.isCommitted = request.mcpParams?.["isCommitted"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];

    if (this.userId === null) {
      conditionalClauses.push({ userId: { $isnull: true } });
    }
    if (this.userId != null) {
      conditionalClauses.push({ userId: this.userId });
    }
    if (this.aiSessionId === null) {
      conditionalClauses.push({ aiSessionId: { $isnull: true } });
    }
    if (this.aiSessionId != null) {
      conditionalClauses.push({ aiSessionId: this.aiSessionId });
    }

    return conditionalClauses.length > 1
      ? { $and: conditionalClauses }
      : !conditionalClauses.length
        ? null
        : conditionalClauses[0];

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  checkFilterParameter_userId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.userId;
    const paramOp = this.userId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    // Non-array property: validate ID values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError("errMsg_userIdArrayHasAnInvalidID");
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_userIdIsNotAValidID");
      }
    }
  }

  checkFilterParameter_aiSessionId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.aiSessionId;
    const paramOp = this.aiSessionId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    // Non-array property: validate ID values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError("errMsg_aiSessionIdArrayHasAnInvalidID");
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_aiSessionIdIsNotAValidID");
      }
    }
  }

  checkFilterParameter_isConfirmed() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.isConfirmed;
    const paramOp = this.isConfirmed_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Boolean filter validation
    // Boolean filtering on array properties is not supported (always uses non-array logic)
    if (Array.isArray(paramValue)) {
      throw new BadRequestError(
        "errMsg_isConfirmedArrayNotSupportedForBooleanFilters",
      );
    }
    if (typeof paramValue !== "boolean") {
      throw new BadRequestError("errMsg_isConfirmedIsNotAValidBoolean");
    }
  }

  checkFilterParameter_isCommitted() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.isCommitted;
    const paramOp = this.isCommitted_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // Boolean filter validation
    // Boolean filtering on array properties is not supported (always uses non-array logic)
    if (Array.isArray(paramValue)) {
      throw new BadRequestError(
        "errMsg_isCommittedArrayNotSupportedForBooleanFilters",
      );
    }
    if (typeof paramValue !== "boolean") {
      throw new BadRequestError("errMsg_isCommittedIsNotAValidBoolean");
    }
  }

  checkParameters() {
    // filter parameters

    if (this.userId !== undefined) this.checkFilterParameter_userId();

    if (this.aiSessionId !== undefined) this.checkFilterParameter_aiSessionId();

    if (this.isConfirmed !== undefined) this.checkFilterParameter_isConfirmed();

    if (this.isCommitted !== undefined) this.checkFilterParameter_isCommitted();
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

  async fetchJoined_session_(listaicandidatemeal) {
    // relation to aiSession

    if (!listaicandidatemeal) {
      console.log(
        "listaicandidatemeal is null, so fetchJoined_listaicandidatemeal is ommitted",
      );
      return;
    }

    const foreignKey = listaicandidatemeal.map((item) => item.aiSessionId);

    const query = { id: { $in: foreignKey } };

    // Local database query

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getAiSessionListByQuery(scriptQuery)) ?? [];

    const session_List = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["userId"] = item["userId"];
      newItem["sessionType"] = item["sessionType"];
      newItem["inputText"] = item["inputText"];
      newItem["detectedLanguage"] = item["detectedLanguage"];
      newItem["sessionState"] = item["sessionState"];
      newItem["confidenceScore"] = item["confidenceScore"];
      newItem["finalResponseText"] = item["finalResponseText"];
      return newItem;
    });

    for (const item of session_List) {
      const mainItems = listaicandidatemeal.filter(
        (mItem) => mItem.aiSessionId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.session_ = item;
      }
    }
  }

  async fetchJoinsToMainObject(listaicandidatemeal) {
    await this.fetchJoined_session_(listaicandidatemeal);
  }

  async executeMainOperation() {
    return await dbScript_fetchListaicandidatemeal(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.aiCandidateMeals, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["createdAt", "DESC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = _fetchListAiCandidateMealManager;
