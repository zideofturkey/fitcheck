const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createDishLine: utils.createDishLine,
  createBulkDishLine: utils.createBulkDishLine,
  getIdListOfDishLineByField: utils.getIdListOfDishLineByField,
  getDishLineById: utils.getDishLineById,
  getDishLineAggById: utils.getDishLineAggById,
  getDishLineListByQuery: utils.getDishLineListByQuery,
  getDishLineListByMQuery: utils.getDishLineListByMQuery,
  getDishLineStatsByQuery: utils.getDishLineStatsByQuery,
  getDishLineStatsByMQuery: utils.getDishLineStatsByMQuery,
  getDishLineByQuery: utils.getDishLineByQuery,
  getDishLineByMQuery: utils.getDishLineByMQuery,
  updateDishLineById: utils.updateDishLineById,
  updateDishLineByIdList: utils.updateDishLineByIdList,
  updateDishLineByQuery: utils.updateDishLineByQuery,
  updateDishLineByMQuery: utils.updateDishLineByMQuery,
  deleteDishLineById: utils.deleteDishLineById,
  deleteDishLineByQuery: utils.deleteDishLineByQuery,
  deleteDishLineByMQuery: utils.deleteDishLineByMQuery,
  dbScriptAddDishline: dbApiScripts.dbScriptAddDishline,
  dbScriptListDishlines: dbApiScripts.dbScriptListDishlines,
  dbScriptDeleteDishline: dbApiScripts.dbScriptDeleteDishline,
  dbScript_fetchListdishline: dbApiScripts.dbScript_fetchListdishline,
};
