const { sequelize } = require("common");

const { AiSession } = require("../models");
const { AiCandidateMeal } = require("../models");
const { AiCandidateLine } = require("../models");
const { AiGuidanceNote } = require("../models");

const syncModels = async () => {
  // Sync each model separately for atomicity
  // This prevents issues when one model fails to sync
  const startTime = new Date();
  console.log("Syncing Sequelize models to database started", startTime);

  try {
    await AiSession.sync({ force: false, alter: true });
    console.log("AiSession model synced successfully");
  } catch (err) {
    console.error("Error syncing AiSession model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await AiCandidateMeal.sync({ force: false, alter: true });
    console.log("AiCandidateMeal model synced successfully");
  } catch (err) {
    console.error("Error syncing AiCandidateMeal model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await AiCandidateLine.sync({ force: false, alter: true });
    console.log("AiCandidateLine model synced successfully");
  } catch (err) {
    console.error("Error syncing AiCandidateLine model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await AiGuidanceNote.sync({ force: false, alter: true });
    console.log("AiGuidanceNote model synced successfully");
  } catch (err) {
    console.error("Error syncing AiGuidanceNote model:", err.message);
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
