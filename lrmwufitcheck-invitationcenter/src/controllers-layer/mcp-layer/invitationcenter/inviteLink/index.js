module.exports = (headers) => {
  // InviteLink Db Object Rest Api Router
  const inviteLinkMcpRouter = [];

  // createInviteLink controller
  inviteLinkMcpRouter.push(require("./create-invitelink-api")(headers));
  // validateInviteCode controller
  inviteLinkMcpRouter.push(require("./validate-invitecode-api")(headers));
  // getInviteLinkByCode controller
  inviteLinkMcpRouter.push(require("./get-invitelinkbycode-api")(headers));
  // activateInviteLink controller
  inviteLinkMcpRouter.push(require("./activate-invitelink-api")(headers));
  // revokeInviteLink controller
  inviteLinkMcpRouter.push(require("./revoke-invitelink-api")(headers));
  // deliverInviteEmail controller
  inviteLinkMcpRouter.push(require("./deliver-inviteemail-api")(headers));
  // consumeInviteLink controller
  inviteLinkMcpRouter.push(require("./consume-invitelink-api")(headers));
  // getInviteLink controller
  inviteLinkMcpRouter.push(require("./get-invitelink-api")(headers));
  // listInviteLinks controller
  inviteLinkMcpRouter.push(require("./list-invitelinks-api")(headers));
  // _fetchListInviteLink controller
  inviteLinkMcpRouter.push(require("./_fetch-listinvitelink-api")(headers));

  return inviteLinkMcpRouter;
};
