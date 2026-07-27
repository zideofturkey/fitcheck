const { runMScript } = require("common");

const FoodItemManager = require("./FoodItemManager");

const { dbScriptCreateFooditem, getFoodItemByQuery } = require("dbLayer");
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

class CreateFoodItemManager extends FoodItemManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createFoodItem",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
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
    jsonObj.creationSource = this.creationSource;
    jsonObj.isGlobal = this.isGlobal;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.foodItemId = request.body?.["foodItemId"];
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
    this.creationSource = request.body?.["creationSource"];
    this.isGlobal = request.body?.["isGlobal"];
    this.userId = request.session?.["userId"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
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
    this.creationSource = request.mcpParams?.["creationSource"];
    this.isGlobal = request.mcpParams?.["isGlobal"];
    this.userId = request.session?.["userId"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.foodItemId = this.foodItemId ?? this.id;
    this.id = this.foodItemId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.foodItemId = this.id;
    if (!this.foodItemId) this.foodItemId = newUUID(false);
    this.id = this.foodItemId;

    // Ingredient brand-variant grouping: if baseName is given, link this
    // item to the existing canonical record for that baseName (the first
    // item ever created with it - the one with no parent of its own). If
    // no canonical record exists yet, this item becomes it (parentIngredientId
    // stays null) and later variants will link to it.
    let parentIngredientId = null;
    if (this.baseName) {
      const canonicalParent = await getFoodItemByQuery({
        userId: this.userId,
        baseName: this.baseName,
        parentIngredientId: null,
        isActive: true,
      });
      if (canonicalParent) parentIngredientId = canonicalParent.id;
    }

    const dataClause = {
      id: this.foodItemId,
      userId: this.userId,
      foodName: runMScript(() => this.foodName, {
        path: "services[2].businessLogic[2].dataClauseItems[0].value",
      }),
      caloriePer100g: runMScript(() => this.caloriePer100g, {
        path: "services[2].businessLogic[2].dataClauseItems[1].value",
      }),
      proteinPer100g: runMScript(() => this.proteinPer100g, {
        path: "services[2].businessLogic[2].dataClauseItems[2].value",
      }),
      carbohydratePer100g: runMScript(() => this.carbohydratePer100g, {
        path: "services[2].businessLogic[2].dataClauseItems[3].value",
      }),
      fatPer100g: runMScript(() => this.fatPer100g, {
        path: "services[2].businessLogic[2].dataClauseItems[4].value",
      }),
      sugarPer100g: runMScript(() => this.sugarPer100g, {
        path: "services[2].businessLogic[2].dataClauseItems[5].value",
      }),
      fiberPer100g: runMScript(() => this.fiberPer100g, {
        path: "services[2].businessLogic[2].dataClauseItems[6].value",
      }),
      brandName: runMScript(() => this.brandName || null, {
        path: "services[2].businessLogic[2].dataClauseItems[7].value",
      }),
      baseName: this.baseName || null,
      parentIngredientId: parentIngredientId,
      isGlobal: this.isGlobal === true,
      foodCategory: runMScript(() => this.foodCategory || null, {
        path: "services[2].businessLogic[2].dataClauseItems[8].value",
      }),
      creationSource: runMScript(() => this.creationSource || "manualEntry", {
        path: "services[2].businessLogic[2].dataClauseItems[9].value",
      }),
      isActive: true,
      _archivedAt: null,
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

  checkParameterType_foodItemId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_foodItemId() {
    if (this.foodItemId == null) return;

    if (Array.isArray(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_foodItemId(this.foodItemId)) {
      throw new BadRequestError("errMsg_foodItemIdTypeIsNotValid");
    }
  }

  checkParameter_foodName() {
    if (this.foodName == null) {
      throw new BadRequestError("errMsg_foodNameisRequired");
    }

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
    if (this.caloriePer100g == null) {
      throw new BadRequestError("errMsg_caloriePer100gisRequired");
    }

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
    if (this.proteinPer100g == null) {
      throw new BadRequestError("errMsg_proteinPer100gisRequired");
    }

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
    if (this.carbohydratePer100g == null) {
      throw new BadRequestError("errMsg_carbohydratePer100gisRequired");
    }

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
    if (this.fatPer100g == null) {
      throw new BadRequestError("errMsg_fatPer100gisRequired");
    }

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
    if (this.sugarPer100g == null) {
      throw new BadRequestError("errMsg_sugarPer100gisRequired");
    }

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
    if (this.fiberPer100g == null) {
      throw new BadRequestError("errMsg_fiberPer100gisRequired");
    }

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
      throw new ForbiddenError("errMsg_OnlyAdminsCanCreateGlobalRecords");
    }
  }

  checkParameterType_creationSource(paramValue) {
    function isInt(value) {
      return (
        !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10))
      );
    }

    const enumOptions = ["manualentry", "aiassistant"];
    if (typeof paramValue !== "string") {
      if (isInt(paramValue)) {
        paramValue = Number(paramValue);
        if (paramValue >= 0 && paramValue <= enumOptions.length - 1) {
          paramValue = enumOptions[paramValue];
          return paramValue;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    if (!enumOptions.includes(paramValue.toLowerCase())) {
      return false;
    }

    return true;
  }

  checkParameter_creationSource() {
    if (this.creationSource == null) return;

    if (Array.isArray(this.creationSource)) {
      throw new BadRequestError("errMsg_creationSourceMustNotBeAnArray");
    }

    // Parameter Type: Enum

    const enumResult = this.checkParameterType_creationSource(
      this.creationSource,
    );
    if (enumResult === false) {
      throw new BadRequestError("errMsg_creationSourceTypeIsNotValid");
    } else if (enumResult !== true) {
      this.creationSource = enumResult;
    }
  }

  checkParameterType_userId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_userId() {
    if (this.userId == null) {
      throw new BadRequestError("errMsg_userIdisRequired");
    }

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

    this.checkParameter_creationSource();

    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    // filter parameters
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
    return await dbScriptCreateFooditem(this);

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

module.exports = CreateFoodItemManager;
