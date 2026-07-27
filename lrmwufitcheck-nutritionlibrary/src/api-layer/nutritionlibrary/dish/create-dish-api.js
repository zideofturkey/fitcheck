const { runMScript } = require("common");

const DishManager = require("./DishManager");

const { dbScriptCreateDish } = require("dbLayer");
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

class CreateDishManager extends DishManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createDish",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "dish";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.dishId = this.dishId;
    jsonObj.dishName = this.dishName;
    jsonObj.descriptionText = this.descriptionText;
    jsonObj.isGlobal = this.isGlobal;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.dishId = request.body?.["dishId"];
    this.dishName = request.body?.["dishName"];
    this.descriptionText = request.body?.["descriptionText"];
    this.isGlobal = request.body?.["isGlobal"];
    this.userId = request.session?.["userId"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.dishId = this.dishId ?? this.id;
    this.id = this.dishId;
  }

  readMcpParameters(request) {
    this.dishId = request.mcpParams?.["dishId"];
    this.dishName = request.mcpParams?.["dishName"];
    this.descriptionText = request.mcpParams?.["descriptionText"];
    this.isGlobal = request.mcpParams?.["isGlobal"];
    this.userId = request.session?.["userId"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.dishId = this.dishId ?? this.id;
    this.id = this.dishId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    if (this.id) this.dishId = this.id;
    if (!this.dishId) this.dishId = newUUID(false);
    this.id = this.dishId;

    const dataClause = {
      id: this.dishId,
      userId: this.userId,
      dishName: this.dishName,
      descriptionText: this.descriptionText || null,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
      totalGramWeight: 0,
      isGlobal: this.isGlobal === true,
      isActive: true,
      _archivedAt: null,
    };

    // Resolve any Promise-valued fields.
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

  checkParameterType_dishId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_dishId() {
    if (this.dishId == null) return;

    if (Array.isArray(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_dishId(this.dishId)) {
      throw new BadRequestError("errMsg_dishIdTypeIsNotValid");
    }
  }

  checkParameter_dishName() {
    if (this.dishName == null) {
      throw new BadRequestError("errMsg_dishNameisRequired");
    }

    if (Array.isArray(this.dishName)) {
      throw new BadRequestError("errMsg_dishNameMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_descriptionText() {
    if (this.descriptionText == null) return;

    if (Array.isArray(this.descriptionText)) {
      throw new BadRequestError("errMsg_descriptionTextMustNotBeAnArray");
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
    if (this.dishId === "") this.dishId = null;
    this.checkParameter_dishId();

    this.checkParameter_dishName();

    this.checkParameter_descriptionText();

    this.checkParameter_isGlobal();

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
    return await dbScriptCreateDish(this);

    /*
    the main operation result is accessable in the context through
    this.dbResult, this.dish, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  // Action Store
}

module.exports = CreateDishManager;
