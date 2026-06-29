const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createSys_agentConversation: utils.createSys_agentConversation,
  createBulkSys_agentConversation: utils.createBulkSys_agentConversation,
  getIdListOfSys_agentConversationByField:
    utils.getIdListOfSys_agentConversationByField,
  getSys_agentConversationById: utils.getSys_agentConversationById,
  getSys_agentConversationAggById: utils.getSys_agentConversationAggById,
  getSys_agentConversationListByQuery:
    utils.getSys_agentConversationListByQuery,
  getSys_agentConversationListByMQuery:
    utils.getSys_agentConversationListByMQuery,
  getSys_agentConversationStatsByQuery:
    utils.getSys_agentConversationStatsByQuery,
  getSys_agentConversationStatsByMQuery:
    utils.getSys_agentConversationStatsByMQuery,
  getSys_agentConversationByQuery: utils.getSys_agentConversationByQuery,
  getSys_agentConversationByMQuery: utils.getSys_agentConversationByMQuery,
  updateSys_agentConversationById: utils.updateSys_agentConversationById,
  updateSys_agentConversationByIdList:
    utils.updateSys_agentConversationByIdList,
  updateSys_agentConversationByQuery: utils.updateSys_agentConversationByQuery,
  updateSys_agentConversationByMQuery:
    utils.updateSys_agentConversationByMQuery,
  deleteSys_agentConversationById: utils.deleteSys_agentConversationById,
  deleteSys_agentConversationByQuery: utils.deleteSys_agentConversationByQuery,
  deleteSys_agentConversationByMQuery:
    utils.deleteSys_agentConversationByMQuery,
  dbScriptListAgentchats: dbApiScripts.dbScriptListAgentchats,
  dbScriptGetAgentchatmessages: dbApiScripts.dbScriptGetAgentchatmessages,
  dbScript_fetchListsys_agentconversation:
    dbApiScripts.dbScript_fetchListsys_agentconversation,
};
