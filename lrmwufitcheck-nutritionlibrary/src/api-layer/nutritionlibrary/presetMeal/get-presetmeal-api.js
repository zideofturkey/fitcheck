const { runMScript } = require("common");

const PresetMealManager = require("./PresetMealManager");

const { dbScriptGetPresetmeal, getPresetLineListByQuery } = require("dbLayer");
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

class GetPresetMealManager extends PresetMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getPresetMeal",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
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
      { path: "services[2].businessLogic[8].whereClause.fullWhereClause" },
    );

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");
    const routeQuery = await this.getRouteQuery();
    return convertUserQueryToSequelizeQuery(routeQuery);
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

  async fetchJoined_lines(presetmeal) {
    // relation from presetLine

    if (!presetmeal) {
      console.log("presetmeal is null, so fetchJoined_presetmeal is ommitted");
      return;
    }

    const foreignKey = presetmeal.id;

    const query = { presetMealId: foreignKey };

    // Local database query

    const scriptQuery = convertUserQueryToSequelizeQuery(query);

    const dataList = (await getPresetLineListByQuery(scriptQuery)) ?? [];

    const linesList = dataList.map((item) => {
      const newItem = {};
      newItem["id"] = item["id"];
      newItem["foodItemId"] = item["foodItemId"];
      newItem["lineFoodName"] = item["lineFoodName"];
      newItem["gramAmount"] = item["gramAmount"];
      newItem["lineCalories"] = item["lineCalories"];
      newItem["lineProtein"] = item["lineProtein"];
      newItem["lineCarbohydrates"] = item["lineCarbohydrates"];
      newItem["lineFat"] = item["lineFat"];
      newItem["lineSugar"] = item["lineSugar"];
      newItem["lineFiber"] = item["lineFiber"];
      newItem["presetMealId"] = item["presetMealId"];
      return newItem;
    });

    presetmeal.lines = linesList;
  }

  async fetchJoinsToMainObject(presetmeal) {
    await this.fetchJoined_lines(presetmeal);
  }

  async executeMainOperation() {
    return await dbScriptGetPresetmeal(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.presetMeal, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = GetPresetMealManager;
