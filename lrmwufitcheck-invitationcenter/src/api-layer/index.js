module.exports = {
  InvitationCenterServiceManager: require("./service-manager/InvitationCenterServiceManager"),
  // invitationcenter Database Crud Object Routes Manager Layer Classes
  // InviteLink Db Object
  CreateInviteLinkManager: require("./invitationcenter/inviteLink/create-invitelink-api"),
  ActivateInviteLinkManager: require("./invitationcenter/inviteLink/activate-invitelink-api"),
  RevokeInviteLinkManager: require("./invitationcenter/inviteLink/revoke-invitelink-api"),
  DeliverInviteEmailManager: require("./invitationcenter/inviteLink/deliver-inviteemail-api"),
  ValidateInviteCodeManager: require("./invitationcenter/inviteLink/validate-invitecode-api"),
  ConsumeInviteLinkManager: require("./invitationcenter/inviteLink/consume-invitelink-api"),
  GetInviteLinkByCodeManager: require("./invitationcenter/inviteLink/get-invitelinkbycode-api"),
  GetInviteLinkManager: require("./invitationcenter/inviteLink/get-invitelink-api"),
  ListInviteLinksManager: require("./invitationcenter/inviteLink/list-invitelinks-api"),
  _fetchListInviteLinkManager: require("./invitationcenter/inviteLink/_fetch-listinvitelink-api"),
  // InviteAudit Db Object
  ListInviteAuditsManager: require("./invitationcenter/inviteAudit/list-inviteaudits-api"),
  _fetchListInviteAuditManager: require("./invitationcenter/inviteAudit/_fetch-listinviteaudit-api"),
  integrationRouter: require("./integrations/testRouter"),
};
