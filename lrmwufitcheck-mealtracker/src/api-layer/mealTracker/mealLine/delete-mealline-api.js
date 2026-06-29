const { runMScript } = require("common");

const MealLineManager = require("./MealLineManager");

const {
  dbScriptDeleteMealline,
  getMealLineByQuery,
  getMealLogByQuery,
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

class DeleteMealLineManager extends MealLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteMealLine",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "mealLine";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.mealLineId = this.mealLineId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.mealLineId = request.params?.["mealLineId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.mealLineId = this.mealLineId ?? this.id;
    this.id = this.mealLineId;
  }

  readMcpParameters(request) {
    this.mealLineId = request.mcpParams?.["mealLineId"];
    this.requestData = request.mcpParams;

    this.mealLineId = this.mealLineId ?? this.id;
    this.id = this.mealLineId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.mealLineId, userId: this.session.userId }),
      { path: "services[3].businessLogic[7].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async fetchInstance() {
    const { getMealLineByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.mealLine = await getMealLineByQuery(this.whereClause);
    if (!this.mealLine) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.mealLine;
    this.instance = this.mealLine;
  }

  async checkInstance() {
    if (!this.mealLine) {
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
      if (this.mealLine?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_mealLineId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_mealLineId() {
    if (this.mealLineId == null) {
      throw new BadRequestError("errMsg_mealLineIdisRequired");
    }

    if (Array.isArray(this.mealLineId)) {
      throw new BadRequestError("errMsg_mealLineIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_mealLineId(this.mealLineId)) {
      throw new BadRequestError("errMsg_mealLineIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.mealLineId === "") this.mealLineId = null;
    this.checkParameter_mealLineId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.mealLine?.userId === this.session.userId;
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
    return await dbScriptDeleteMealline(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.mealLine, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      this.deletedLine = await this.fetchDeletedLine();
    } catch (err) {
      console.log("fetchDeletedLine Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.parentMealLog = await this.fetchParentMealLogForLineDelete();
    } catch (err) {
      console.log("fetchParentMealLogForLineDelete Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainDeleteOperation() {
    try {
      await this.recalculateMealTotalsAfterLineDelete();
    } catch (err) {
      console.log(
        "recalculateMealTotalsAfterLineDelete Action Error:",
        err.message,
      );
      //**errorLog
      throw err;
    }
    try {
      await this.upsertNutritionDayAfterLineDelete();
    } catch (err) {
      console.log(
        "upsertNutritionDayAfterLineDelete Action Error:",
        err.message,
      );
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Fetches the mealLine before deletion to get mealLogId
   ***********************************************************************/
  async fetchDeletedLine() {
    // Fetch Object on childObject mealLine

    const userQuery = {
      id: runMScript(() => this.mealLineId, {
        path: "services[3].businessLogic[7].actions.fetchObjectActions[0].matchValue",
      }),
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getMealLineByQuery(scriptQuery);

    if (!data) {
      throw new NotFoundError("errMsg_FethcedObjectNotFound:mealLine");
    }

    return data;
  }

  /***********************************************************************
   ** Fetches the parent mealLog to get mealDate
   ***********************************************************************/
  async fetchParentMealLogForLineDelete() {
    // Fetch Object on childObject mealLog

    const userQuery = {
      id: runMScript(() => this.deletedLine.mealLogId, {
        path: "services[3].businessLogic[7].actions.fetchObjectActions[1].matchValue",
      }),
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getMealLogByQuery(scriptQuery);

    if (!data) {
      throw new NotFoundError("errMsg_FethcedObjectNotFound:mealLog");
    }

    return data;
  }

  /***********************************************************************
   ** Recomputes meal-level nutrition totals after line deletion
   ***********************************************************************/

  async recalculateMealTotalsAfterLineDelete() {
    try {
      return runMScript(
        () => LIB.recalculateMealTotals(this.deletedLine.mealLogId),
        {
          path: "services[3].businessLogic[7].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction recalculateMealTotalsAfterLineDelete:",
        err,
      );
      throw err;
    }
  }

  /***********************************************************************
   ** Refreshes daily snapshot after line deletion
   ***********************************************************************/

  async upsertNutritionDayAfterLineDelete() {
    try {
      return runMScript(
        () =>
          LIB.upsertNutritionDay(
            this.session.userId,
            this.parentMealLog.mealDate,
          ),
        {
          path: "services[3].businessLogic[7].actions.functionCallActions[1].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction upsertNutritionDayAfterLineDelete:",
        err,
      );
      throw err;
    }
  }
}

module.exports = DeleteMealLineManager;
