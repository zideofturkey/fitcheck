const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;
const { getEnumValue } = require("serviceCommon");
const { ElasticIndexer } = require("serviceCommon");
const {
  updateElasticIndexMappings,
  getElasticMapping,
  ELASTIC_MAPPINGS,
} = require("./elastic-index");
const { hexaLogger, sequelize } = require("common");

const AiSession = require("./aiSession");
const AiCandidateMeal = require("./aiCandidateMeal");
const AiCandidateLine = require("./aiCandidateLine");
const AiGuidanceNote = require("./aiGuidanceNote");

AiSession.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const sessionTypeOptions = ["mealParsing", "nutritionGuidance"];
  const dataTypesessionTypeAiSession = typeof data.sessionType;
  const enumIndexsessionTypeAiSession =
    dataTypesessionTypeAiSession === "string"
      ? sessionTypeOptions.indexOf(data.sessionType)
      : data.sessionType;
  data.sessionType_idx = enumIndexsessionTypeAiSession;
  data.sessionType =
    enumIndexsessionTypeAiSession > -1
      ? sessionTypeOptions[enumIndexsessionTypeAiSession]
      : null;
  // set enum Index and enum value
  const sessionStateOptions = [
    "pending",
    "needsConfirmation",
    "completed",
    "failed",
  ];
  const dataTypesessionStateAiSession = typeof data.sessionState;
  const enumIndexsessionStateAiSession =
    dataTypesessionStateAiSession === "string"
      ? sessionStateOptions.indexOf(data.sessionState)
      : data.sessionState;
  data.sessionState_idx = enumIndexsessionStateAiSession;
  data.sessionState =
    enumIndexsessionStateAiSession > -1
      ? sessionStateOptions[enumIndexsessionStateAiSession]
      : null;

  data._owner = data.userId ?? undefined;

  return data;
};

AiCandidateMeal.prototype.getData = function () {
  const data = this.dataValues;

  data.session = this.session ? this.session.getData() : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const candidateSourceOptions = ["aiAssistant"];
  const dataTypecandidateSourceAiCandidateMeal = typeof data.candidateSource;
  const enumIndexcandidateSourceAiCandidateMeal =
    dataTypecandidateSourceAiCandidateMeal === "string"
      ? candidateSourceOptions.indexOf(data.candidateSource)
      : data.candidateSource;
  data.candidateSource_idx = enumIndexcandidateSourceAiCandidateMeal;
  data.candidateSource =
    enumIndexcandidateSourceAiCandidateMeal > -1
      ? candidateSourceOptions[enumIndexcandidateSourceAiCandidateMeal]
      : null;

  data._owner = data.userId ?? undefined;

  return data;
};

AiCandidateMeal.belongsTo(AiSession, {
  as: "session",
  foreignKey: "aiSessionId",
  targetKey: "id",
  constraints: false,
});

AiCandidateLine.prototype.getData = function () {
  const data = this.dataValues;

  data.candidateMeal = this.candidateMeal
    ? this.candidateMeal.getData()
    : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  data._owner = data.userId ?? undefined;

  return data;
};

AiCandidateLine.belongsTo(AiCandidateMeal, {
  as: "candidateMeal",
  foreignKey: "aiCandidateMealId",
  targetKey: "id",
  constraints: false,
});

AiGuidanceNote.prototype.getData = function () {
  const data = this.dataValues;

  data.session = this.session ? this.session.getData() : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  data._owner = data.userId ?? undefined;

  return data;
};

AiGuidanceNote.belongsTo(AiSession, {
  as: "session",
  foreignKey: "aiSessionId",
  targetKey: "id",
  constraints: false,
});

module.exports = {
  AiSession,
  AiCandidateMeal,
  AiCandidateLine,
  AiGuidanceNote,
  updateElasticIndexMappings,
  getElasticMapping,
  ELASTIC_MAPPINGS,
  sequelize,
  Sequelize, // Export Sequelize class for migrations (DataTypes)
};
