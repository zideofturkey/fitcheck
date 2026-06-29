const InvitationCenterServiceRestController = require("./InvitationCenterServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new InvitationCenterServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
