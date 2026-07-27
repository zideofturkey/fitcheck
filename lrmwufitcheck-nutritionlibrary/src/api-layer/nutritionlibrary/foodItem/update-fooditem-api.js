const { runMScript } = require("common");

const FoodItemManager = require("./FoodItemManager");

const { dbScriptUpdateFooditem } = require("dbLayer");
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

class UpdateFoodItemManager extends FoodItemManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateFoodItem",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "foodItem";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.foodItemId = this.foodItemId;
    jsonObj.foodName = this.foodName;
    jsonObj.caloriePer100g = this.caloriePer100g;
    jsonObj.proteinPer100g = this.proteinPer100g;
    jsonObj.carbohydratePer100g = this.carbohydratePer100g;
    jsonObj.fatPer100g = this.fatPer100g;
    jsonObj.sugarPer100g = this.sugarPer100g;
    jsonObj.fiberPer100g = this.fiberPer100g;
    jsonObj.brandName = this.brandName;
    jsonObj.baseName = this.baseName;
    jsonObj.foodCategory = this.foodCategory;
    jsonObj.isGlobal = this.isGlobal;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.foodItemId = request.params?.["foodItemId"];
    this.foodName = request.body?.["foodName"];
    this.caloriePer100g = request.body?.["caloriePer100g"];
    this.proteinPer100g = request.body?.["proteinPer100g"];
    this.carbohydratePer100g = request.body?.["carbohydratePer100g"];
    this.fatPer100g = request.body?.["fatPer100g"];
    this.sugarPer100g = request.body?.["sugarPer100g"];
    this.fiberPer100g = request.body?.["fiberPer100g"];
    this.brandName = request.body?.["brandName"];
    this.baseName = request.body?.["baseName"];
    this.foodCategory = request.body?.["foodCategory"];
    this.isGlobal = request.body?.["isGlobal"];
    this.userId = request.session?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.foodItemId = this.foodItemId ?? this.id;
    this.id = this.foodItemId;
  }

  readMcpParameters(request) {
    this.foodItemId = request.mcpParams?.["foodItemId"];
    this.foodName = request.mcpParams?.["foodName"];
    this.caloriePer100g = request.mcpParams?.["caloriePer100g"];
    this.proteinPer100g = request.mcpParams?.["proteinPer100g"];
    this.carbohydratePer100g = request.mcpParams?.["carbohydratePer100g"];
    this.fatPer100g = request.mcpParams?.["fatPer100g"];
    this.sugarPer100g = request.mcpParams?.["sugarPer100g"];
    this.fiberPer100g = request.mcpParams?.["fiberPer100g"];
    this.brandName = request.mcpParams?.["brandName"];
    this.baseName = request.mcpParams?.["baseName"];
    this.foodCategory = request.mcpParams?.["foodCategory"];
    this.isGlobal = request.mcpParams?.["isGlobal"];
    this.userId = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.foodItemId = this.foodItemId ?? this.id;
    this.id = this.foodItemId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.foodItemId }, { isActive: true }] }),
      { path: "services[2].businessLogic[5].whereClause.fullWhereClause" },
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
      foodName: runMScript(() => this.foodName, {
        path: "services[2].businessLogic[5].dataClauseItems[0].value",
      }),
      caloriePer100g: runMScript(() => this.caloriePer100g, {
        path: "services[2].businessLogic[5].dataClauseItems[1].value",
      }),
      proteinPer100g: runMScript(() => this.proteinPer100g, {
        path: "services[2].businessLogic[5].dataClauseItems[2].value",
      }),
      carbohydratePer100g: runMScript(() => this.carbohydratePer100g, {
        path: "services[2].businessLogic[5].dataClauseItems[3].value",
      }),
      fatPer100g: runMScript(() => this.fatPer100g, {
        path: "services[2].businessLogic[5].dataClauseItems[4].value",
      }),
      sugarPer100g: runMScript(() => this.sugarPer100g, {
        path: "services[2].businessLogic[5].dataClauseItems[5].value",
      }),
      fiberPer100g: runMScript(() => this.fiberPer100g, {
        path: "services[2].businessLogic[5].dataClauseItems[6].value",
      }),
      brandName: runMScript(() => this.brandName, {
        path: "services[2].businessLogic[5].dataClauseItems[7].value",
      }),
      baseName: this.baseName,
      foodCategory: runMScript(() => this.foodCategory, {
        path: "services[2].businessLogic[5].dataClauseItems[8].value",
      }),
    };

    // isGlobal is admin-gated (see checkParameter_isGlobal) - only include
    // it in the update when the client actually sent it, so omitting the
    // field never accidentally resets it to false.
    if (this.isGlobal != null) {
      dataClause.isGlobal = this.isGlobal === true;
    }

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
      const _idFieldsAndIsArray = [["userId", false]];
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
    const { getFoodItemByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.foodItem = await getFoodItemByQuery(this.whereClause);
    if (!this.foodItem) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.foodItem;
    this.instance = this.foodItem;
  }

  async checkInstance() {
    if (!this.foodItem) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }

    if (!this.checkAbsolute() && !this.userHasRole("admin")) {
      // admin (like superAdmin via checkAbsolute) fully bypasses ownership -
      // needed so an admin can promote ANY user's private record to
      // isGlobal:true, not just edit already-global records.
      // Owner-field safety net: if the resolved owner field on the record is
      // null/undefined, the isOwner comparison could never succeed — either
      // the spec is missing a sessionSettings.isOwnerField property (so the
      // codegen wired the synthetic "_owner" column that does not exist), or
      // the record was written without the owner column. Throw a distinct,
      // attributable 403 instead of the misleading "wrong user" message that
      // sends operators chasing user-identity bugs that are really config bugs.
      if (this.foodItem?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      // Global records can only be modified by admins (checkAbsolute()
      // above already lets superAdmin through) - even the original owner
      // loses edit rights once a record is made global.
      if (this.foodItem?.isGlobal) {
        if (!this.userHasRole("admin")) {
          throw new ForbiddenError(
            "errMsg_GlobalRecordsCanOnlyBeModifiedByAdmin",
          );
        }
      } else if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_foodItemId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_foodItemId() {
    if (this.foodItemId == null) {
      throw new BadRequestError("errMsg_foodItemIdisRequired");
    }

    if (Array.isArray(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_foodItemId(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdTypeIsNotValid");
    }
  }

  checkParameter_foodName() {
    if (this.foodName == null) return;

    if (Array.isArray(this.foodName)) {
      throw new BadRequestError("errMsg_foodNameMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameterType_caloriePer100g(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_caloriePer100g() {
    if (this.caloriePer100g == null) return;

    if (Array.isArray(this.caloriePer100g)) {
      throw new BadRequestError("errMsg_caloriePer100gMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_caloriePer100g(this.caloriePer100g)) {
      throw new BadRequestError("errMsg_caloriePer100gTypeIsNotValid");
    }
  }

  checkParameterType_proteinPer100g(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_proteinPer100g() {
    if (this.proteinPer100g == null) return;

    if (Array.isArray(this.proteinPer100g)) {
      throw new BadRequestError("errMsg_proteinPer100gMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_proteinPer100g(this.proteinPer100g)) {
      throw new BadRequestError("errMsg_proteinPer100gTypeIsNotValid");
    }
  }

  checkParameterType_carbohydratePer100g(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_carbohydratePer100g() {
    if (this.carbohydratePer100g == null) return;

    if (Array.isArray(this.carbohydratePer100g)) {
      throw new BadRequestError("errMsg_carbohydratePer100gMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (
      !this.checkParameterType_carbohydratePer100g(this.carbohydratePer100g)
    ) {
      throw new BadRequestError("errMsg_carbohydratePer100gTypeIsNotValid");
    }
  }

  checkParameterType_fatPer100g(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_fatPer100g() {
    if (this.fatPer100g == null) return;

    if (Array.isArray(this.fatPer100g)) {
      throw new BadRequestError("errMsg_fatPer100gMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_fatPer100g(this.fatPer100g)) {
      throw new BadRequestError("errMsg_fatPer100gTypeIsNotValid");
    }
  }

  checkParameterType_sugarPer100g(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_sugarPer100g() {
    if (this.sugarPer100g == null) return;

    if (Array.isArray(this.sugarPer100g)) {
      throw new BadRequestError("errMsg_sugarPer100gMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_sugarPer100g(this.sugarPer100g)) {
      throw new BadRequestError("errMsg_sugarPer100gTypeIsNotValid");
    }
  }

  checkParameterType_fiberPer100g(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_fiberPer100g() {
    if (this.fiberPer100g == null) return;

    if (Array.isArray(this.fiberPer100g)) {
      throw new BadRequestError("errMsg_fiberPer100gMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_fiberPer100g(this.fiberPer100g)) {
      throw new BadRequestError("errMsg_fiberPer100gTypeIsNotValid");
    }
  }

  checkParameter_brandName() {
    if (this.brandName == null) return;

    if (Array.isArray(this.brandName)) {
      throw new BadRequestError("errMsg_brandNameMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_baseName() {
    if (this.baseName == null) return;

    if (Array.isArray(this.baseName)) {
      throw new BadRequestError("errMsg_baseNameMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_foodCategory() {
    if (this.foodCategory == null) return;

    if (Array.isArray(this.foodCategory)) {
      throw new BadRequestError("errMsg_foodCategoryMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_isGlobal() {
    if (this.isGlobal == null) return;

    if (this.isGlobal !== true && this.isGlobal !== false) {
      throw new BadRequestError("errMsg_isGlobalTypeIsNotValid");
    }

    if (
      this.isGlobal === true &&
      !this.userHasRole("admin") &&
      !this.userHasRole("superAdmin")
    ) {
      throw new ForbiddenError("errMsg_OnlyAdminsCanSetGlobalFlag");
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
    if (this.foodItemId === "") this.foodItemId = null;
    this.checkParameter_foodItemId();

    this.checkParameter_foodName();

    this.checkParameter_caloriePer100g();

    this.checkParameter_proteinPer100g();

    this.checkParameter_carbohydratePer100g();

    this.checkParameter_fatPer100g();

    this.checkParameter_sugarPer100g();

    this.checkParameter_fiberPer100g();

    this.checkParameter_brandName();

    this.checkParameter_baseName();

    this.checkParameter_isGlobal();

    this.checkParameter_foodCategory();

    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.foodItem?.userId === this.session.userId;
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
    return await dbScriptUpdateFooditem(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.foodItem, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = UpdateFoodItemManager;
