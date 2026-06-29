const { runMScript } = require("common");

const MacroTargetManager = require("./MacroTargetManager");

const {
  dbScriptSetMacrotarget,
  updateMacroTargetByQuery,
  getMacroTargetByQuery,
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

class SetMacroTargetManager extends MacroTargetManager {
  constructor(request, controllerType) {
    super(request, {
      name: "setMacroTarget",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "macroTarget";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.macroTargetId = this.macroTargetId;
    jsonObj.calorieTarget = this.calorieTarget;
    jsonObj.proteinTarget = this.proteinTarget;
    jsonObj.carbohydrateTarget = this.carbohydrateTarget;
    jsonObj.fatTarget = this.fatTarget;
    jsonObj.sugarTarget = this.sugarTarget;
    jsonObj.fiberTarget = this.fiberTarget;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.macroTargetId = request.body?.["macroTargetId"];
    this.calorieTarget = request.body?.["calorieTarget"];
    this.proteinTarget = request.body?.["proteinTarget"];
    this.carbohydrateTarget = request.body?.["carbohydrateTarget"];
    this.fatTarget = request.body?.["fatTarget"];
    this.sugarTarget = request.body?.["sugarTarget"];
    this.fiberTarget = request.body?.["fiberTarget"];
    this.userId = request.session?.["userId"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.macroTargetId = this.macroTargetId ?? this.id;
    this.id = this.macroTargetId;
  }

  readMcpParameters(request) {
    this.macroTargetId = request.mcpParams?.["macroTargetId"];
    this.calorieTarget = request.mcpParams?.["calorieTarget"];
    this.proteinTarget = request.mcpParams?.["proteinTarget"];
    this.carbohydrateTarget = request.mcpParams?.["carbohydrateTarget"];
    this.fatTarget = request.mcpParams?.["fatTarget"];
    this.sugarTarget = request.mcpParams?.["sugarTarget"];
    this.fiberTarget = request.mcpParams?.["fiberTarget"];
    this.userId = request.session?.["userId"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.macroTargetId = this.macroTargetId ?? this.id;
    this.id = this.macroTargetId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.macroTargetId = this.id;
    if (!this.macroTargetId) this.macroTargetId = newUUID(false);
    this.id = this.macroTargetId;

    const dataClause = {
      id: this.macroTargetId,
      userId: this.userId,
      calorieTarget: runMScript(() => this.calorieTarget, {
        path: "services[2].businessLogic[0].dataClauseItems[0].value",
      }),
      proteinTarget: runMScript(() => this.proteinTarget, {
        path: "services[2].businessLogic[0].dataClauseItems[1].value",
      }),
      carbohydrateTarget: runMScript(() => this.carbohydrateTarget, {
        path: "services[2].businessLogic[0].dataClauseItems[2].value",
      }),
      fatTarget: runMScript(() => this.fatTarget, {
        path: "services[2].businessLogic[0].dataClauseItems[3].value",
      }),
      sugarTarget: runMScript(() => this.sugarTarget, {
        path: "services[2].businessLogic[0].dataClauseItems[4].value",
      }),
      fiberTarget: runMScript(() => this.fiberTarget, {
        path: "services[2].businessLogic[0].dataClauseItems[5].value",
      }),
      effectiveFrom: runMScript(() => new Date().toISOString(), {
        path: "services[2].businessLogic[0].dataClauseItems[6].value",
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

  checkParameterType_macroTargetId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_macroTargetId() {
    if (this.macroTargetId == null) return;

    if (Array.isArray(this.macroTargetId)) {
      throw new BadRequestError("errMsg_macroTargetIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_macroTargetId(this.macroTargetId)) {
      throw new BadRequestError("errMsg_macroTargetIdTypeIsNotValid");
    }
  }

  checkParameterType_calorieTarget(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_calorieTarget() {
    if (this.calorieTarget == null) {
      throw new BadRequestError("errMsg_calorieTargetisRequired");
    }

    if (Array.isArray(this.calorieTarget)) {
      throw new BadRequestError("errMsg_calorieTargetMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_calorieTarget(this.calorieTarget)) {
      throw new BadRequestError("errMsg_calorieTargetTypeIsNotValid");
    }
  }

  checkParameterType_proteinTarget(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_proteinTarget() {
    if (this.proteinTarget == null) {
      throw new BadRequestError("errMsg_proteinTargetisRequired");
    }

    if (Array.isArray(this.proteinTarget)) {
      throw new BadRequestError("errMsg_proteinTargetMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_proteinTarget(this.proteinTarget)) {
      throw new BadRequestError("errMsg_proteinTargetTypeIsNotValid");
    }
  }

  checkParameterType_carbohydrateTarget(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_carbohydrateTarget() {
    if (this.carbohydrateTarget == null) {
      throw new BadRequestError("errMsg_carbohydrateTargetisRequired");
    }

    if (Array.isArray(this.carbohydrateTarget)) {
      throw new BadRequestError("errMsg_carbohydrateTargetMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_carbohydrateTarget(this.carbohydrateTarget)) {
      throw new BadRequestError("errMsg_carbohydrateTargetTypeIsNotValid");
    }
  }

  checkParameterType_fatTarget(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_fatTarget() {
    if (this.fatTarget == null) {
      throw new BadRequestError("errMsg_fatTargetisRequired");
    }

    if (Array.isArray(this.fatTarget)) {
      throw new BadRequestError("errMsg_fatTargetMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_fatTarget(this.fatTarget)) {
      throw new BadRequestError("errMsg_fatTargetTypeIsNotValid");
    }
  }

  checkParameterType_sugarTarget(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_sugarTarget() {
    if (this.sugarTarget == null) {
      throw new BadRequestError("errMsg_sugarTargetisRequired");
    }

    if (Array.isArray(this.sugarTarget)) {
      throw new BadRequestError("errMsg_sugarTargetMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_sugarTarget(this.sugarTarget)) {
      throw new BadRequestError("errMsg_sugarTargetTypeIsNotValid");
    }
  }

  checkParameterType_fiberTarget(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_fiberTarget() {
    if (this.fiberTarget == null) {
      throw new BadRequestError("errMsg_fiberTargetisRequired");
    }

    if (Array.isArray(this.fiberTarget)) {
      throw new BadRequestError("errMsg_fiberTargetMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_fiberTarget(this.fiberTarget)) {
      throw new BadRequestError("errMsg_fiberTargetTypeIsNotValid");
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
    if (this.macroTargetId === "") this.macroTargetId = null;
    this.checkParameter_macroTargetId();

    this.checkParameter_calorieTarget();

    this.checkParameter_proteinTarget();

    this.checkParameter_carbohydrateTarget();

    this.checkParameter_fatTarget();

    this.checkParameter_sugarTarget();

    this.checkParameter_fiberTarget();

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
    return await dbScriptSetMacrotarget(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.macroTarget, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.existingTarget = await this.fetchExistingTarget();
    } catch (err) {
      console.log("fetchExistingTarget Action Error:", err.message);
      //**errorLog
      this.fetchExistingTargetError = err;
    }
    try {
      if (
        runMScript(() => this.existingTarget != null, {
          path: "services[2].businessLogic[0].actions.updateCrudActions[0].condition",
        })
      )
        await this.deactivateExistingTarget();
    } catch (err) {
      console.log("deactivateExistingTarget Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Soft-delete the prior active macro target before creating a new one
   ***********************************************************************/
  async deactivateExistingTarget() {
    // Aggregated Update Operation on childObject macroTarget

    const params = {
      isActive: false,
    };
    const userQuery = runMScript(
      () => ({ id: this.existingTarget && this.existingTarget.id }),
      {
        path: "services[2].businessLogic[0].actions.updateCrudActions[0].whereClause",
      },
    );

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);

    const result = await updateMacroTargetByQuery(params, query, this);
    if (!result) return null;

    const resultArray = Array.isArray(result) ? result : [result];
    // if updated record is in main data update main data
    if (this.dbResult) {
      for (const item of resultArray) {
        if (item.id == this.dbResult.id) {
          Object.assign(this.dbResult, item);
          this.macroTarget = this.dbResult;
        }
      }
    }
    if (resultArray.length == 0) return null;
    if (resultArray.length == 1) return resultArray[0];
    return resultArray;
  }

  /***********************************************************************
   ** Fetch the user's existing active macro target, if any
   ***********************************************************************/
  async fetchExistingTarget() {
    // Fetch Object on childObject macroTarget

    const userQuery = {
      $and: [
        runMScript(() => ({ userId: this.session.userId, isActive: true }), {
          path: "services[2].businessLogic[0].actions.fetchObjectActions[0].whereClause",
        }),
        { isActive: true },
      ],
    };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getMacroTargetByQuery(scriptQuery);

    return data;
  }
}

module.exports = SetMacroTargetManager;
