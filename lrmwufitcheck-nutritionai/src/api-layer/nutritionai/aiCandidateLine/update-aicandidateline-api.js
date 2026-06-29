const { runMScript } = require("common");

const AiCandidateLineManager = require("./AiCandidateLineManager");

const {
  dbScriptUpdateAicandidateline,
  updateAiCandidateLineByQuery,
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

class UpdateAiCandidateLineManager extends AiCandidateLineManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateAiCandidateLine",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiCandidateLine";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.aiCandidateLineId = this.aiCandidateLineId;
    jsonObj.estimatedGrams = this.estimatedGrams;
    jsonObj.saveAsFood = this.saveAsFood;
    jsonObj.detectedFoodName = this.detectedFoodName;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.aiCandidateLineId = request.params?.["aiCandidateLineId"];
    this.estimatedGrams = request.body?.["estimatedGrams"];
    this.saveAsFood = request.body?.["saveAsFood"];
    this.detectedFoodName = request.body?.["detectedFoodName"];
    this.userId = request.session?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.aiCandidateLineId = this.aiCandidateLineId ?? this.id;
    this.id = this.aiCandidateLineId;
  }

  readMcpParameters(request) {
    this.aiCandidateLineId = request.mcpParams?.["aiCandidateLineId"];
    this.estimatedGrams = request.mcpParams?.["estimatedGrams"];
    this.saveAsFood = request.mcpParams?.["saveAsFood"];
    this.detectedFoodName = request.mcpParams?.["detectedFoodName"];
    this.userId = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.aiCandidateLineId = this.aiCandidateLineId ?? this.id;
    this.id = this.aiCandidateLineId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({ id: this.aiCandidateLineId, userId: this.session.userId }),
      { path: "services[4].businessLogic[7].whereClause.fullWhereClause" },
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
      estimatedGrams: runMScript(() => this.estimatedGrams, {
        path: "services[4].businessLogic[7].dataClauseItems[0].value",
      }),
      saveAsFood: runMScript(() => this.saveAsFood, {
        path: "services[4].businessLogic[7].dataClauseItems[1].value",
      }),
      detectedFoodName: runMScript(() => this.detectedFoodName, {
        path: "services[4].businessLogic[7].dataClauseItems[2].value",
      }),
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
      const _idFieldsAndIsArray = [
        ["userId", false],
        ["aiCandidateMealId", false],
      ];
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
    const { getAiCandidateLineByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.aiCandidateLine = await getAiCandidateLineByQuery(this.whereClause);
    if (!this.aiCandidateLine) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.aiCandidateLine;
    this.instance = this.aiCandidateLine;
  }

  async checkInstance() {
    if (!this.aiCandidateLine) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_aiCandidateLineId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_aiCandidateLineId() {
    if (this.aiCandidateLineId == null) {
      throw new BadRequestError("errMsg_aiCandidateLineIdisRequired");
    }

    if (Array.isArray(this.aiCandidateLineId)) {
      throw new BadRequestError("errMsg_aiCandidateLineIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_aiCandidateLineId(this.aiCandidateLineId)) {
      throw new BadRequestError("errMsg_aiCandidateLineIdTypeIsNotValid");
    }
  }

  checkParameterType_estimatedGrams(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_estimatedGrams() {
    if (this.estimatedGrams == null) return;

    if (Array.isArray(this.estimatedGrams)) {
      throw new BadRequestError("errMsg_estimatedGramsMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_estimatedGrams(this.estimatedGrams)) {
      throw new BadRequestError("errMsg_estimatedGramsTypeIsNotValid");
    }
  }

  checkParameterType_saveAsFood(paramValue) {
    const isBoolean = (n) => !!n === n;
    if (!isBoolean(paramValue)) {
      throw new BadRequestError("errMsg_saveAsFoodisNotAValidBoolean");
    }

    return true;
  }

  checkParameter_saveAsFood() {
    if (this.saveAsFood == null) return;

    if (Array.isArray(this.saveAsFood)) {
      throw new BadRequestError("errMsg_saveAsFoodMustNotBeAnArray");
    }

    // Parameter Type: Boolean

    if (!this.checkParameterType_saveAsFood(this.saveAsFood)) {
      throw new BadRequestError("errMsg_saveAsFoodTypeIsNotValid");
    }
  }

  checkParameter_detectedFoodName() {
    if (this.detectedFoodName == null) return;

    if (Array.isArray(this.detectedFoodName)) {
      throw new BadRequestError("errMsg_detectedFoodNameMustNotBeAnArray");
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
    if (this.aiCandidateLineId === "") this.aiCandidateLineId = null;
    this.checkParameter_aiCandidateLineId();

    this.checkParameter_estimatedGrams();

    this.checkParameter_saveAsFood();

    this.checkParameter_detectedFoodName();

    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.aiCandidateLine?.userId === this.session.userId;
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
    return await dbScriptUpdateAicandidateline(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.aiCandidateLine, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      if (
        runMScript(() => this.estimatedGrams, {
          path: "services[4].businessLogic[7].actions.functionCallActions[0].condition",
        })
      )
        this.recalcLine = await this.recalculateLineNutrition();
    } catch (err) {
      console.log("recalculateLineNutrition Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainUpdateOperation() {
    try {
      if (
        runMScript(() => this.estimatedGrams, {
          path: "services[4].businessLogic[7].actions.updateCrudActions[0].condition",
        })
      )
        await this.updateLineNutritionValues();
    } catch (err) {
      console.log("updateLineNutritionValues Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Update aiCandidateLine with recalculated nutrition values after gram
   ** change
   ***********************************************************************/
  async updateLineNutritionValues() {
    // Aggregated Update Operation on childObject aiCandidateLine

    const params = {
      estimatedCalories: runMScript(() => this.recalcLine.estimatedCalories, {
        path: "services[4].businessLogic[7].actions.updateCrudActions[0].dataClause[0].dataValue",
      }),
      estimatedProtein: runMScript(() => this.recalcLine.estimatedProtein, {
        path: "services[4].businessLogic[7].actions.updateCrudActions[0].dataClause[1].dataValue",
      }),
      estimatedCarbohydrates: runMScript(
        () => this.recalcLine.estimatedCarbohydrates,
        {
          path: "services[4].businessLogic[7].actions.updateCrudActions[0].dataClause[2].dataValue",
        },
      ),
      estimatedFat: runMScript(() => this.recalcLine.estimatedFat, {
        path: "services[4].businessLogic[7].actions.updateCrudActions[0].dataClause[3].dataValue",
      }),
      estimatedSugar: runMScript(() => this.recalcLine.estimatedSugar, {
        path: "services[4].businessLogic[7].actions.updateCrudActions[0].dataClause[4].dataValue",
      }),
      estimatedFiber: runMScript(() => this.recalcLine.estimatedFiber, {
        path: "services[4].businessLogic[7].actions.updateCrudActions[0].dataClause[5].dataValue",
      }),
    };
    const userQuery = runMScript(() => ({ id: this.aiCandidateLineId }), {
      path: "services[4].businessLogic[7].actions.updateCrudActions[0].whereClause",
    });

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);

    const result = await updateAiCandidateLineByQuery(params, query, this);
    if (!result) return null;

    const resultArray = Array.isArray(result) ? result : [result];
    // if updated record is in main data update main data
    if (this.dbResult) {
      for (const item of resultArray) {
        if (item.id == this.dbResult.id) {
          Object.assign(this.dbResult, item);
          this.aiCandidateLine = this.dbResult;
        }
      }
    }
    if (resultArray.length == 0) return null;
    if (resultArray.length == 1) return resultArray[0];
    return resultArray;
  }

  /***********************************************************************
   ** Proportionally recalculate the six nutrition values when gram amount
   ** changes
   ***********************************************************************/

  async recalculateLineNutrition() {
    try {
      return runMScript(
        () =>
          LIB.recalculateLineNutrition(
            this.aiCandidateLine,
            this.estimatedGrams,
          ),
        {
          path: "services[4].businessLogic[7].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction recalculateLineNutrition:",
        err,
      );
      throw err;
    }
  }
}

module.exports = UpdateAiCandidateLineManager;
