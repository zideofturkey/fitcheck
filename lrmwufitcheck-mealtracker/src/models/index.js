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

const MealLog = require("./mealLog");
const MealLine = require("./mealLine");
const NutritionDay = require("./nutritionDay");

MealLog.prototype.getData = function () {
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
  const logSourceOptions = [
    "foodLibrary",
    "presetTemplate",
    "manualEntry",
    "aiAssistant",
  ];
  const dataTypelogSourceMealLog = typeof data.logSource;
  const enumIndexlogSourceMealLog =
    dataTypelogSourceMealLog === "string"
      ? logSourceOptions.indexOf(data.logSource)
      : data.logSource;
  data.logSource_idx = enumIndexlogSourceMealLog;
  data.logSource =
    enumIndexlogSourceMealLog > -1
      ? logSourceOptions[enumIndexlogSourceMealLog]
      : null;

  data._owner = data.userId ?? undefined;

  return data;
};

MealLine.prototype.getData = function () {
  const data = this.dataValues;

  data.mealLog = this.mealLog ? this.mealLog.getData() : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const lineSourceOptions = [
    "foodLibrary",
    "presetTemplate",
    "manualEntry",
    "aiAssistant",
    "temporaryAi",
  ];
  const dataTypelineSourceMealLine = typeof data.lineSource;
  const enumIndexlineSourceMealLine =
    dataTypelineSourceMealLine === "string"
      ? lineSourceOptions.indexOf(data.lineSource)
      : data.lineSource;
  data.lineSource_idx = enumIndexlineSourceMealLine;
  data.lineSource =
    enumIndexlineSourceMealLine > -1
      ? lineSourceOptions[enumIndexlineSourceMealLine]
      : null;

  data._owner = data.userId ?? undefined;

  return data;
};

MealLine.belongsTo(MealLog, {
  as: "mealLog",
  foreignKey: "mealLogId",
  targetKey: "id",
  constraints: false,
});

NutritionDay.prototype.getData = function () {
  const data = this.dataValues;

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

module.exports = {
  MealLog,
  MealLine,
  NutritionDay,
  updateElasticIndexMappings,
  getElasticMapping,
  ELASTIC_MAPPINGS,
  sequelize,
  Sequelize, // Export Sequelize class for migrations (DataTypes)
};
