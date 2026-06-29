const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createSys_agentExecution: utils.createSys_agentExecution,
  createBulkSys_agentExecution: utils.createBulkSys_agentExecution,
  getIdListOfSys_agentExecutionByField:
    utils.getIdListOfSys_agentExecutionByField,
  getSys_agentExecutionById: utils.getSys_agentExecutionById,
  getSys_agentExecutionAggById: utils.getSys_agentExecutionAggById,
  getSys_agentExecutionListByQuery: utils.getSys_agentExecutionListByQuery,
  getSys_agentExecutionListByMQuery: utils.getSys_agentExecutionListByMQuery,
  getSys_agentExecutionStatsByQuery: utils.getSys_agentExecutionStatsByQuery,
  getSys_agentExecutionStatsByMQuery: utils.getSys_agentExecutionStatsByMQuery,
  getSys_agentExecutionByQuery: utils.getSys_agentExecutionByQuery,
  getSys_agentExecutionByMQuery: utils.getSys_agentExecutionByMQuery,
  updateSys_agentExecutionById: utils.updateSys_agentExecutionById,
  updateSys_agentExecutionByIdList: utils.updateSys_agentExecutionByIdList,
  updateSys_agentExecutionByQuery: utils.updateSys_agentExecutionByQuery,
  updateSys_agentExecutionByMQuery: utils.updateSys_agentExecutionByMQuery,
  deleteSys_agentExecutionById: utils.deleteSys_agentExecutionById,
  deleteSys_agentExecutionByQuery: utils.deleteSys_agentExecutionByQuery,
  deleteSys_agentExecutionByMQuery: utils.deleteSys_agentExecutionByMQuery,
  dbScriptListAgentexecutions: dbApiScripts.dbScriptListAgentexecutions,
  dbScriptGetAgentexecution: dbApiScripts.dbScriptGetAgentexecution,
  dbScript_fetchListsys_agentexecution:
    dbApiScripts.dbScript_fetchListsys_agentexecution,
};
