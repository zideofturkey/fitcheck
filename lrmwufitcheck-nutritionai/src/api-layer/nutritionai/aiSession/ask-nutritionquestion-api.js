const { runMScript } = require("common");

const AiSessionManager = require("./AiSessionManager");

const {
  dbScriptAskNutritionquestion,
  createAiGuidanceNote,
  updateAiSessionByQuery,
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
const { getIntegrationClient } = require("integrations");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class AskNutritionQuestionManager extends AiSessionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "askNutritionQuestion",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "aiSession";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.aiSessionId = this.aiSessionId;
    jsonObj.inputText = this.inputText;
    jsonObj.contextRange = this.contextRange;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.aiSessionId = request.body?.["aiSessionId"];
    this.inputText = request.body?.["inputText"];
    this.contextRange = request.body?.["contextRange"];
    this.userId = request.session?.["userId"];
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.aiSessionId = this.aiSessionId ?? this.id;
    this.id = this.aiSessionId;
  }

  readMcpParameters(request) {
    this.aiSessionId = request.mcpParams?.["aiSessionId"];
    this.inputText = request.mcpParams?.["inputText"];
    this.contextRange = request.mcpParams?.["contextRange"];
    this.userId = request.session?.["userId"];
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;

    this.aiSessionId = this.aiSessionId ?? this.id;
    this.id = this.aiSessionId;
  }

  async transformParameters() {}

  // data clause methods

  async buildDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.aiSessionId = this.id;
    if (!this.aiSessionId) this.aiSessionId = newUUID(false);
    this.id = this.aiSessionId;

    const dataClause = {
      id: this.aiSessionId,
      userId: this.userId,
      sessionType: "nutritionGuidance",
      inputText: runMScript(() => this.inputText, {
        path: "services[4].businessLogic[2].dataClauseItems[1].value",
      }),
      detectedLanguage: "tr",
      sessionState: "pending",
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

  checkParameterType_aiSessionId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_aiSessionId() {
    if (this.aiSessionId == null) return;

    if (Array.isArray(this.aiSessionId)) {
      throw new BadRequestError("errMsg_aiSessionIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_aiSessionId(this.aiSessionId)) {
      throw new BadRequestError("errMsg_aiSessionIdTypeIsNotValid");
    }
  }

  checkParameter_inputText() {
    if (this.inputText == null) {
      throw new BadRequestError("errMsg_inputTextisRequired");
    }

    if (Array.isArray(this.inputText)) {
      throw new BadRequestError("errMsg_inputTextMustNotBeAnArray");
    }

    // Parameter Type: Text
  }

  checkParameter_contextRange() {
    if (this.contextRange == null) return;

    if (Array.isArray(this.contextRange)) {
      throw new BadRequestError("errMsg_contextRangeMustNotBeAnArray");
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
    if (this.aiSessionId === "") this.aiSessionId = null;
    this.checkParameter_aiSessionId();

    this.checkParameter_inputText();

    this.checkParameter_contextRange();

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
    return await dbScriptAskNutritionquestion(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.aiSession, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterCheckParameters() {
    try {
      this.macroTargets = await this.fetchMacroTargets();
    } catch (err) {
      console.log("fetchMacroTargets Action Error:", err.message);
      //**errorLog
      this.fetchMacroTargetsError = err;
    }
    try {
      this.nutritionContext = await this.fetchNutritionContext();
    } catch (err) {
      console.log("fetchNutritionContext Action Error:", err.message);
      //**errorLog
      this.fetchNutritionContextError = err;
    }
  }

  async afterMainCreateOperation() {
    try {
      this.geminiGuidanceRawResponse = await this.callGeminiAskNutrition();
    } catch (err) {
      console.log("callGeminiAskNutrition Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.guidanceResult = await this.parseGuidanceGeminiResult();
    } catch (err) {
      console.log("parseGuidanceGeminiResult Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.updateSessionWithGuidanceResult();
    } catch (err) {
      console.log("updateSessionWithGuidanceResult Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.createdGuidanceNote = await this.createGuidanceNote();
    } catch (err) {
      console.log("createGuidanceNote Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Persist the structured guidance Q&A outcome as an aiGuidanceNote
   ***********************************************************************/
  async createGuidanceNote() {
    // Aggregated Update Operation on childObject aiGuidanceNote

    const params = {
      userId: runMScript(() => this.session.userId, {
        path: "services[4].businessLogic[2].actions.createCrudActions[0].dataClause[0].dataValue",
      }),
      aiSessionId: runMScript(() => this.aiSession.id, {
        path: "services[4].businessLogic[2].actions.createCrudActions[0].dataClause[1].dataValue",
      }),
      questionType: runMScript(() => this.guidanceResult.questionType, {
        path: "services[4].businessLogic[2].actions.createCrudActions[0].dataClause[2].dataValue",
      }),
      contextRange: runMScript(() => this.guidanceResult.contextRange, {
        path: "services[4].businessLogic[2].actions.createCrudActions[0].dataClause[3].dataValue",
      }),
      answerSummary: runMScript(() => this.guidanceResult.answerSummary, {
        path: "services[4].businessLogic[2].actions.createCrudActions[0].dataClause[4].dataValue",
      }),
      rationaleText: runMScript(() => this.guidanceResult.rationaleText, {
        path: "services[4].businessLogic[2].actions.createCrudActions[0].dataClause[5].dataValue",
      }),
      referencedMetricKeys: runMScript(
        () => this.guidanceResult.referencedMetricKeys,
        {
          path: "services[4].businessLogic[2].actions.createCrudActions[0].dataClause[6].dataValue",
        },
      ),
      cautionText: runMScript(() => this.guidanceResult.cautionText, {
        path: "services[4].businessLogic[2].actions.createCrudActions[0].dataClause[7].dataValue",
      }),
    };

    return await createAiGuidanceNote(params, this);
  }

  /***********************************************************************
   ** Update the created aiSession with AI guidance result fields
   ***********************************************************************/
  async updateSessionWithGuidanceResult() {
    // Aggregated Update Operation on childObject aiSession

    const params = {
      sessionState: "completed",
      finalResponseText: runMScript(
        () => this.guidanceResult.finalResponseText,
        {
          path: "services[4].businessLogic[2].actions.updateCrudActions[0].dataClause[1].dataValue",
        },
      ),
      confidenceScore: runMScript(() => this.guidanceResult.confidenceScore, {
        path: "services[4].businessLogic[2].actions.updateCrudActions[0].dataClause[2].dataValue",
      }),
    };
    const userQuery = runMScript(() => ({ id: this.aiSession.id }), {
      path: "services[4].businessLogic[2].actions.updateCrudActions[0].whereClause",
    });

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
          this.aiSession = this.dbResult;
        }
      }
    }
    if (resultArray.length == 0) return null;
    if (resultArray.length == 1) return resultArray[0];
    return resultArray;
  }

  /***********************************************************************
   ** Calls Google Gemini gemini-2.5-flash via the declared integration to
   ** answer the Turkish nutrition question. Result is stored as
   ** geminiGuidanceRawResponse.
   ***********************************************************************/
  async callGeminiAskNutrition() {
    // Integration Action for googleGemini

    const input = {
      config: runMScript(
        () => ({
          model: "gemini-2.5-flash",
          temperature: 0.4,
          maxOutputTokens: 1000,
        }),
        {
          path: "services[4].businessLogic[2].actions.integrationActions[0].parameters[0].parameterValue",
        },
      ),
      prompt: runMScript(
        () =>
          LIB.answerNutritionQuestion.buildGuidancePromptText(
            this.inputText,
            this.macroTargets,
            this.nutritionContext,
            this.contextRange || "today",
          ),
        {
          path: "services[4].businessLogic[2].actions.integrationActions[0].parameters[1].parameterValue",
        },
      ),
    };

    const googleGeminiClient = await getIntegrationClient("googleGemini");
    return await googleGeminiClient.generateContent(input);
  }

  /***********************************************************************
   ** Parses the raw Gemini text response into the structured guidance
   ** result object expected by the downstream actions.
   ***********************************************************************/

  async parseGuidanceGeminiResult() {
    try {
      return runMScript(
        () =>
          LIB.answerNutritionQuestion.parseGeminiGuidanceResponse(
            this.geminiGuidanceRawResponse &&
              (this.geminiGuidanceRawResponse.text ||
                (this.geminiGuidanceRawResponse.candidates &&
                  this.geminiGuidanceRawResponse.candidates[0] &&
                  this.geminiGuidanceRawResponse.candidates[0].content &&
                  this.geminiGuidanceRawResponse.candidates[0].content.parts &&
                  this.geminiGuidanceRawResponse.candidates[0].content
                    .parts[0] &&
                  this.geminiGuidanceRawResponse.candidates[0].content.parts[0]
                    .text) ||
                JSON.stringify(this.geminiGuidanceRawResponse)),
            this.contextRange || "today",
          ),
        {
          path: "services[4].businessLogic[2].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error(
        "Error in FunctionCallAction parseGuidanceGeminiResult:",
        err,
      );
      throw err;
    }
  }

  /***********************************************************************
   ** Fetch the user's current daily macro targets from nutritionLibrary
   ***********************************************************************/

  async fetchMacroTargets() {
    const { InterService } = require("serviceCommon");

    const bodyParams = {};

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
    const resp = await InterService.callNutritionLibraryGetMyMacroTarget(
      {
        body: bodyParams,
        pathParams,
      },
      _callerBearer ? { userBearer: _callerBearer } : {},
    );

    return resp?.macroTarget ?? resp?.content ?? resp;
  }

  /***********************************************************************
   ** Fetch the user's meal totals summary from mealTracker for the
   ** requested context range
   ***********************************************************************/

  async fetchNutritionContext() {
    const { InterService } = require("serviceCommon");

    const bodyParams = {};

    bodyParams["contextRange"] = runMScript(
      () => this.contextRange || "today",
      {
        path: "services[4].businessLogic[2].actions.interserviceCallActions[1].apiParameters[0].value",
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
    const resp = await InterService.callMealTrackerGetDailyProgress(
      {
        body: bodyParams,
        pathParams,
      },
      _callerBearer ? { userBearer: _callerBearer } : {},
    );

    return resp?.nutritionDay ?? resp?.content ?? resp;
  }
}

module.exports = AskNutritionQuestionManager;
