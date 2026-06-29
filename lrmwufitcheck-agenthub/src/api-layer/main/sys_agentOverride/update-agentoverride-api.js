const { runMScript } = require("common");

const Sys_agentOverrideManager = require("./Sys_agentOverrideManager");

const { dbScriptUpdateAgentoverride } = require("dbLayer");
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
const {
  AgentoverrideUpdatedPublisher,
} = require("../../api-events/publishers");

// use this object to access db utils functions with in Mscript or actions
const db = require("dbLayer");

class UpdateAgentOverrideManager extends Sys_agentOverrideManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateAgentOverride",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      M2MAllowed: false,
    });

    this.dataName = "sys_agentOverride";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.sys_agentOverrideId = this.sys_agentOverrideId;
    jsonObj.provider = this.provider;
    jsonObj.model = this.model;
    jsonObj.systemPrompt = this.systemPrompt;
    jsonObj.temperature = this.temperature;
    jsonObj.maxTokens = this.maxTokens;
    jsonObj.responseFormat = this.responseFormat;
    jsonObj.selectedTools = this.selectedTools;
    jsonObj.guardrails = this.guardrails;
    jsonObj.enabled = this.enabled;
    jsonObj.updatedBy = this.updatedBy;
  }

  async checkBasicAuth() {
    if (this.checkAbsolute()) return true;
  }

  readRestParameters(request) {
    this.sys_agentOverrideId = request.params?.["sys_agentOverrideId"];
    this.provider = request.body?.["provider"];
    this.model = request.body?.["model"];
    this.systemPrompt = request.body?.["systemPrompt"];
    this.temperature = request.body?.["temperature"];
    this.maxTokens = request.body?.["maxTokens"];
    this.responseFormat = request.body?.["responseFormat"];
    this.selectedTools = request.body?.["selectedTools"];
    this.guardrails = request.body?.["guardrails"];
    this.enabled = request.body?.["enabled"];
    this.updatedBy = request.session?.["userId"];
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");

    this.sys_agentOverrideId = this.sys_agentOverrideId ?? this.id;
    this.id = this.sys_agentOverrideId;
  }

  readMcpParameters(request) {
    this.sys_agentOverrideId = request.mcpParams?.["sys_agentOverrideId"];
    this.provider = request.mcpParams?.["provider"];
    this.model = request.mcpParams?.["model"];
    this.systemPrompt = request.mcpParams?.["systemPrompt"];
    this.temperature = request.mcpParams?.["temperature"];
    this.maxTokens = request.mcpParams?.["maxTokens"];
    this.responseFormat = request.mcpParams?.["responseFormat"];
    this.selectedTools = request.mcpParams?.["selectedTools"];
    this.guardrails = request.mcpParams?.["guardrails"];
    this.enabled = request.mcpParams?.["enabled"];
    this.updatedBy = request.session?.["userId"];
    this.requestData = request.mcpParams;

    this.sys_agentOverrideId = this.sys_agentOverrideId ?? this.id;
    this.id = this.sys_agentOverrideId;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return runMScript(() => ({ id: this.sys_agentOverrideId }), {
      path: "services[5].businessLogic[3].whereClause.fullWhereClause",
    });

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
      provider: runMScript(() => this.provider, {
        path: "services[5].businessLogic[3].dataClauseItems[0].value",
      }),
      model: runMScript(() => this.model, {
        path: "services[5].businessLogic[3].dataClauseItems[1].value",
      }),
      systemPrompt: runMScript(() => this.systemPrompt, {
        path: "services[5].businessLogic[3].dataClauseItems[2].value",
      }),
      temperature: runMScript(() => this.temperature, {
        path: "services[5].businessLogic[3].dataClauseItems[3].value",
      }),
      maxTokens: runMScript(() => this.maxTokens, {
        path: "services[5].businessLogic[3].dataClauseItems[4].value",
      }),
      responseFormat: runMScript(() => this.responseFormat, {
        path: "services[5].businessLogic[3].dataClauseItems[5].value",
      }),
      selectedTools:
        runMScript(() => this.selectedTools, {
          path: "services[5].businessLogic[3].dataClauseItems[6].value",
        }) === undefined
          ? undefined
          : runMScript(() => this.selectedTools, {
                path: "services[5].businessLogic[3].dataClauseItems[6].value",
              })
            ? typeof runMScript(() => this.selectedTools, {
                path: "services[5].businessLogic[3].dataClauseItems[6].value",
              }) == "string"
              ? JSON.parse(
                  runMScript(() => this.selectedTools, {
                    path: "services[5].businessLogic[3].dataClauseItems[6].value",
                  }),
                )
              : runMScript(() => this.selectedTools, {
                  path: "services[5].businessLogic[3].dataClauseItems[6].value",
                })
            : null,
      guardrails:
        runMScript(() => this.guardrails, {
          path: "services[5].businessLogic[3].dataClauseItems[7].value",
        }) === undefined
          ? undefined
          : runMScript(() => this.guardrails, {
                path: "services[5].businessLogic[3].dataClauseItems[7].value",
              })
            ? typeof runMScript(() => this.guardrails, {
                path: "services[5].businessLogic[3].dataClauseItems[7].value",
              }) == "string"
              ? JSON.parse(
                  runMScript(() => this.guardrails, {
                    path: "services[5].businessLogic[3].dataClauseItems[7].value",
                  }),
                )
              : runMScript(() => this.guardrails, {
                  path: "services[5].businessLogic[3].dataClauseItems[7].value",
                })
            : null,
      enabled: runMScript(() => this.enabled, {
        path: "services[5].businessLogic[3].dataClauseItems[8].value",
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
      const _idFieldsAndIsArray = [["updatedBy", false]];
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
    const { getSys_agentOverrideByQuery } = require("dbLayer");

    console.log("this.whereClause -->", this.whereClause);
    this.sys_agentOverride = await getSys_agentOverrideByQuery(
      this.whereClause,
    );
    if (!this.sys_agentOverride) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
    this._instance = this.sys_agentOverride;
    this.instance = this.sys_agentOverride;
  }

  async checkInstance() {
    if (!this.sys_agentOverride) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameterType_sys_agentOverrideId(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_sys_agentOverrideId() {
    if (this.sys_agentOverrideId == null) {
      throw new BadRequestError("errMsg_sys_agentOverrideIdisRequired");
    }

    if (Array.isArray(this.sys_agentOverrideId)) {
      throw new BadRequestError("errMsg_sys_agentOverrideIdMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (
      !this.checkParameterType_sys_agentOverrideId(this.sys_agentOverrideId)
    ) {
      throw new BadRequestError("errMsg_sys_agentOverrideIdTypeIsNotValid");
    }
  }

  checkParameter_provider() {
    if (this.provider == null) return;

    if (Array.isArray(this.provider)) {
      throw new BadRequestError("errMsg_providerMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_model() {
    if (this.model == null) return;

    if (Array.isArray(this.model)) {
      throw new BadRequestError("errMsg_modelMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameter_systemPrompt() {
    if (this.systemPrompt == null) return;

    if (Array.isArray(this.systemPrompt)) {
      throw new BadRequestError("errMsg_systemPromptMustNotBeAnArray");
    }

    // Parameter Type: Text
  }

  checkParameterType_temperature(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_temperature() {
    if (this.temperature == null) return;

    if (Array.isArray(this.temperature)) {
      throw new BadRequestError("errMsg_temperatureMustNotBeAnArray");
    }

    // Parameter Type: Double

    if (!this.checkParameterType_temperature(this.temperature)) {
      throw new BadRequestError("errMsg_temperatureTypeIsNotValid");
    }
  }

  checkParameterType_maxTokens(paramValue) {
    if (isNaN(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_maxTokens() {
    if (this.maxTokens == null) return;

    if (Array.isArray(this.maxTokens)) {
      throw new BadRequestError("errMsg_maxTokensMustNotBeAnArray");
    }

    // Parameter Type: Integer

    if (!this.checkParameterType_maxTokens(this.maxTokens)) {
      throw new BadRequestError("errMsg_maxTokensTypeIsNotValid");
    }
  }

  checkParameter_responseFormat() {
    if (this.responseFormat == null) return;

    if (Array.isArray(this.responseFormat)) {
      throw new BadRequestError("errMsg_responseFormatMustNotBeAnArray");
    }

    // Parameter Type: String
  }

  checkParameterType_selectedTools(paramValue) {
    if (typeof paramValue !== "object") {
      return false;
    }

    return true;
  }

  checkParameter_selectedTools() {
    if (this.selectedTools == null) return;

    if (Array.isArray(this.selectedTools)) {
      throw new BadRequestError("errMsg_selectedToolsMustNotBeAnArray");
    }

    // Parameter Type: Object

    if (!this.checkParameterType_selectedTools(this.selectedTools)) {
      throw new BadRequestError("errMsg_selectedToolsTypeIsNotValid");
    }
  }

  checkParameterType_guardrails(paramValue) {
    if (typeof paramValue !== "object") {
      return false;
    }

    return true;
  }

  checkParameter_guardrails() {
    if (this.guardrails == null) return;

    if (Array.isArray(this.guardrails)) {
      throw new BadRequestError("errMsg_guardrailsMustNotBeAnArray");
    }

    // Parameter Type: Object

    if (!this.checkParameterType_guardrails(this.guardrails)) {
      throw new BadRequestError("errMsg_guardrailsTypeIsNotValid");
    }
  }

  checkParameterType_enabled(paramValue) {
    const isBoolean = (n) => !!n === n;
    if (!isBoolean(paramValue)) {
      throw new BadRequestError("errMsg_enabledisNotAValidBoolean");
    }

    return true;
  }

  checkParameter_enabled() {
    if (this.enabled == null) return;

    if (Array.isArray(this.enabled)) {
      throw new BadRequestError("errMsg_enabledMustNotBeAnArray");
    }

    // Parameter Type: Boolean

    if (!this.checkParameterType_enabled(this.enabled)) {
      throw new BadRequestError("errMsg_enabledTypeIsNotValid");
    }
  }

  checkParameterType_updatedBy(paramValue) {
    if (!isValidUUID(paramValue)) {
      return false;
    }

    return true;
  }

  checkParameter_updatedBy() {
    if (this.updatedBy == null) return;

    if (Array.isArray(this.updatedBy)) {
      throw new BadRequestError("errMsg_updatedByMustNotBeAnArray");
    }

    // Parameter Type: ID

    if (!this.checkParameterType_updatedBy(this.updatedBy)) {
      throw new BadRequestError("errMsg_updatedByTypeIsNotValid");
    }
  }

  checkParameters() {
    if (this.sys_agentOverrideId === "") this.sys_agentOverrideId = null;
    this.checkParameter_sys_agentOverrideId();

    this.checkParameter_provider();

    this.checkParameter_model();

    this.checkParameter_systemPrompt();

    this.checkParameter_temperature();

    this.checkParameter_maxTokens();

    this.checkParameter_responseFormat();

    this.checkParameter_selectedTools();

    this.checkParameter_guardrails();

    this.checkParameter_enabled();

    if (this.updatedBy === "") this.updatedBy = null;
    this.checkParameter_updatedBy();

    // filter parameters
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.sys_agentOverride?._owner === this.session.userId;
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
    return await dbScriptUpdateAgentoverride(this);

    /* 
    the main operation result is accessable in the context through 
    this.dbResult, this.sys_agentOverride, this.data
    */
  }

  async addToOutput() {
    const _target = this._streamOutput ?? this.output;
  }

  async raiseEvent() {
    AgentoverrideUpdatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
        //**errorLog
      },
    );
  }

  // Work Flow

  // Action Store
}

module.exports = UpdateAgentOverrideManager;
