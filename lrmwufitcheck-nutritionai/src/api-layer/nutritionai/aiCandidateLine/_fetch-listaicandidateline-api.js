const AiCandidateLineManager = require("./AiCandidateLineManager");

const {
  dbScript_fetchListaicandidateline,
  getAiCandidateMealListByQuery,
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

class _fetchListAiCandidateLineManager extends AiCandidateLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "_fetchListAiCandidateLine",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 25,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiCandidateLines";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.aiCandidateMealId = this.aiCandidateMealId;
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
    this.aiCandidateMealId = request.query?.["aiCandidateMealId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams?.["userId"];
    this.aiCandidateMealId = request.mcpParams?.["aiCandidateMealId"];
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
    if (this.aiCandidateMealId === null) {
      conditionalClauses.push({ aiCandidateMealId: { $isnull: true } });
    }
    if (this.aiCandidateMealId != null) {
      conditionalClauses.push({ aiCandidateMealId: this.aiCandidateMealId });
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

  checkFilterParameter_aiCandidateMealId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.aiCandidateMealId;
    const paramOp = this.aiCandidateMealId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    // Non-array property: validate ID values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError(
            "errMsg_aiCandidateMealIdArrayHasAnInvalidID",
          );
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_aiCandidateMealIdIsNotAValidID");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.userId !== undefined) this.checkFilterParameter_userId();

    if (this.aiCandidateMealId !== undefined)
      this.checkFilterParameter_aiCandidateMealId();
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

  async fetchJoined_candidateMeal(listaicandidateline) {
    // relation to aiCandidateMeal

    if (!listaicandidateline) {
      console.log(
        "listaicandidateline is null, so fetchJoined_listaicandidateline is ommitted",
      );
      return;
    }

    const foreignKey = listaicandidateline.map(
      (item) => item.aiCandidateMealId,
    );

    const query = { id: { $in: foreignKey } };

    // Local database query

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getAiCandidateMealListByQuery(scriptQuery)) ?? [];

    const candidateMealList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["userId"] = item["userId"];
      newItem["aiSessionId"] = item["aiSessionId"];
      newItem["proposedMealDate"] = item["proposedMealDate"];
      newItem["proposedMealTime"] = item["proposedMealTime"];
      newItem["proposedSlotName"] = item["proposedSlotName"];
      newItem["candidateSource"] = item["candidateSource"];
      newItem["warningText"] = item["warningText"];
      newItem["confirmationRequired"] = item["confirmationRequired"];
      newItem["isConfirmed"] = item["isConfirmed"];
      newItem["isCommitted"] = item["isCommitted"];
      newItem["totalCalories"] = item["totalCalories"];
      newItem["totalProtein"] = item["totalProtein"];
      newItem["totalCarbohydrates"] = item["totalCarbohydrates"];
      newItem["totalFat"] = item["totalFat"];
      newItem["totalSugar"] = item["totalSugar"];
      newItem["totalFiber"] = item["totalFiber"];
      newItem["committedMealLogId"] = item["committedMealLogId"];
      return newItem;
    });

    for (const item of candidateMealList) {
      const mainItems = listaicandidateline.filter(
        (mItem) => mItem.aiCandidateMealId == item.id,
      );

      for (const mainItem of mainItems) {
        mainItem.candidateMeal = item;
      }
    }
  }

  async fetchJoinsToMainObject(listaicandidateline) {
    await this.fetchJoined_candidateMeal(listaicandidateline);
  }

  async executeMainOperation() {
    return await dbScript_fetchListaicandidateline(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.aiCandidateLines, this.data  
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

module.exports = _fetchListAiCandidateLineManager;
