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

const Sys_agentOverride = require("./sys_agentOverride");
const Sys_agentExecution = require("./sys_agentExecution");
const Sys_toolCatalog = require("./sys_toolCatalog");
const Sys_agentConversation = require("./sys_agentConversation");

Sys_agentOverride.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  return data;
};

Sys_agentExecution.prototype.getData = function () {
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
  const agentTypeOptions = ["design", "dynamic"];
  const dataTypeagentTypeSys_agentExecution = typeof data.agentType;
  const enumIndexagentTypeSys_agentExecution =
    dataTypeagentTypeSys_agentExecution === "string"
      ? agentTypeOptions.indexOf(data.agentType)
      : data.agentType;
  data.agentType_idx = enumIndexagentTypeSys_agentExecution;
  data.agentType =
    enumIndexagentTypeSys_agentExecution > -1
      ? agentTypeOptions[enumIndexagentTypeSys_agentExecution]
      : null;
  // set enum Index and enum value
  const sourceOptions = ["rest", "sse", "kafka", "agent"];
  const dataTypesourceSys_agentExecution = typeof data.source;
  const enumIndexsourceSys_agentExecution =
    dataTypesourceSys_agentExecution === "string"
      ? sourceOptions.indexOf(data.source)
      : data.source;
  data.source_idx = enumIndexsourceSys_agentExecution;
  data.source =
    enumIndexsourceSys_agentExecution > -1
      ? sourceOptions[enumIndexsourceSys_agentExecution]
      : null;
  // set enum Index and enum value
  const statusOptions = ["success", "error", "timeout"];
  const dataTypestatusSys_agentExecution = typeof data.status;
  const enumIndexstatusSys_agentExecution =
    dataTypestatusSys_agentExecution === "string"
      ? statusOptions.indexOf(data.status)
      : data.status;
  data.status_idx = enumIndexstatusSys_agentExecution;
  data.status =
    enumIndexstatusSys_agentExecution > -1
      ? statusOptions[enumIndexstatusSys_agentExecution]
      : null;

  return data;
};

Sys_toolCatalog.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  return data;
};

Sys_agentConversation.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  return data;
};

module.exports = {
  Sys_agentOverride,
  Sys_agentExecution,
  Sys_toolCatalog,
  Sys_agentConversation,
  updateElasticIndexMappings,
  getElasticMapping,
  ELASTIC_MAPPINGS,
  sequelize,
  Sequelize, // Export Sequelize class for migrations (DataTypes)
};
