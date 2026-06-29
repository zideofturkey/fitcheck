module.exports = {
  // invitationcenter Database Crud Object Routes Manager Layer Classes
  // InviteLink Db Object
  CreateInviteLinkManager: require("./inviteLink/create-invitelink-api"),
  ActivateInviteLinkManager: require("./inviteLink/activate-invitelink-api"),
  RevokeInviteLinkManager: require("./inviteLink/revoke-invitelink-api"),
  DeliverInviteEmailManager: require("./inviteLink/deliver-inviteemail-api"),
  ValidateInviteCodeManager: require("./inviteLink/validate-invitecode-api"),
  ConsumeInviteLinkManager: require("./inviteLink/consume-invitelink-api"),
  GetInviteLinkByCodeManager: require("./inviteLink/get-invitelinkbycode-api"),
  GetInviteLinkManager: require("./inviteLink/get-invitelink-api"),
  ListInviteLinksManager: require("./inviteLink/list-invitelinks-api"),
  _fetchListInviteLinkManager: require("./inviteLink/_fetch-listinvitelink-api"),
  // InviteAudit Db Object
  ListInviteAuditsManager: require("./inviteAudit/list-inviteaudits-api"),
  _fetchListInviteAuditManager: require("./inviteAudit/_fetch-listinviteaudit-api"),
};
