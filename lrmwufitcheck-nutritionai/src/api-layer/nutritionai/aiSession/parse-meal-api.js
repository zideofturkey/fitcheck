const { runMScript } = require("common");

const AiSessionManager = require("./AiSessionManager");

const {
  dbScriptParseMeal,
  createAiCandidateMeal,
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

class ParseMealManager extends AiSessionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "parseMeal",
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
    jsonObj.proposedMealDate = this.proposedMealDate;
    jsonObj.proposedMealTime = this.proposedMealTime;
    jsonObj.proposedSlotName = this.proposedSlotName;
    jsonObj.userId = this.userId;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.aiSessionId = request.body?.["aiSessionId"];
    this.inputText = request.body?.["inputText"];
    this.proposedMealDate = request.body?.["proposedMealDate"];
    this.proposedMealTime = request.body?.["proposedMealTime"];
    this.proposedSlotName = request.body?.["proposedSlotName"];
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
    this.proposedMealDate = request.mcpParams?.["proposedMealDate"];
    this.proposedMealTime = request.mcpParams?.["proposedMealTime"];
    this.proposedSlotName = request.mcpParams?.["proposedSlotName"];
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
      sessionType: "mealParsing",
      inputText: runMScript(() => this.inputText, {
        path: "services[4].businessLogic[0].dataClauseItems[1].value",
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

    this.checkParameter_proposedMealDate();

    this.checkParameter_proposedMealTime();

    this.checkParameter_proposedSlotName();

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
    return await dbScriptParseMeal(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.aiSession, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  // Work Flow

  async afterMainCreateOperation() {
    try {
      this.geminiMealRawResponse = await this.callGeminiParseMeal();
    } catch (err) {
      console.log("callGeminiParseMeal Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.parsedMealResult = await this.parseMealGeminiResult();
    } catch (err) {
      console.log("parseMealGeminiResult Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.updateSessionWithParseResult();
    } catch (err) {
      console.log("updateSessionWithParseResult Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      this.createdCandidateMeal = await this.createCandidateMeal();
    } catch (err) {
      console.log("createCandidateMeal Action Error:", err.message);
      //**errorLog
      throw err;
    }
    try {
      await this.loopCreateCandidateLines();
    } catch (err) {
      console.log("loopCreateCandidateLines Action Error:", err.message);
      //**errorLog
      throw err;
    }
  }

  // Action Store

  /***********************************************************************
   ** Iterate over parsed food lines and create one aiCandidateLine per
   ** detected food item
   ***********************************************************************/

  async runStep_loopCreateCandidateLines(lineItem, stepIndex, stepResults) {}

  async loopCreateCandidateLines() {
    // Loop Action
    const loopList = runMScript(() => this.parsedMealResult.lines, {
      path: "services[4].businessLogic[0].actions.loopActions[0].loopFor",
    });

    const stpResults = {};

    let stpIndex = 0;
    for (const lineItem of loopList) {
      await this.runStep_loopCreateCandidateLines(
        lineItem,
        stpIndex++,
        stpResults,
      );
    }

    return loopList.length;
  }

  /***********************************************************************
   ** Insert the AI-proposed candidate meal record
   ***********************************************************************/
  async createCandidateMeal() {
    // Aggregated Update Operation on childObject aiCandidateMeal

    const params = {
      userId: runMScript(() => this.session.userId, {
        path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[0].dataValue",
      }),
      aiSessionId: runMScript(() => this.aiSession.id, {
        path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[1].dataValue",
      }),
      proposedMealDate: runMScript(
        () => this.parsedMealResult.proposedMealDate,
        {
          path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[2].dataValue",
        },
      ),
      proposedMealTime: runMScript(
        () => this.parsedMealResult.proposedMealTime,
        {
          path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[3].dataValue",
        },
      ),
      proposedSlotName: runMScript(
        () => this.parsedMealResult.proposedSlotName,
        {
          path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[4].dataValue",
        },
      ),
      candidateSource: "aiAssistant",
      warningText: runMScript(() => this.parsedMealResult.warningText, {
        path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[6].dataValue",
      }),
      confirmationRequired: runMScript(
        () => this.parsedMealResult.confirmationRequired,
        {
          path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[7].dataValue",
        },
      ),
      isConfirmed: false,
      isCommitted: false,
      totalCalories: runMScript(() => this.parsedMealResult.totalCalories, {
        path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[10].dataValue",
      }),
      totalProtein: runMScript(() => this.parsedMealResult.totalProtein, {
        path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[11].dataValue",
      }),
      totalCarbohydrates: runMScript(
        () => this.parsedMealResult.totalCarbohydrates,
        {
          path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[12].dataValue",
        },
      ),
      totalFat: runMScript(() => this.parsedMealResult.totalFat, {
        path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[13].dataValue",
      }),
      totalSugar: runMScript(() => this.parsedMealResult.totalSugar, {
        path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[14].dataValue",
      }),
      totalFiber: runMScript(() => this.parsedMealResult.totalFiber, {
        path: "services[4].businessLogic[0].actions.createCrudActions[0].dataClause[15].dataValue",
      }),
    };

    return await createAiCandidateMeal(params, this);
  }

  /***********************************************************************
   ** Update the created aiSession row with AI result fields
   ***********************************************************************/
  async updateSessionWithParseResult() {
    // Aggregated Update Operation on childObject aiSession

    const params = {
      detectedLanguage: runMScript(
        () => this.parsedMealResult.detectedLanguage,
        {
          path: "services[4].businessLogic[0].actions.updateCrudActions[0].dataClause[0].dataValue",
        },
      ),
      confidenceScore: runMScript(() => this.parsedMealResult.confidenceScore, {
        path: "services[4].businessLogic[0].actions.updateCrudActions[0].dataClause[1].dataValue",
      }),
      sessionState: runMScript(() => this.parsedMealResult.sessionState, {
        path: "services[4].businessLogic[0].actions.updateCrudActions[0].dataClause[2].dataValue",
      }),
      finalResponseText: runMScript(
        () => this.parsedMealResult.finalResponseText,
        {
          path: "services[4].businessLogic[0].actions.updateCrudActions[0].dataClause[3].dataValue",
        },
      ),
    };
    const userQuery = runMScript(() => ({ id: this.aiSession.id }), {
      path: "services[4].businessLogic[0].actions.updateCrudActions[0].whereClause",
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
   ** Calls Google Gemini gemini-2.5-flash to parse the Turkish meal
   ** description into structured nutrition JSON. Returns the raw text
   ** response to be parsed by the next FunctionCallAction.
   ***********************************************************************/
  async callGeminiParseMeal() {
    // Integration Action for googleGemini

    const input = {
      config: runMScript(
        () => ({
          apiKey: process.env.GOOGLE_GEMINI_API_KEY,
          model: "gemini-2.5-flash",
          temperature: 0.3,
          maxOutputTokens: 2000,
        }),
        {
          path: "services[4].businessLogic[0].actions.integrationActions[0].parameters[0].parameterValue",
        },
      ),
      prompt: runMScript(
        () =>
          LIB.parseMealWithAI.buildFullPromptText(
            this.inputText,
            this.proposedMealDate,
            this.proposedMealTime,
            this.proposedSlotName,
          ),
        {
          path: "services[4].businessLogic[0].actions.integrationActions[0].parameters[1].parameterValue",
        },
      ),
    };

    const googleGeminiClient = await getIntegrationClient("googleGemini");
    return await googleGeminiClient.generateContent(input);
  }

  /***********************************************************************
   ** Parses the raw Gemini text response into the structured nutrition
   ** result object expected by the downstream actions.
   ***********************************************************************/

  async parseMealGeminiResult() {
    try {
      return runMScript(
        () =>
          LIB.parseMealWithAI.parseGeminiMealResponse(
            this.geminiMealRawResponse &&
              (this.geminiMealRawResponse.text ||
                (this.geminiMealRawResponse.candidates &&
                  this.geminiMealRawResponse.candidates[0] &&
                  this.geminiMealRawResponse.candidates[0].content &&
                  this.geminiMealRawResponse.candidates[0].content.parts &&
                  this.geminiMealRawResponse.candidates[0].content.parts[0] &&
                  this.geminiMealRawResponse.candidates[0].content.parts[0]
                    .text) ||
                JSON.stringify(this.geminiMealRawResponse)),
            this.proposedMealDate,
            this.proposedMealTime,
            this.proposedSlotName,
          ),
        {
          path: "services[4].businessLogic[0].actions.functionCallActions[0].callScript",
        },
      );
    } catch (err) {
      console.error("Error in FunctionCallAction parseMealGeminiResult:", err);
      throw err;
    }
  }
}

module.exports = ParseMealManager;
