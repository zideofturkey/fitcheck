const InvitationCenterServiceMcpController = require("./InvitationCenterServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new InvitationCenterServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
