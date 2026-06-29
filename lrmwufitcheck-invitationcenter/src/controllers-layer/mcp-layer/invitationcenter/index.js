module.exports = (headers) => {
  // invitationcenter Database Crud Object Mcp Api Routers
  return {
    inviteLinkMcpRouter: require("./inviteLink")(headers),
    inviteAuditMcpRouter: require("./inviteAudit")(headers),
  };
};
