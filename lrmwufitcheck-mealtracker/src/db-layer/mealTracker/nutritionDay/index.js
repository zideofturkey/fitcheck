const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createNutritionDay: utils.createNutritionDay,
  createBulkNutritionDay: utils.createBulkNutritionDay,
  getIdListOfNutritionDayByField: utils.getIdListOfNutritionDayByField,
  getNutritionDayById: utils.getNutritionDayById,
  getNutritionDayAggById: utils.getNutritionDayAggById,
  getNutritionDayListByQuery: utils.getNutritionDayListByQuery,
  getNutritionDayListByMQuery: utils.getNutritionDayListByMQuery,
  getNutritionDayStatsByQuery: utils.getNutritionDayStatsByQuery,
  getNutritionDayStatsByMQuery: utils.getNutritionDayStatsByMQuery,
  getNutritionDayByQuery: utils.getNutritionDayByQuery,
  getNutritionDayByMQuery: utils.getNutritionDayByMQuery,
  updateNutritionDayById: utils.updateNutritionDayById,
  updateNutritionDayByIdList: utils.updateNutritionDayByIdList,
  updateNutritionDayByQuery: utils.updateNutritionDayByQuery,
  updateNutritionDayByMQuery: utils.updateNutritionDayByMQuery,
  deleteNutritionDayById: utils.deleteNutritionDayById,
  deleteNutritionDayByQuery: utils.deleteNutritionDayByQuery,
  deleteNutritionDayByMQuery: utils.deleteNutritionDayByMQuery,
  dbScriptGetDailyprogress: dbApiScripts.dbScriptGetDailyprogress,
  dbScriptGetNutritionday: dbApiScripts.dbScriptGetNutritionday,
  dbScriptListNutritiondays: dbApiScripts.dbScriptListNutritiondays,
  dbScriptGetWeeklyanalytics: dbApiScripts.dbScriptGetWeeklyanalytics,
  dbScriptGetMonthlyanalytics: dbApiScripts.dbScriptGetMonthlyanalytics,
  dbScriptTriggerDailyremindercheck:
    dbApiScripts.dbScriptTriggerDailyremindercheck,
  dbScriptTriggerDailysummary: dbApiScripts.dbScriptTriggerDailysummary,
  dbScript_fetchListnutritionday: dbApiScripts.dbScript_fetchListnutritionday,
};
