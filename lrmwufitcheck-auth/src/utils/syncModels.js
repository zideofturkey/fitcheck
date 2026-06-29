const { sequelize } = require("common");

const { User } = require("../models");
const { UserAvatarsFile } = require("../models");

const syncModels = async () => {
  // Sync each model separately for atomicity
  // This prevents issues when one model fails to sync
  const startTime = new Date();
  console.log("Syncing Sequelize models to database started", startTime);

  try {
    await User.sync({ force: false, alter: true });
    console.log("User model synced successfully");
  } catch (err) {
    console.error("Error syncing User model:", err.message);
    console.error(err);
    //**errorLog
    // Continue with other models even if one fails
  }

  try {
    await UserAvatarsFile.sync({ force: false, alter: true });
    console.log("UserAvatarsFile model synced successfully");
  } catch (err) {
    console.error("Error syncing UserAvatarsFile model:", err.message);
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
