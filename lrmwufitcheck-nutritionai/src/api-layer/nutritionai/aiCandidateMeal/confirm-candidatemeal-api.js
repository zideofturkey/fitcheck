const { runMScript } = require("common");

const AiCandidateMealManager = require("./AiCandidateMealManager");

const {
  dbScriptConfirmCandidatemeal,
  updateAiCandidateMealByQuery,
  updateAiSessionByQuery,
  getAiCandidateLineListByQuery,
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

class ConfirmCandidateMealManager extends AiCandidateMealManager {
  constructor(request, controllerType) {
    super(request, {
      name: "confirmCandidateMeal",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiCandidateMeal";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.aiCandidateMealId = this.aiCandidateMealId;
    jsonObj.proposedMealDate = this.proposedMealDate;
    jsonObj.proposedMealTime = this.proposedMealTime;
    jsonObj.proposedSlotName = this.proposedSlotName;
    jsonObj.lineAdjustments = this.lineAdjustments;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.aiCandidateMealId = request.params?.["aiCandidateMealId"];
    this.proposedMealDate = request.body?.["proposedMealDate"];
    this.proposedMealTime = request.body?.["proposedMealTime"];
    this.proposedSlotName = request.body?.["proposedSlotName"];
    this.lineAdjustments = request.body?.["lineAdjustments"];
    this.userId = request.session?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.aiCandidateMealId = this.aiCandidateMealId ?? this.id;
    this.id = this.aiCandidateMealId;
  }

  readMcpParameters(request) {
    this.aiCandidateMealId = request.mcpParams?.["aiCandidateMealId"];
    this.proposedMealDate = request.mcpParams?.["proposedMealDate"];
    this.proposedMealTime = request.mcpParams?.["proposedMealTime"];
    this.proposedSlotName = request.mcpParams?.["proposedSlotName"];
    this.lineAdjustments = request.mcpParams?.["lineAdjustments"];
    this.userId = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.aiCandidateMealId = this.aiCandidateMealId ?? this.id;
    this.id = this.aiCandidateMealId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(
      () => ({
        id: this.aiCandidateMealId,
        userId: this.session.userId,
        isConfirmed: false,
        isCommitted: false,
      }),
      { path: "services[4].businessLogic[1].whereClause.fullWhereClause" },
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
      isConfirmed: true,
      proposedMealDate: runMScript(
        () => this.proposedMealDate || this.aiCandidateMeal.proposedMealDate,
        { path: "services[4].businessLogic[1].dataClauseItems[1].value" },
      ),
      proposedMealTime: runMScript(
        () => this.proposedMealTime || this.aiCandidateMeal.proposedMealTime,
        { path: "services[4].businessLogic[1].dataClauseItems[2].value" },
      ),
      proposedSlotName: runMScript(
        () => this.proposedSlotName || this.aiCandidateMeal.proposedSlotName,
        { path: "services[4].businessLogic[1].dataClauseItems[3].value" },
      ),
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
        ["aiSessionId", false],
        ["committedMealLogId", false],
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
    const { getAiCandidateMealByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.aiCandidateMeal = await getAiCandidateMealByQuery(this.whereClause);
    if (!this.aiCandidateMeal) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.aiCandidateMeal;
    this.instance = this.aiCandidateMeal;
  }

  async checkInstance() {
    if (!this.aiCandidateMeal) {
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
      if (this.aiCandidateMeal?.userId == null) {
        throw new ForbiddenError(
          "errMsg_OwnerFieldIsUndefinedForOwnershipCheck",
        );
      }
      if (!this.isOwner) {
        throw new ForbiddenError("errMsg_UserShouldBeTheOnwerOfTheObject");
      }
    }
  }

  checkParameterType_aiCandidateMealId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_aiCandidateMealId() {
    if (this.aiCandidateMealId == null) {
      throw new BadRequestError("errMsg_aiCandidateMealIdisRequired");
    }

    if (Array.isArray(this.aiCandidateMealId)) {
      throw new BadRequestError("errMsg_aiCandidateMealIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_aiCandidateMealId(this.aiCandidateMealId)) {
      throw new BadRequestError("errMsg_aiCandidateMealIdTypeIsNotValid");
    }
  }

  checkParameterType_proposedMealDate(paramValue) {
    const isDate = (timestamp) => new Date(timestamp).getTime() > 0;
    if (!isDate(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_proposedMealDate() {
    if (this.proposedMealDate == null) return;

    if (Array.isArray(this.proposedMealDate)) {
      throw new BadRequestError("errMsg_proposedMealDateMustNotBeAnArray");
    }

    // Parameter Type: Date

    if (!this.checkParameterType_proposedMealDate(this.proposedMealDate)) {
      throw new BadRequestError("errMsg_proposedMealDateTypeIsNotValid");
    }
  }

  checkParameter_proposedMealTime() {
    if (this.proposedMealTime == null) return;

    if (Array.isArray(this.proposedMealTime)) {
      throw new BadRequestError("errMsg_proposedMealTimeMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_proposedSlotName() {
    if (this.proposedSlotName == null) return;

    if (Array.isArray(this.proposedSlotName)) {
      throw new BadRequestError("errMsg_proposedSlotNameMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameterType_lineAdjustments(paramValue) {
    if (typeof paramValue !== "object") {
      return false;
    }

    return true;
  }

  checkParameter_lineAdjustments() {
    if (this.lineAdjustments == null) return;

    if (!Array.isArray(this.lineAdjustments)) {
      throw new BadRequestError("errMsg_lineAdjustmentsMustBeAnArray");
    }

    // Parameter Type: Object

    this.lineAdjustments.forEach((item) => {
      if (!this.checkParameterType_lineAdjustments(item)) {
        throw new BadRequestError(
          "errMsg_lineAdjustmentsArrayHasAnInvalidItem",
        );
      }
    });
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
    if (this.aiCandidateMealId === "") this.aiCandidateMealId = null;
    this.checkParameter_aiCandidateMealId();

    this.checkParameter_proposedMealDate();

    this.checkParameter_proposedMealTime();

    this.checkParameter_proposedSlotName();

    this.checkParameter_lineAdjustments();

    if (this.userId === "") this.userId = null;
    this.checkParameter_userId();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.aiCandidateMeal?.userId === this.session.userId;
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
    return await dbScriptConfirmCandidatemeal(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.aiCandidateMeal, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterFetchInstance() {
    try {
      this.candidateLines = await this.fetchCandidateLines();
    } catch (err) {
      console.log("fetchCandidateLines Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.adjustedLines = await this.applyLineAdjustments();
    } catch (err) {
      console.log("applyLineAdjustments Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.recalculatedTotals = await this.recalculateMealTotals();
    } catch (err) {
      console.log("recalculateMealTotals Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  async afterMainUpdateOperation() {
    try {
      await this.updateCandidateMealTotals();
    } catch (err) {
      console.log("updateCandidateMealTotals Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.loopUpdateAdjustedLines();
    } catch (err) {
      console.log("loopUpdateAdjustedLines Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.createdMealLog = await this.createMealLogInTracker();
    } catch (err) {
      console.log("createMealLogInTracker Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.loopCreateMealLines();
    } catch (err) {
      console.log("loopCreateMealLines Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.loopSaveFoodItems();
    } catch (err) {
      console.log("loopSaveFoodItems Action Error:", err.message);
      //**errorLog
      this.loopSaveFoodItemsError = err;
    }
    try {
      await this.markCandidateMealCommitted();
    } catch (err) {
      console.log("markCandidateMealCommitted Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.updateSessionStateCompleted();
    } catch (err) {
      console.log("updateSessionStateCompleted Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Update each aiCandidateLine row with adjusted gram amounts and
   ** recalculated nutrition values
   ***********************************************************************/

  async runStep_loopUpdateAdjustedLines(adjLine, stepIndex, stepResults) {}

  async loopUpdateAdjustedLines() {
    // Loop Action
    const loopList = runMScript(() => this.adjustedLines, {
      path: "services[4].businessLogic[1].actions.loopActions[0].loopFor",
    });

    const stpResults = {};

    let stpIndex = 0;
    for (const adjLine of loopList) {
      await this.runStep_loopUpdateAdjustedLines(
        adjLine,
        stpIndex++,
        stpResults,
      );
    }

    return loopList.length;
  }

  /***********************************************************************
   ** Create one mealLine in mealTracker per adjusted candidate line
   ***********************************************************************/

  async runStep_loopCreateMealLines(mealLineItem, stepIndex, stepResults) {
    const stepResult_createMealLineInTracker =
      await this.createMealLineInTracker(
        mealLineItem,
        stepIndex,
        stepResults,
        mealLineItem,
      );
    stepResults[`createMealLineInTracker_${stepIndex}`] =
      stepResult_createMealLineInTracker;
  }

  async loopCreateMealLines() {
    // Loop Action
    const loopList = runMScript(() => this.adjustedLines, {
      path: "services[4].businessLogic[1].actions.loopActions[1].loopFor",
    });

    const stpResults = {};

    let stpIndex = 0;
    for (const mealLineItem of loopList) {
      await this.runStep_loopCreateMealLines(
        mealLineItem,
        stpIndex++,
        stpResults,
      );
    }

    return loopList.length;
  }

  /***********************************************************************
   ** For each adjusted line with saveAsFood=true, save the food to
   ** nutritionLibrary
   ***********************************************************************/

  async runStep_loopSaveFoodItems(saveFoodItem, stepIndex, stepResults) {
    const stepResult_saveFoodToLibrary = await this.saveFoodToLibrary(
      saveFoodItem,
      stepIndex,
      stepResults,
      saveFoodItem,
    );
    stepResults[`saveFoodToLibrary_${stepIndex}`] =
      stepResult_saveFoodToLibrary;
  }

  async loopSaveFoodItems() {
    // Loop Action
    const loopList = runMScript(
      () => this.adjustedLines.filter((l) => l.saveAsFood === true),
      { path: "services[4].businessLogic[1].actions.loopActions[2].loopFor" },
    );

    const stpResults = {};

    let stpIndex = 0;
    for (const saveFoodItem of loopList) {
      await this.runStep_loopSaveFoodItems(
        saveFoodItem,
        stpIndex++,
        stpResults,
      );
    }

    return loopList.length;
  }

  /***********************************************************************
   ** Update the aiCandidateMeal with recalculated nutrition totals
   ***********************************************************************/
  async updateCandidateMealTotals() {
    // Aggregated Update Operation on childObject aiCandidateMeal

    const params = {
      totalCalories: runMScript(() => this.recalculatedTotals.totalCalories, {
        path: "services[4].businessLogic[1].actions.updateCrudActions[0].dataClause[0].dataValue",
      }),
      totalProtein: runMScript(() => this.recalculatedTotals.totalProtein, {
        path: "services[4].businessLogic[1].actions.updateCrudActions[0].dataClause[1].dataValue",
      }),
      totalCarbohydrates: runMScript(
        () => this.recalculatedTotals.totalCarbohydrates,
        {
          path: "services[4].businessLogic[1].actions.updateCrudActions[0].dataClause[2].dataValue",
        },
      ),
      totalFat: runMScript(() => this.recalculatedTotals.totalFat, {
        path: "services[4].businessLogic[1].actions.updateCrudActions[0].dataClause[3].dataValue",
      }),
      totalSugar: runMScript(() => this.recalculatedTotals.totalSugar, {
        path: "services[4].businessLogic[1].actions.updateCrudActions[0].dataClause[4].dataValue",
      }),
      totalFiber: runMScript(() => this.recalculatedTotals.totalFiber, {
        path: "services[4].businessLogic[1].actions.updateCrudActions[0].dataClause[5].dataValue",
      }),
    };
    const userQuery = runMScript(() => ({ id: this.aiCandidateMealId }), {
      path: "services[4].businessLogic[1].actions.updateCrudActions[0].whereClause",
    });

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);

    const result = await updateAiCandidateMealByQuery(params, query, this);
    if (!result) return null;

    const resultArray = Array.isArray(result) ? result : [result];
    // if updated record is in main data update main data
    if (this.dbResult) {
      for (const item of resultArray) {
        if (item.id == this.dbResult.id) {
          Object.assign(this.dbResult, item);
          this.aiCandidateMeal = this.dbResult;
        }
      }
    }
    if (resultArray.length == 0) return null;
    if (resultArray.length == 1) return resultArray[0];
    return resultArray;
  }

  /***********************************************************************
   ** Mark aiCandidateMeal as committed with the mealLog ID from mealTracker
   ***********************************************************************/
  async markCandidateMealCommitted() {
    // Aggregated Update Operation on childObject aiCandidateMeal

    const params = {
      isCommitted: true,
      committedMealLogId: runMScript(() => this.createdMealLog.id, {
        path: "services[4].businessLogic[1].actions.updateCrudActions[1].dataClause[1].dataValue",
      }),
    };
    const userQuery = runMScript(() => ({ id: this.aiCandidateMealId }), {
      path: "services[4].businessLogic[1].actions.updateCrudActions[1].whereClause",
    });

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);

    const result = await updateAiCandidateMealByQuery(params, query, this);
    if (!result) return null;

    const resultArray = Array.isArray(result) ? result : [result];
    // if updated record is in main data update main data
    if (this.dbResult) {
      for (const item of resultArray) {
        if (item.id == this.dbResult.id) {
          Object.assign(this.dbResult, item);
          this.aiCandidateMeal = this.dbResult;
        }
      }
    }
    if (resultArray.length == 0) return null;
    if (resultArray.length == 1) return resultArray[0];
    return resultArray;
  }

  /***********************************************************************
   ** Update the parent aiSession to completed state
   ***********************************************************************/
  async updateSessionStateCompleted() {
    // Aggregated Update Operation on childObject aiSession

    const params = {
      sessionState: "completed",
    };
    const userQuery = runMScript(
      () => ({ id: this.aiCandidateMeal.aiSessionId }),
      {
        path: "services[4].businessLogic[1].actions.updateCrudActions[2].whereClause",
      },
    );

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);

    const result = await updateAiSessionByQuery(params, query, this);
    if (!result) return null;

    const resultArray = Array.isArray(result) ? result : [result];
    // if updated record is in main data update main data
    if (this.dbResult) {
      for (const item of resultArray) {
        if (item.id == this.dbResult.id) {
          Object.assign(this.dbResult, item);
          this.aiCandidateMeal = this.dbResult;
        }
      }
    }
    if (resultArray.length == 0) return null;
    if (resultArray.length == 1) return resultArray[0];
    return resultArray;
  }

  /***********************************************************************
   ** Load all aiCandidateLine rows for this candidate meal
   ***********************************************************************/
  async fetchCandidateLines() {
    // Fetch Object on childObject aiCandidateLine

    const userQuery = runMScript(
      () => ({ aiCandidateMealId: this.aiCandidateMealId }),
      {
        path: "services[4].businessLogic[1].actions.fetchObjectActions[0].whereClause",
      },
    );

    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object list from db
    const dataList = (await getAiCandidateLineListByQuery(scriptQuery)) ?? [];

    return dataList;
  }

  /***********************************************************************
   ** Merge per-line gram/saveAsFood overrides from the request into the
   ** candidate lines array
   ***********************************************************************/

  async applyLineAdjustments() {
    try {
      return runMScript(
        () =>
          LIB.applyLineAdjustments(this.candidateLines, this.lineAdjustments),
        {
          path: "services[4].businessLogic[1].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error("Error in FunctionCallAction applyLineAdjustments:", err);
      throw err;
    }
  }

  /***********************************************************************
   ** Recompute the six nutrition totals after gram adjustments
   ***********************************************************************/

  async recalculateMealTotals() {
    try {
      return runMScript(() => LIB.recalculateMealTotals(this.adjustedLines), {
        path: "services[4].businessLogic[1].actions.functionCallActions[1].callScript",
      });
    } catch (err) {
      console.error("Error in FunctionCallAction recalculateMealTotals:", err);
      throw err;
    }
  }

  /***********************************************************************
   ** Call mealTracker.createMealLog to create the meal log record under the
   ** user's session
   ***********************************************************************/

  async createMealLogInTracker() {
    const { InterService } = require("serviceCommon");

    const bodyParams = {};

    bodyParams["mealDate"] = runMScript(
      () => this.aiCandidateMeal.proposedMealDate,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[0].apiParameters[0].value",
      },
    );

    bodyParams["mealTime"] = runMScript(
      () => this.aiCandidateMeal.proposedMealTime,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[0].apiParameters[1].value",
      },
    );

    bodyParams["slotName"] = runMScript(
      () => this.aiCandidateMeal.proposedSlotName,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[0].apiParameters[2].value",
      },
    );

    bodyParams["logSource"] = "aiAssistant";

    bodyParams["totalCalories"] = runMScript(
      () => this.recalculatedTotals.totalCalories,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[0].apiParameters[4].value",
      },
    );

    bodyParams["totalProtein"] = runMScript(
      () => this.recalculatedTotals.totalProtein,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[0].apiParameters[5].value",
      },
    );

    bodyParams["totalCarbohydrates"] = runMScript(
      () => this.recalculatedTotals.totalCarbohydrates,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[0].apiParameters[6].value",
      },
    );

    bodyParams["totalFat"] = runMScript(
      () => this.recalculatedTotals.totalFat,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[0].apiParameters[7].value",
      },
    );

    bodyParams["totalSugar"] = runMScript(
      () => this.recalculatedTotals.totalSugar,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[0].apiParameters[8].value",
      },
    );

    bodyParams["totalFiber"] = runMScript(
      () => this.recalculatedTotals.totalFiber,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[0].apiParameters[9].value",
      },
    );

    const pathParams = {};

    // forwardCallerToken: capture the inbound caller's bearer token and
    // pass it through to the downstream service so the call runs under
    // the user's identity (downstream sees the actual session.userId /
    // roleId / ownership context). Same access pattern AgentCallAction
    // uses for AgentHub dispatch. When no user session exists at
    // runtime, we silently fall back to M2M-only — the downstream call
    // still succeeds via the M2M trust path, but the agent should
    // ideally have set forwardCallerToken:false on this action since
    // there's no user context to forward.
    const _callerBearer = this.request?.sessionToken || null;
    const resp = await InterService.callMealTrackerCreateMealLog(
      {
        body: bodyParams,
        pathParams,
      },
      _callerBearer ? { userBearer: _callerBearer } : {},
    );

    return resp?.content ?? resp;
  }

  /***********************************************************************
   ** Call mealTracker.createMealLine for one adjusted candidate line
   ***********************************************************************/

  async createMealLineInTracker(
    mealLineItem,
    stepIndex,
    stepResults,
    crudItem,
  ) {
    const { InterService } = require("serviceCommon");

    const bodyParams = {};

    bodyParams["mealLogId"] = runMScript(() => this.createdMealLog.id, {
      path: "services[4].businessLogic[1].actions.interserviceCallActions[1].apiParameters[0].value",
    });

    bodyParams["itemName"] = runMScript(() => mealLineItem.detectedFoodName, {
      path: "services[4].businessLogic[1].actions.interserviceCallActions[1].apiParameters[1].value",
    });

    bodyParams["consumedGrams"] = runMScript(
      () => mealLineItem.estimatedGrams,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[1].apiParameters[2].value",
      },
    );

    bodyParams["itemCalories"] = runMScript(
      () => mealLineItem.estimatedCalories,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[1].apiParameters[3].value",
      },
    );

    bodyParams["itemProtein"] = runMScript(
      () => mealLineItem.estimatedProtein,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[1].apiParameters[4].value",
      },
    );

    bodyParams["itemCarbohydrates"] = runMScript(
      () => mealLineItem.estimatedCarbohydrates,
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[1].apiParameters[5].value",
      },
    );

    bodyParams["itemFat"] = runMScript(() => mealLineItem.estimatedFat, {
      path: "services[4].businessLogic[1].actions.interserviceCallActions[1].apiParameters[6].value",
    });

    bodyParams["itemSugar"] = runMScript(() => mealLineItem.estimatedSugar, {
      path: "services[4].businessLogic[1].actions.interserviceCallActions[1].apiParameters[7].value",
    });

    bodyParams["itemFiber"] = runMScript(() => mealLineItem.estimatedFiber, {
      path: "services[4].businessLogic[1].actions.interserviceCallActions[1].apiParameters[8].value",
    });

    bodyParams["lineSource"] = "aiAssistant";

    const pathParams = {};

    // forwardCallerToken: capture the inbound caller's bearer token and
    // pass it through to the downstream service so the call runs under
    // the user's identity (downstream sees the actual session.userId /
    // roleId / ownership context). Same access pattern AgentCallAction
    // uses for AgentHub dispatch. When no user session exists at
    // runtime, we silently fall back to M2M-only — the downstream call
    // still succeeds via the M2M trust path, but the agent should
    // ideally have set forwardCallerToken:false on this action since
    // there's no user context to forward.
    const _callerBearer = this.request?.sessionToken || null;
    const resp = await InterService.callMealTrackerCreateMealLine(
      {
        body: bodyParams,
        pathParams,
      },
      _callerBearer ? { userBearer: _callerBearer } : {},
    );

    return resp?.content ?? resp;
  }

  /***********************************************************************
   ** Call nutritionLibrary.createFoodItem for a line with saveAsFood=true,
   ** converting gram-based nutrition to per-100g values
   ***********************************************************************/

  async saveFoodToLibrary(saveFoodItem, stepIndex, stepResults, crudItem) {
    const { InterService } = require("serviceCommon");

    const bodyParams = {};

    bodyParams["foodName"] = runMScript(() => saveFoodItem.detectedFoodName, {
      path: "services[4].businessLogic[1].actions.interserviceCallActions[2].apiParameters[0].value",
    });

    bodyParams["caloriePer100g"] = runMScript(
      () =>
        LIB.per100g(
          saveFoodItem.estimatedCalories,
          saveFoodItem.estimatedGrams,
        ),
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[2].apiParameters[1].value",
      },
    );

    bodyParams["proteinPer100g"] = runMScript(
      () =>
        LIB.per100g(saveFoodItem.estimatedProtein, saveFoodItem.estimatedGrams),
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[2].apiParameters[2].value",
      },
    );

    bodyParams["carbohydratePer100g"] = runMScript(
      () =>
        LIB.per100g(
          saveFoodItem.estimatedCarbohydrates,
          saveFoodItem.estimatedGrams,
        ),
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[2].apiParameters[3].value",
      },
    );

    bodyParams["fatPer100g"] = runMScript(
      () => LIB.per100g(saveFoodItem.estimatedFat, saveFoodItem.estimatedGrams),
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[2].apiParameters[4].value",
      },
    );

    bodyParams["sugarPer100g"] = runMScript(
      () =>
        LIB.per100g(saveFoodItem.estimatedSugar, saveFoodItem.estimatedGrams),
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[2].apiParameters[5].value",
      },
    );

    bodyParams["fiberPer100g"] = runMScript(
      () =>
        LIB.per100g(saveFoodItem.estimatedFiber, saveFoodItem.estimatedGrams),
      {
        path: "services[4].businessLogic[1].actions.interserviceCallActions[2].apiParameters[6].value",
      },
    );

    bodyParams["creationSource"] = "aiAssistant";

    const pathParams = {};

    // forwardCallerToken: capture the inbound caller's bearer token and
    // pass it through to the downstream service so the call runs under
    // the user's identity (downstream sees the actual session.userId /
    // roleId / ownership context). Same access pattern AgentCallAction
    // uses for AgentHub dispatch. When no user session exists at
    // runtime, we silently fall back to M2M-only — the downstream call
    // still succeeds via the M2M trust path, but the agent should
    // ideally have set forwardCallerToken:false on this action since
    // there's no user context to forward.
    const _callerBearer = this.request?.sessionToken || null;
    const resp = await InterService.callNutritionLibraryCreateFoodItem(
      {
        body: bodyParams,
        pathParams,
      },
      _callerBearer ? { userBearer: _callerBearer } : {},
    );

    return resp?.content ?? resp;
  }
}

module.exports = ConfirmCandidateMealManager;
