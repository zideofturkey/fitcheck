const { runMScript } = require("common");

const AiCandidateMealManager = require("./AiCandidateMealManager");

const { dbScriptListAicandidatemeals } = require("dbLayer");
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

class ListAiCandidateMealsManager extends AiCandidateMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listAiCandidateMeals",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 20,
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
    conditionalClauses.push(
      runMScript(() => ({ userId: this.session.userId }), {
        path: "services[4].businessLogic[6].whereClause.fullWhereClause",
      }),
    );

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

  async executeMainOperation() {
    return await dbScriptListAicandidatemeals(this);

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

module.exports = ListAiCandidateMealsManager;
