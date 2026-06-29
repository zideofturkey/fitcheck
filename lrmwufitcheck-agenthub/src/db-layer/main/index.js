const sys_agentOverrideFunctions = require("./sys_agentOverride");
const sys_agentExecutionFunctions = require("./sys_agentExecution");
const sys_toolCatalogFunctions = require("./sys_toolCatalog");
const sys_agentConversationFunctions = require("./sys_agentConversation");

module.exports = {
  // main Database
  createSys_agentOverride: sys_agentOverrideFunctions.createSys_agentOverride,
  createBulkSys_agentOverride:
    sys_agentOverrideFunctions.createBulkSys_agentOverride,
  getIdListOfSys_agentOverrideByField:
    sys_agentOverrideFunctions.getIdListOfSys_agentOverrideByField,
  getSys_agentOverrideById: sys_agentOverrideFunctions.getSys_agentOverrideById,
  getSys_agentOverrideAggById:
    sys_agentOverrideFunctions.getSys_agentOverrideAggById,
  getSys_agentOverrideListByQuery:
    sys_agentOverrideFunctions.getSys_agentOverrideListByQuery,
  getSys_agentOverrideListByMQuery:
    sys_agentOverrideFunctions.getSys_agentOverrideListByMQuery,
  getSys_agentOverrideStatsByQuery:
    sys_agentOverrideFunctions.getSys_agentOverrideStatsByQuery,
  getSys_agentOverrideStatsByMQuery:
    sys_agentOverrideFunctions.getSys_agentOverrideStatsByMQuery,
  getSys_agentOverrideByQuery:
    sys_agentOverrideFunctions.getSys_agentOverrideByQuery,
  getSys_agentOverrideByMQuery:
    sys_agentOverrideFunctions.getSys_agentOverrideByMQuery,
  updateSys_agentOverrideById:
    sys_agentOverrideFunctions.updateSys_agentOverrideById,
  updateSys_agentOverrideByIdList:
    sys_agentOverrideFunctions.updateSys_agentOverrideByIdList,
  updateSys_agentOverrideByQuery:
    sys_agentOverrideFunctions.updateSys_agentOverrideByQuery,
  updateSys_agentOverrideByMQuery:
    sys_agentOverrideFunctions.updateSys_agentOverrideByMQuery,
  deleteSys_agentOverrideById:
    sys_agentOverrideFunctions.deleteSys_agentOverrideById,
  deleteSys_agentOverrideByQuery:
    sys_agentOverrideFunctions.deleteSys_agentOverrideByQuery,
  deleteSys_agentOverrideByMQuery:
    sys_agentOverrideFunctions.deleteSys_agentOverrideByMQuery,
  dbScriptGetAgentoverride: sys_agentOverrideFunctions.dbScriptGetAgentoverride,
  dbScriptListAgentoverrides:
    sys_agentOverrideFunctions.dbScriptListAgentoverrides,
  dbScriptCreateAgentoverride:
    sys_agentOverrideFunctions.dbScriptCreateAgentoverride,
  dbScriptUpdateAgentoverride:
    sys_agentOverrideFunctions.dbScriptUpdateAgentoverride,
  dbScriptDeleteAgentoverride:
    sys_agentOverrideFunctions.dbScriptDeleteAgentoverride,
  dbScript_fetchListsys_agentoverride:
    sys_agentOverrideFunctions.dbScript_fetchListsys_agentoverride,
  createSys_agentExecution:
    sys_agentExecutionFunctions.createSys_agentExecution,
  createBulkSys_agentExecution:
    sys_agentExecutionFunctions.createBulkSys_agentExecution,
  getIdListOfSys_agentExecutionByField:
    sys_agentExecutionFunctions.getIdListOfSys_agentExecutionByField,
  getSys_agentExecutionById:
    sys_agentExecutionFunctions.getSys_agentExecutionById,
  getSys_agentExecutionAggById:
    sys_agentExecutionFunctions.getSys_agentExecutionAggById,
  getSys_agentExecutionListByQuery:
    sys_agentExecutionFunctions.getSys_agentExecutionListByQuery,
  getSys_agentExecutionListByMQuery:
    sys_agentExecutionFunctions.getSys_agentExecutionListByMQuery,
  getSys_agentExecutionStatsByQuery:
    sys_agentExecutionFunctions.getSys_agentExecutionStatsByQuery,
  getSys_agentExecutionStatsByMQuery:
    sys_agentExecutionFunctions.getSys_agentExecutionStatsByMQuery,
  getSys_agentExecutionByQuery:
    sys_agentExecutionFunctions.getSys_agentExecutionByQuery,
  getSys_agentExecutionByMQuery:
    sys_agentExecutionFunctions.getSys_agentExecutionByMQuery,
  updateSys_agentExecutionById:
    sys_agentExecutionFunctions.updateSys_agentExecutionById,
  updateSys_agentExecutionByIdList:
    sys_agentExecutionFunctions.updateSys_agentExecutionByIdList,
  updateSys_agentExecutionByQuery:
    sys_agentExecutionFunctions.updateSys_agentExecutionByQuery,
  updateSys_agentExecutionByMQuery:
    sys_agentExecutionFunctions.updateSys_agentExecutionByMQuery,
  deleteSys_agentExecutionById:
    sys_agentExecutionFunctions.deleteSys_agentExecutionById,
  deleteSys_agentExecutionByQuery:
    sys_agentExecutionFunctions.deleteSys_agentExecutionByQuery,
  deleteSys_agentExecutionByMQuery:
    sys_agentExecutionFunctions.deleteSys_agentExecutionByMQuery,
  dbScriptListAgentexecutions:
    sys_agentExecutionFunctions.dbScriptListAgentexecutions,
  dbScriptGetAgentexecution:
    sys_agentExecutionFunctions.dbScriptGetAgentexecution,
  dbScript_fetchListsys_agentexecution:
    sys_agentExecutionFunctions.dbScript_fetchListsys_agentexecution,
  createSys_toolCatalog: sys_toolCatalogFunctions.createSys_toolCatalog,
  createBulkSys_toolCatalog: sys_toolCatalogFunctions.createBulkSys_toolCatalog,
  getIdListOfSys_toolCatalogByField:
    sys_toolCatalogFunctions.getIdListOfSys_toolCatalogByField,
  getSys_toolCatalogById: sys_toolCatalogFunctions.getSys_toolCatalogById,
  getSys_toolCatalogAggById: sys_toolCatalogFunctions.getSys_toolCatalogAggById,
  getSys_toolCatalogListByQuery:
    sys_toolCatalogFunctions.getSys_toolCatalogListByQuery,
  getSys_toolCatalogListByMQuery:
    sys_toolCatalogFunctions.getSys_toolCatalogListByMQuery,
  getSys_toolCatalogStatsByQuery:
    sys_toolCatalogFunctions.getSys_toolCatalogStatsByQuery,
  getSys_toolCatalogStatsByMQuery:
    sys_toolCatalogFunctions.getSys_toolCatalogStatsByMQuery,
  getSys_toolCatalogByQuery: sys_toolCatalogFunctions.getSys_toolCatalogByQuery,
  getSys_toolCatalogByMQuery:
    sys_toolCatalogFunctions.getSys_toolCatalogByMQuery,
  updateSys_toolCatalogById: sys_toolCatalogFunctions.updateSys_toolCatalogById,
  updateSys_toolCatalogByIdList:
    sys_toolCatalogFunctions.updateSys_toolCatalogByIdList,
  updateSys_toolCatalogByQuery:
    sys_toolCatalogFunctions.updateSys_toolCatalogByQuery,
  updateSys_toolCatalogByMQuery:
    sys_toolCatalogFunctions.updateSys_toolCatalogByMQuery,
  deleteSys_toolCatalogById: sys_toolCatalogFunctions.deleteSys_toolCatalogById,
  deleteSys_toolCatalogByQuery:
    sys_toolCatalogFunctions.deleteSys_toolCatalogByQuery,
  deleteSys_toolCatalogByMQuery:
    sys_toolCatalogFunctions.deleteSys_toolCatalogByMQuery,
  dbScriptListToolcatalog: sys_toolCatalogFunctions.dbScriptListToolcatalog,
  dbScriptGetToolcatalogentry:
    sys_toolCatalogFunctions.dbScriptGetToolcatalogentry,
  dbScript_fetchListsys_toolcatalog:
    sys_toolCatalogFunctions.dbScript_fetchListsys_toolcatalog,
  createSys_agentConversation:
    sys_agentConversationFunctions.createSys_agentConversation,
  createBulkSys_agentConversation:
    sys_agentConversationFunctions.createBulkSys_agentConversation,
  getIdListOfSys_agentConversationByField:
    sys_agentConversationFunctions.getIdListOfSys_agentConversationByField,
  getSys_agentConversationById:
    sys_agentConversationFunctions.getSys_agentConversationById,
  getSys_agentConversationAggById:
    sys_agentConversationFunctions.getSys_agentConversationAggById,
  getSys_agentConversationListByQuery:
    sys_agentConversationFunctions.getSys_agentConversationListByQuery,
  getSys_agentConversationListByMQuery:
    sys_agentConversationFunctions.getSys_agentConversationListByMQuery,
  getSys_agentConversationStatsByQuery:
    sys_agentConversationFunctions.getSys_agentConversationStatsByQuery,
  getSys_agentConversationStatsByMQuery:
    sys_agentConversationFunctions.getSys_agentConversationStatsByMQuery,
  getSys_agentConversationByQuery:
    sys_agentConversationFunctions.getSys_agentConversationByQuery,
  getSys_agentConversationByMQuery:
    sys_agentConversationFunctions.getSys_agentConversationByMQuery,
  updateSys_agentConversationById:
    sys_agentConversationFunctions.updateSys_agentConversationById,
  updateSys_agentConversationByIdList:
    sys_agentConversationFunctions.updateSys_agentConversationByIdList,
  updateSys_agentConversationByQuery:
    sys_agentConversationFunctions.updateSys_agentConversationByQuery,
  updateSys_agentConversationByMQuery:
    sys_agentConversationFunctions.updateSys_agentConversationByMQuery,
  deleteSys_agentConversationById:
    sys_agentConversationFunctions.deleteSys_agentConversationById,
  deleteSys_agentConversationByQuery:
    sys_agentConversationFunctions.deleteSys_agentConversationByQuery,
  deleteSys_agentConversationByMQuery:
    sys_agentConversationFunctions.deleteSys_agentConversationByMQuery,
  dbScriptListAgentchats: sys_agentConversationFunctions.dbScriptListAgentchats,
  dbScriptGetAgentchatmessages:
    sys_agentConversationFunctions.dbScriptGetAgentchatmessages,
  dbScript_fetchListsys_agentconversation:
    sys_agentConversationFunctions.dbScript_fetchListsys_agentconversation,
};
