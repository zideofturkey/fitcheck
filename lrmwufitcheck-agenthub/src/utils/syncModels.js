const { sequelize } = require("common");

const { Sys_agentOverride } = require("../models");
const { Sys_agentExecution } = require("../models");
const { Sys_toolCatalog } = require("../models");
const { Sys_agentConversation } = require("../models");

const syncModels = async () => {
  // Sync each model separately for atomicity
  // This prevents issues when one model fails to sync
  const startTime = new Date();
  console.log("Syncing Sequelize models to database started", startTime);

  try {
    await Sys_agentOverride.sync({ force: false, alter: true });
    console.log("Sys_agentOverride model synced successfully");
  } catch (err) {
    console.error("Error syncing Sys_agentOverride model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await Sys_agentExecution.sync({ force: false, alter: true });
    console.log("Sys_agentExecution model synced successfully");
  } catch (err) {
    console.error("Error syncing Sys_agentExecution model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await Sys_toolCatalog.sync({ force: false, alter: true });
    console.log("Sys_toolCatalog model synced successfully");
  } catch (err) {
    console.error("Error syncing Sys_toolCatalog model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await Sys_agentConversation.sync({ force: false, alter: true });
    console.log("Sys_agentConversation model synced successfully");
  } catch (err) {
    console.error("Error syncing Sys_agentConversation model:", err.message);
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
