const { sequelize } = require("common");

const { MealLog } = require("../models");
const { MealLine } = require("../models");
const { NutritionDay } = require("../models");

const syncModels = async () => {
  // Sync each model separately for atomicity
  // This prevents issues when one model fails to sync
  const startTime = new Date();
  console.log("Syncing Sequelize models to database started", startTime);

  try {
    await MealLog.sync({ force: false, alter: true });
    console.log("MealLog model synced successfully");
  } catch (err) {
    console.error("Error syncing MealLog model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await MealLine.sync({ force: false, alter: true });
    console.log("MealLine model synced successfully");
  } catch (err) {
    console.error("Error syncing MealLine model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await NutritionDay.sync({ force: false, alter: true });
    console.log("NutritionDay model synced successfully");
  } catch (err) {
    console.error("Error syncing NutritionDay model:", err.message);
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
