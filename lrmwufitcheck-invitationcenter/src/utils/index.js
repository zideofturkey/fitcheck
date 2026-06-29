const elasticSyncUtils = require("./syncElasticData.js");
const migrationUtils = require("./runMigrations.js");

module.exports = {
  initService: require("./init-service.js"),
  getPublicKey: require("./getPublicKey.js"),
  setCurrentKeyId: require("./setCurrentKeyId.js"),
  // Elastic sync utilities
  ...elasticSyncUtils,
  // Migration utilities
  ...migrationUtils,
  // Note: syncModels is now handled by migrations
  ...require("./crons"),
  ...require("./clientInfo"),
};
