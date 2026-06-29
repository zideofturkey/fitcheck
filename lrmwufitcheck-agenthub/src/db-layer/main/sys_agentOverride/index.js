const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createSys_agentOverride: utils.createSys_agentOverride,
  createBulkSys_agentOverride: utils.createBulkSys_agentOverride,
  getIdListOfSys_agentOverrideByField:
    utils.getIdListOfSys_agentOverrideByField,
  getSys_agentOverrideById: utils.getSys_agentOverrideById,
  getSys_agentOverrideAggById: utils.getSys_agentOverrideAggById,
  getSys_agentOverrideListByQuery: utils.getSys_agentOverrideListByQuery,
  getSys_agentOverrideListByMQuery: utils.getSys_agentOverrideListByMQuery,
  getSys_agentOverrideStatsByQuery: utils.getSys_agentOverrideStatsByQuery,
  getSys_agentOverrideStatsByMQuery: utils.getSys_agentOverrideStatsByMQuery,
  getSys_agentOverrideByQuery: utils.getSys_agentOverrideByQuery,
  getSys_agentOverrideByMQuery: utils.getSys_agentOverrideByMQuery,
  updateSys_agentOverrideById: utils.updateSys_agentOverrideById,
  updateSys_agentOverrideByIdList: utils.updateSys_agentOverrideByIdList,
  updateSys_agentOverrideByQuery: utils.updateSys_agentOverrideByQuery,
  updateSys_agentOverrideByMQuery: utils.updateSys_agentOverrideByMQuery,
  deleteSys_agentOverrideById: utils.deleteSys_agentOverrideById,
  deleteSys_agentOverrideByQuery: utils.deleteSys_agentOverrideByQuery,
  deleteSys_agentOverrideByMQuery: utils.deleteSys_agentOverrideByMQuery,
  dbScriptGetAgentoverride: dbApiScripts.dbScriptGetAgentoverride,
  dbScriptListAgentoverrides: dbApiScripts.dbScriptListAgentoverrides,
  dbScriptCreateAgentoverride: dbApiScripts.dbScriptCreateAgentoverride,
  dbScriptUpdateAgentoverride: dbApiScripts.dbScriptUpdateAgentoverride,
  dbScriptDeleteAgentoverride: dbApiScripts.dbScriptDeleteAgentoverride,
  dbScript_fetchListsys_agentoverride:
    dbApiScripts.dbScript_fetchListsys_agentoverride,
};
