const invitationcenterRouters = require("./invitationcenter");

const sessionRouter = require("./session-router");

const geoRouter = require("./geo-router");
const { dbAdminRouter } = require("./dbadmin-controller");
module.exports = {
  ...invitationcenterRouters,
  InvitationCenterServiceRestController: require("./InvitationCenterServiceRestController"),
  ...sessionRouter,
  geoRouter,
  dbAdminRouter,
};
