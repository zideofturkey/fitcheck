const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createMealLog: utils.createMealLog,
  createBulkMealLog: utils.createBulkMealLog,
  getIdListOfMealLogByField: utils.getIdListOfMealLogByField,
  getMealLogById: utils.getMealLogById,
  getMealLogAggById: utils.getMealLogAggById,
  getMealLogListByQuery: utils.getMealLogListByQuery,
  getMealLogListByMQuery: utils.getMealLogListByMQuery,
  getMealLogStatsByQuery: utils.getMealLogStatsByQuery,
  getMealLogStatsByMQuery: utils.getMealLogStatsByMQuery,
  getMealLogByQuery: utils.getMealLogByQuery,
  getMealLogByMQuery: utils.getMealLogByMQuery,
  updateMealLogById: utils.updateMealLogById,
  updateMealLogByIdList: utils.updateMealLogByIdList,
  updateMealLogByQuery: utils.updateMealLogByQuery,
  updateMealLogByMQuery: utils.updateMealLogByMQuery,
  deleteMealLogById: utils.deleteMealLogById,
  deleteMealLogByQuery: utils.deleteMealLogByQuery,
  deleteMealLogByMQuery: utils.deleteMealLogByMQuery,
  dbScriptCreateMeallog: dbApiScripts.dbScriptCreateMeallog,
  dbScriptGetMeallog: dbApiScripts.dbScriptGetMeallog,
  dbScriptListMeallogs: dbApiScripts.dbScriptListMeallogs,
  dbScriptUpdateMeallog: dbApiScripts.dbScriptUpdateMeallog,
  dbScriptDeleteMeallog: dbApiScripts.dbScriptDeleteMeallog,
  dbScript_fetchListmeallog: dbApiScripts.dbScript_fetchListmeallog,
};
