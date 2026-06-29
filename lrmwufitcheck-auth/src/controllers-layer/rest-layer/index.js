const mainRouters = require("./main");

const sessionRouter = require("./session-router");

const { getSocialLoginRouter } = require("./social-login-router");

const geoRouter = require("./geo-router");
const { dbAdminRouter } = require("./dbadmin-controller");
module.exports = {
  ...mainRouters,
  AuthServiceRestController: require("./AuthServiceRestController"),
  ...sessionRouter,
  getSocialLoginRouter,
  geoRouter,
  dbAdminRouter,
};
