const { runMScript } = require("common");

const MealLineManager = require("./MealLineManager");

const { dbScriptListMeallines } = require("dbLayer");
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

class ListMealLinesManager extends MealLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listMealLines",
      controllerType: controllerType,
      pagination: true,
      defaultPageRowCount: 50,
      crudType: "list",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "mealLines";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.mealLogId = this.mealLogId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.mealLogId = request.query?.["mealLogId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.mealLogId = request.mcpParams?.["mealLogId"];
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    const conditionalClauses = [];
    conditionalClauses.push(
      runMScript(
        () => ({
          $and: [
            { userId: this.session.userId },
            { userId: this.session?.userId },
          ],
        }),
        { path: "services[3].businessLogic[8].whereClause.fullWhereClause" },
      ),
    );

    if (this.mealLogId === null) {
      conditionalClauses.push({ mealLogId: { $isnull: true } });
    }
    if (this.mealLogId != null) {
      conditionalClauses.push({ mealLogId: this.mealLogId });
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

  checkFilterParameter_mealLogId() {
    // array parameter values are combined to an array in express middleware

    const paramValue = this.mealLogId;
    const paramOp = this.mealLogId_op;

    // null is allowed in all types
    if (paramValue === null) return;

    // ID filter validation

    // Non-array property: validate ID values
    if (Array.isArray(paramValue)) {
      paramValue.forEach((id) => {
        if (!isValidUUID(id)) {
          throw new BadRequestError("errMsg_mealLogIdArrayHasAnInvalidID");
        }
      });
    } else {
      if (!isValidUUID(paramValue)) {
        throw new BadRequestError("errMsg_mealLogIdIsNotAValidID");
      }
    }
  }

  checkParameters() {
    // filter parameters

    if (this.mealLogId !== undefined) this.checkFilterParameter_mealLogId();
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
    return await dbScriptListMeallines(this);

    /* 
    the main operation result list is accessable in the context through 
    this.dbResult.items, this.mealLines, this.data  
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  getSortBy() {
    return [["createdAt", "ASC"]];
  }

  // Work Flow

  // Action Store
}

module.exports = ListMealLinesManager;
