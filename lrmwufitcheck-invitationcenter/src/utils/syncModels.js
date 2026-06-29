const { sequelize } = require("common");

const { InviteLink } = require("../models");
const { InviteAudit } = require("../models");

const syncModels = async () => {
  // Sync each model separately for atomicity
  // This prevents issues when one model fails to sync
  const startTime = new Date();
  console.log("Syncing Sequelize models to database started", startTime);

  try {
    await InviteLink.sync({ force: false, alter: true });
    console.log("InviteLink model synced successfully");
  } catch (err) {
    console.error("Error syncing InviteLink model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await InviteAudit.sync({ force: false, alter: true });
    console.log("InviteAudit model synced successfully");
  } catch (err) {
    console.error("Error syncing InviteAudit model:", err.message);
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
