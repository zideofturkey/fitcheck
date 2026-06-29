const { sequelize } = require("common");

const { MacroTarget } = require("../models");
const { FoodItem } = require("../models");
const { PresetMeal } = require("../models");
const { PresetLine } = require("../models");

const syncModels = async () => {
  // Sync each model separately for atomicity
  // This prevents issues when one model fails to sync
  const startTime = new Date();
  console.log("Syncing Sequelize models to database started", startTime);

  try {
    await MacroTarget.sync({ force: false, alter: true });
    console.log("MacroTarget model synced successfully");
  } catch (err) {
    console.error("Error syncing MacroTarget model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await FoodItem.sync({ force: false, alter: true });
    console.log("FoodItem model synced successfully");
  } catch (err) {
    console.error("Error syncing FoodItem model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await PresetMeal.sync({ force: false, alter: true });
    console.log("PresetMeal model synced successfully");
  } catch (err) {
    console.error("Error syncing PresetMeal model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await PresetLine.sync({ force: false, alter: true });
    console.log("PresetLine model synced successfully");
  } catch (err) {
    console.error("Error syncing PresetLine model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  const elapsedTime = new Date() - startTime;
  console.log(
    "Sequelize models sync completed -> elapsedTime:",
    elapsedTime,
    "ms",
  );
};

module.exports = syncModels;
