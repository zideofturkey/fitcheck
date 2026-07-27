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

const MacroTarget = require("./macroTarget");
const FoodItem = require("./foodItem");
const PresetMeal = require("./presetMeal");
const PresetLine = require("./presetLine");
const Dish = require("./dish");
const DishLine = require("./dishLine");

MacroTarget.prototype.getData = function () {
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

FoodItem.prototype.getData = function () {
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
  const creationSourceOptions = ["manualEntry", "aiAssistant"];
  const dataTypecreationSourceFoodItem = typeof data.creationSource;
  const enumIndexcreationSourceFoodItem =
    dataTypecreationSourceFoodItem === "string"
      ? creationSourceOptions.indexOf(data.creationSource)
      : data.creationSource;
  data.creationSource_idx = enumIndexcreationSourceFoodItem;
  data.creationSource =
    enumIndexcreationSourceFoodItem > -1
      ? creationSourceOptions[enumIndexcreationSourceFoodItem]
      : null;

  data._owner = data.userId ?? undefined;

  return data;
};

PresetMeal.prototype.getData = function () {
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

PresetLine.prototype.getData = function () {
  const data = this.dataValues;

  data.presetMeal = this.presetMeal ? this.presetMeal.getData() : undefined;
  data.foodItem = this.foodItem ? this.foodItem.getData() : undefined;
  data.dish = this.dish ? this.dish.getData() : undefined;

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

Dish.prototype.getData = function () {
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

DishLine.prototype.getData = function () {
  const data = this.dataValues;

  data.dish = this.dish ? this.dish.getData() : undefined;
  data.foodItem = this.foodItem ? this.foodItem.getData() : undefined;

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

PresetLine.belongsTo(PresetMeal, {
  as: "presetMeal",
  foreignKey: "presetMealId",
  targetKey: "id",
  constraints: false,
});

PresetLine.belongsTo(FoodItem, {
  as: "foodItem",
  foreignKey: "foodItemId",
  targetKey: "id",
  constraints: false,
});

PresetLine.belongsTo(Dish, {
  as: "dish",
  foreignKey: "dishId",
  targetKey: "id",
  constraints: false,
});

DishLine.belongsTo(Dish, {
  as: "dish",
  foreignKey: "dishId",
  targetKey: "id",
  constraints: false,
});

DishLine.belongsTo(FoodItem, {
  as: "foodItem",
  foreignKey: "foodItemId",
  targetKey: "id",
  constraints: false,
});

module.exports = {
  MacroTarget,
  FoodItem,
  PresetMeal,
  PresetLine,
  Dish,
  DishLine,
  updateElasticIndexMappings,
  getElasticMapping,
  ELASTIC_MAPPINGS,
  sequelize,
  Sequelize, // Export Sequelize class for migrations (DataTypes)
};
