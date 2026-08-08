const { runMScript } = require("common");

const PresetMealManager = require("./PresetMealManager");

const { dbScriptUpdatePresetmeal } = require("dbLayer");
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

class UpdatePresetMealManager extends PresetMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updatePresetMeal",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
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
    jsonObj.presetCategory = this.presetCategory;
    jsonObj.isGlobal = this.isGlobal;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.presetMealId = request.params?.["presetMealId"];
    this.templateName = request.body?.["templateName"];
    this.descriptionText = request.body?.["descriptionText"];
    this.presetCategory = request.body?.["presetCategory"];
    this.isGlobal = request.body?.["isGlobal"];
    this.userId = request.session?.["userId"];
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
    this.presetCategory = request.mcpParams?.["presetCategory"];
    this.isGlobal = request.mcpParams?.["isGlobal"];
    this.userId = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.presetMealId = this.presetMealId ?? this.id;
    this.id = this.presetMealId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ $and: [{ id: this.presetMealId }, { isActive: true }] }),
      { path: "services[2].businessLogic[10].whereClause.fullWhereClause" },
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
      templateName: runMScript(() => this.templateName, {
        path: "services[2].businessLogic[10].dataClauseItems[0].value",
      }),
      descriptionText: runMScript(() => this.descriptionText, {
        path: "services[2].businessLogic[10].dataClauseItems[1].value",
      }),
    };

    if (this.presetCategory !== undefined) {
      dataClause.presetCategory = this.presetCategory;
    }

    // isGlobal is admin-gated (see checkParameter_isGlobal) - only include
    // it when the client actually sent it, so omitting the field never
    // accidentally resets it to false.
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
      if (this.presetMeal?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      // Global records can only be modified by admins (checkAbsolute()
      // above already lets superAdmin through) - even the original owner
      // loses edit rights once a record is made global.
      if (this.presetMeal?.isGlobal) {
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

  checkParameter_templateName() {
    if (this.templateName == null) return;

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

  checkParameter_presetCategory() {
    if (this.presetCategory == null) return;

    if (Array.isArray(this.presetCategory)) {
      throw new BadRequestError("errMsg_presetCategoryMustNotBeAnArray");
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
    if (this.presetMealId === "") this.presetMealId = null;
    this.checkParameter_presetMealId();

    this.checkParameter_templateName();

    this.checkParameter_descriptionText();

    this.checkParameter_presetCategory();

    this.checkParameter_isGlobal();

    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

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
    return await dbScriptUpdatePresetmeal(this);

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

module.exports = UpdatePresetMealManager;
