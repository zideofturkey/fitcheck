const { runMScript } = require("common");

const PresetMealManager = require("./PresetMealManager");

const {
  dbScriptDeletePresetmeal,
  deletePresetLineByQuery,
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

class DeletePresetMealManager extends PresetMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deletePresetMeal",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "presetMeal";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.presetMealId = this.presetMealId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.presetMealId = request.params?.["presetMealId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.presetMealId = this.presetMealId ?? this.id;
    this.id = this.presetMealId;
  }

  readMcpParameters(request) {
    this.presetMealId = request.mcpParams?.["presetMealId"];
    this.requestData = request.mcpParams;

    this.presetMealId = this.presetMealId ?? this.id;
    this.id = this.presetMealId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.presetMealId }, { isActive: true }] }),
      { path: "services[2].businessLogic[11].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async fetchInstance() {
    const { getPresetMealByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.presetMeal = await getPresetMealByQuery(this.whereClause);
    if (!this.presetMeal) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.presetMeal;
    this.instance = this.presetMeal;
  }

  async checkInstance() {
    if (!this.presetMeal) {
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
      if (this.presetMeal?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_presetMealId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_presetMealId() {
    if (this.presetMealId == null) {
      throw new BadRequestError("errMsg_presetMealIdisRequired");
    }

    if (Array.isArray(this.presetMealId)) {
      throw new BadRequestError("errMsg_presetMealIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_presetMealId(this.presetMealId)) {
      throw new BadRequestError("errMsg_presetMealIdTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.presetMealId === "") this.presetMealId = null;
    this.checkParameter_presetMealId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.presetMeal?.userId === this.session.userId;
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
    return await dbScriptDeletePresetmeal(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.presetMeal, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      await this.deletePresetLines();
    } catch (err) {
      console.log("deletePresetLines Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Soft-delete all active preset lines belonging to this preset before
   ** deleting the parent
   ***********************************************************************/

  async deletePresetLines() {
    const userQuery = runMScript(() => ({ presetMealId: this.presetMealId }), {
      path: "services[2].businessLogic[11].actions.deleteCrudActions[0].whereClause",
    });

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);

    return await deletePresetLineByQuery(query, this);
  }
}

module.exports = DeletePresetMealManager;
