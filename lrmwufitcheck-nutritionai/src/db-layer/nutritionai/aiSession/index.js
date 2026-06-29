const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createAiSession: utils.createAiSession,
  createBulkAiSession: utils.createBulkAiSession,
  getIdListOfAiSessionByField: utils.getIdListOfAiSessionByField,
  getAiSessionById: utils.getAiSessionById,
  getAiSessionAggById: utils.getAiSessionAggById,
  getAiSessionListByQuery: utils.getAiSessionListByQuery,
  getAiSessionListByMQuery: utils.getAiSessionListByMQuery,
  getAiSessionStatsByQuery: utils.getAiSessionStatsByQuery,
  getAiSessionStatsByMQuery: utils.getAiSessionStatsByMQuery,
  getAiSessionByQuery: utils.getAiSessionByQuery,
  getAiSessionByMQuery: utils.getAiSessionByMQuery,
  updateAiSessionById: utils.updateAiSessionById,
  updateAiSessionByIdList: utils.updateAiSessionByIdList,
  updateAiSessionByQuery: utils.updateAiSessionByQuery,
  updateAiSessionByMQuery: utils.updateAiSessionByMQuery,
  deleteAiSessionById: utils.deleteAiSessionById,
  deleteAiSessionByQuery: utils.deleteAiSessionByQuery,
  deleteAiSessionByMQuery: utils.deleteAiSessionByMQuery,
  dbScriptParseMeal: dbApiScripts.dbScriptParseMeal,
  dbScriptAskNutritionquestion: dbApiScripts.dbScriptAskNutritionquestion,
  dbScriptGetAisession: dbApiScripts.dbScriptGetAisession,
  dbScriptListAisessions: dbApiScripts.dbScriptListAisessions,
  dbScript_fetchListaisession: dbApiScripts.dbScript_fetchListaisession,
};
