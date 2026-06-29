const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createAiCandidateLine: utils.createAiCandidateLine,
  createBulkAiCandidateLine: utils.createBulkAiCandidateLine,
  getIdListOfAiCandidateLineByField: utils.getIdListOfAiCandidateLineByField,
  getAiCandidateLineById: utils.getAiCandidateLineById,
  getAiCandidateLineAggById: utils.getAiCandidateLineAggById,
  getAiCandidateLineListByQuery: utils.getAiCandidateLineListByQuery,
  getAiCandidateLineListByMQuery: utils.getAiCandidateLineListByMQuery,
  getAiCandidateLineStatsByQuery: utils.getAiCandidateLineStatsByQuery,
  getAiCandidateLineStatsByMQuery: utils.getAiCandidateLineStatsByMQuery,
  getAiCandidateLineByQuery: utils.getAiCandidateLineByQuery,
  getAiCandidateLineByMQuery: utils.getAiCandidateLineByMQuery,
  updateAiCandidateLineById: utils.updateAiCandidateLineById,
  updateAiCandidateLineByIdList: utils.updateAiCandidateLineByIdList,
  updateAiCandidateLineByQuery: utils.updateAiCandidateLineByQuery,
  updateAiCandidateLineByMQuery: utils.updateAiCandidateLineByMQuery,
  deleteAiCandidateLineById: utils.deleteAiCandidateLineById,
  deleteAiCandidateLineByQuery: utils.deleteAiCandidateLineByQuery,
  deleteAiCandidateLineByMQuery: utils.deleteAiCandidateLineByMQuery,
  dbScriptUpdateAicandidateline: dbApiScripts.dbScriptUpdateAicandidateline,
  dbScript_fetchListaicandidateline:
    dbApiScripts.dbScript_fetchListaicandidateline,
};
