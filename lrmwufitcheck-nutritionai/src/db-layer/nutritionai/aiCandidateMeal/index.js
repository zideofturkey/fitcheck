const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createAiCandidateMeal: utils.createAiCandidateMeal,
  createBulkAiCandidateMeal: utils.createBulkAiCandidateMeal,
  getIdListOfAiCandidateMealByField: utils.getIdListOfAiCandidateMealByField,
  getAiCandidateMealById: utils.getAiCandidateMealById,
  getAiCandidateMealAggById: utils.getAiCandidateMealAggById,
  getAiCandidateMealListByQuery: utils.getAiCandidateMealListByQuery,
  getAiCandidateMealListByMQuery: utils.getAiCandidateMealListByMQuery,
  getAiCandidateMealStatsByQuery: utils.getAiCandidateMealStatsByQuery,
  getAiCandidateMealStatsByMQuery: utils.getAiCandidateMealStatsByMQuery,
  getAiCandidateMealByQuery: utils.getAiCandidateMealByQuery,
  getAiCandidateMealByMQuery: utils.getAiCandidateMealByMQuery,
  updateAiCandidateMealById: utils.updateAiCandidateMealById,
  updateAiCandidateMealByIdList: utils.updateAiCandidateMealByIdList,
  updateAiCandidateMealByQuery: utils.updateAiCandidateMealByQuery,
  updateAiCandidateMealByMQuery: utils.updateAiCandidateMealByMQuery,
  deleteAiCandidateMealById: utils.deleteAiCandidateMealById,
  deleteAiCandidateMealByQuery: utils.deleteAiCandidateMealByQuery,
  deleteAiCandidateMealByMQuery: utils.deleteAiCandidateMealByMQuery,
  dbScriptConfirmCandidatemeal: dbApiScripts.dbScriptConfirmCandidatemeal,
  dbScriptGetAicandidatemeal: dbApiScripts.dbScriptGetAicandidatemeal,
  dbScriptListAicandidatemeals: dbApiScripts.dbScriptListAicandidatemeals,
  dbScriptRejectCandidatemeal: dbApiScripts.dbScriptRejectCandidatemeal,
  dbScript_fetchListaicandidatemeal:
    dbApiScripts.dbScript_fetchListaicandidatemeal,
};
