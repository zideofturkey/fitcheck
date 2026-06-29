const mainRouters = require("./main");

const sessionRouter = require("./session-router");

const geoRouter = require("./geo-router");
const { dbAdminRouter } = require("./dbadmin-controller");
module.exports = {
  ...mainRouters,
  AgentHubServiceRestController: require("./AgentHubServiceRestController"),
  ...sessionRouter,
  geoRouter,
  dbAdminRouter,
};
