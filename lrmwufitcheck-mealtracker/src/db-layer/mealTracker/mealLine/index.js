const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createMealLine: utils.createMealLine,
  createBulkMealLine: utils.createBulkMealLine,
  getIdListOfMealLineByField: utils.getIdListOfMealLineByField,
  getMealLineById: utils.getMealLineById,
  getMealLineAggById: utils.getMealLineAggById,
  getMealLineListByQuery: utils.getMealLineListByQuery,
  getMealLineListByMQuery: utils.getMealLineListByMQuery,
  getMealLineStatsByQuery: utils.getMealLineStatsByQuery,
  getMealLineStatsByMQuery: utils.getMealLineStatsByMQuery,
  getMealLineByQuery: utils.getMealLineByQuery,
  getMealLineByMQuery: utils.getMealLineByMQuery,
  updateMealLineById: utils.updateMealLineById,
  updateMealLineByIdList: utils.updateMealLineByIdList,
  updateMealLineByQuery: utils.updateMealLineByQuery,
  updateMealLineByMQuery: utils.updateMealLineByMQuery,
  deleteMealLineById: utils.deleteMealLineById,
  deleteMealLineByQuery: utils.deleteMealLineByQuery,
  deleteMealLineByMQuery: utils.deleteMealLineByMQuery,
  dbScriptCreateMealline: dbApiScripts.dbScriptCreateMealline,
  dbScriptUpdateMealline: dbApiScripts.dbScriptUpdateMealline,
  dbScriptDeleteMealline: dbApiScripts.dbScriptDeleteMealline,
  dbScriptListMeallines: dbApiScripts.dbScriptListMeallines,
  dbScript_fetchListmealline: dbApiScripts.dbScript_fetchListmealline,
};
