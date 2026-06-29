const invitationcenterFunctions = require("./invitationcenter");

module.exports = {
  // invitationcenter Database
  createInviteLink: invitationcenterFunctions.createInviteLink,
  createBulkInviteLink: invitationcenterFunctions.createBulkInviteLink,
  getIdListOfInviteLinkByField:
    invitationcenterFunctions.getIdListOfInviteLinkByField,
  getInviteLinkById: invitationcenterFunctions.getInviteLinkById,
  getInviteLinkAggById: invitationcenterFunctions.getInviteLinkAggById,
  getInviteLinkListByQuery: invitationcenterFunctions.getInviteLinkListByQuery,
  getInviteLinkListByMQuery:
    invitationcenterFunctions.getInviteLinkListByMQuery,
  getInviteLinkStatsByQuery:
    invitationcenterFunctions.getInviteLinkStatsByQuery,
  getInviteLinkStatsByMQuery:
    invitationcenterFunctions.getInviteLinkStatsByMQuery,
  getInviteLinkByQuery: invitationcenterFunctions.getInviteLinkByQuery,
  getInviteLinkByMQuery: invitationcenterFunctions.getInviteLinkByMQuery,
  updateInviteLinkById: invitationcenterFunctions.updateInviteLinkById,
  updateInviteLinkByIdList: invitationcenterFunctions.updateInviteLinkByIdList,
  updateInviteLinkByQuery: invitationcenterFunctions.updateInviteLinkByQuery,
  updateInviteLinkByMQuery: invitationcenterFunctions.updateInviteLinkByMQuery,
  deleteInviteLinkById: invitationcenterFunctions.deleteInviteLinkById,
  deleteInviteLinkByQuery: invitationcenterFunctions.deleteInviteLinkByQuery,
  deleteInviteLinkByMQuery: invitationcenterFunctions.deleteInviteLinkByMQuery,
  getInviteLinkByInviteCode:
    invitationcenterFunctions.getInviteLinkByInviteCode,
  dbScriptCreateInvitelink: invitationcenterFunctions.dbScriptCreateInvitelink,
  dbScriptActivateInvitelink:
    invitationcenterFunctions.dbScriptActivateInvitelink,
  dbScriptRevokeInvitelink: invitationcenterFunctions.dbScriptRevokeInvitelink,
  dbScriptDeliverInviteemail:
    invitationcenterFunctions.dbScriptDeliverInviteemail,
  dbScriptValidateInvitecode:
    invitationcenterFunctions.dbScriptValidateInvitecode,
  dbScriptConsumeInvitelink:
    invitationcenterFunctions.dbScriptConsumeInvitelink,
  dbScriptGetInvitelinkbycode:
    invitationcenterFunctions.dbScriptGetInvitelinkbycode,
  dbScriptGetInvitelink: invitationcenterFunctions.dbScriptGetInvitelink,
  dbScriptListInvitelinks: invitationcenterFunctions.dbScriptListInvitelinks,
  dbScript_fetchListinvitelink:
    invitationcenterFunctions.dbScript_fetchListinvitelink,
  createInviteAudit: invitationcenterFunctions.createInviteAudit,
  createBulkInviteAudit: invitationcenterFunctions.createBulkInviteAudit,
  getIdListOfInviteAuditByField:
    invitationcenterFunctions.getIdListOfInviteAuditByField,
  getInviteAuditById: invitationcenterFunctions.getInviteAuditById,
  getInviteAuditAggById: invitationcenterFunctions.getInviteAuditAggById,
  getInviteAuditListByQuery:
    invitationcenterFunctions.getInviteAuditListByQuery,
  getInviteAuditListByMQuery:
    invitationcenterFunctions.getInviteAuditListByMQuery,
  getInviteAuditStatsByQuery:
    invitationcenterFunctions.getInviteAuditStatsByQuery,
  getInviteAuditStatsByMQuery:
    invitationcenterFunctions.getInviteAuditStatsByMQuery,
  getInviteAuditByQuery: invitationcenterFunctions.getInviteAuditByQuery,
  getInviteAuditByMQuery: invitationcenterFunctions.getInviteAuditByMQuery,
  updateInviteAuditById: invitationcenterFunctions.updateInviteAuditById,
  updateInviteAuditByIdList:
    invitationcenterFunctions.updateInviteAuditByIdList,
  updateInviteAuditByQuery: invitationcenterFunctions.updateInviteAuditByQuery,
  updateInviteAuditByMQuery:
    invitationcenterFunctions.updateInviteAuditByMQuery,
  deleteInviteAuditById: invitationcenterFunctions.deleteInviteAuditById,
  deleteInviteAuditByQuery: invitationcenterFunctions.deleteInviteAuditByQuery,
  deleteInviteAuditByMQuery:
    invitationcenterFunctions.deleteInviteAuditByMQuery,
  dbScriptListInviteaudits: invitationcenterFunctions.dbScriptListInviteaudits,
  dbScript_fetchListinviteaudit:
    invitationcenterFunctions.dbScript_fetchListinviteaudit,
};
