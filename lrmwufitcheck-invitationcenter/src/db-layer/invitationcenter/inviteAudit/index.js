const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createInviteAudit: utils.createInviteAudit,
  createBulkInviteAudit: utils.createBulkInviteAudit,
  getIdListOfInviteAuditByField: utils.getIdListOfInviteAuditByField,
  getInviteAuditById: utils.getInviteAuditById,
  getInviteAuditAggById: utils.getInviteAuditAggById,
  getInviteAuditListByQuery: utils.getInviteAuditListByQuery,
  getInviteAuditListByMQuery: utils.getInviteAuditListByMQuery,
  getInviteAuditStatsByQuery: utils.getInviteAuditStatsByQuery,
  getInviteAuditStatsByMQuery: utils.getInviteAuditStatsByMQuery,
  getInviteAuditByQuery: utils.getInviteAuditByQuery,
  getInviteAuditByMQuery: utils.getInviteAuditByMQuery,
  updateInviteAuditById: utils.updateInviteAuditById,
  updateInviteAuditByIdList: utils.updateInviteAuditByIdList,
  updateInviteAuditByQuery: utils.updateInviteAuditByQuery,
  updateInviteAuditByMQuery: utils.updateInviteAuditByMQuery,
  deleteInviteAuditById: utils.deleteInviteAuditById,
  deleteInviteAuditByQuery: utils.deleteInviteAuditByQuery,
  deleteInviteAuditByMQuery: utils.deleteInviteAuditByMQuery,
  dbScriptListInviteaudits: dbApiScripts.dbScriptListInviteaudits,
  dbScript_fetchListinviteaudit: dbApiScripts.dbScript_fetchListinviteaudit,
};
