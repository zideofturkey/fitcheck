const { runMScript } = require("common");

const PresetMealManager = require("./PresetMealManager");

const { dbScriptCreatePresetmeal } = require("dbLayer");
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

class CreatePresetMealManager extends PresetMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createPresetMeal",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "presetMeal";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.presetMealId = this.presetMealId;
    jsonObj.templateName = this.templateName;
    jsonObj.descriptionText = this.descriptionText;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.presetMealId = request.body?.["presetMealId"];
    this.templateName = request.body?.["templateName"];
    this.descriptionText = request.body?.["descriptionText"];
    this.userId = request.session?.["userId"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.presetMealId = this.presetMealId ?? this.id;
    this.id = this.presetMealId;
  }

  readMcpParameters(request) {
    this.presetMealId = request.mcpParams?.["presetMealId"];
    this.templateName = request.mcpParams?.["templateName"];
    this.descriptionText = request.mcpParams?.["descriptionText"];
    this.userId = request.session?.["userId"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.presetMealId = this.presetMealId ?? this.id;
    this.id = this.presetMealId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.presetMealId = this.id;
    if (!this.presetMealId) this.presetMealId = newUUID(false);
    this.id = this.presetMealId;

    const dataClause = {
      id: this.presetMealId,
      userId: this.userId,
      templateName: runMScript(() => this.templateName, {
        path: "services[2].businessLogic[7].dataClauseItems[0].value",
      }),
      descriptionText: runMScript(() => this.descriptionText || null, {
        path: "services[2].businessLogic[7].dataClauseItems[1].value",
      }),
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalSugar: 0,
      totalFiber: 0,
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

  checkParameterType_presetMealId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_presetMealId() {
    if (this.presetMealId == null) return;

    if (Array.isArray(this.presetMealId)) {
      throw new BadRequestError("errMsg_presetMealIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_presetMealId(this.presetMealId)) {
      throw new BadRequestError("errMsg_presetMealIdTypeIsNotValid");
    }
  }

  checkParameter_templateName() {
    if (this.templateName == null) {
      throw new BadRequestError("errMsg_templateNameisRequired");
    }

    if (Array.isArray(this.templateName)) {
      throw new BadRequestError("errMsg_templateNameMustNotBeAnArray");
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
    if (this.presetMealId === "") this.presetMealId = null;
    this.checkParameter_presetMealId();

    this.checkParameter_templateName();

    this.checkParameter_descriptionText();

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
    return await dbScriptCreatePresetmeal(this);

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

module.exports = CreatePresetMealManager;
