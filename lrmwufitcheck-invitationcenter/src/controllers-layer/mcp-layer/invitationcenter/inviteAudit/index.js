module.exports = (headers) => {
  // InviteAudit Db Object Rest Api Router
  const inviteAuditMcpRouter = [];

  // listInviteAudits controller
  inviteAuditMcpRouter.push(require("./list-inviteaudits-api")(headers));
  // _fetchListInviteAudit controller
  inviteAuditMcpRouter.push(require("./_fetch-listinviteaudit-api")(headers));

  return inviteAuditMcpRouter;
};
