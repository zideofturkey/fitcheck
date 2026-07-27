const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  createDish: utils.createDish,
  createBulkDish: utils.createBulkDish,
  getIdListOfDishByField: utils.getIdListOfDishByField,
  getDishById: utils.getDishById,
  getDishAggById: utils.getDishAggById,
  getDishListByQuery: utils.getDishListByQuery,
  getDishListByMQuery: utils.getDishListByMQuery,
  getDishStatsByQuery: utils.getDishStatsByQuery,
  getDishStatsByMQuery: utils.getDishStatsByMQuery,
  getDishByQuery: utils.getDishByQuery,
  getDishByMQuery: utils.getDishByMQuery,
  updateDishById: utils.updateDishById,
  updateDishByIdList: utils.updateDishByIdList,
  updateDishByQuery: utils.updateDishByQuery,
  updateDishByMQuery: utils.updateDishByMQuery,
  deleteDishById: utils.deleteDishById,
  deleteDishByQuery: utils.deleteDishByQuery,
  deleteDishByMQuery: utils.deleteDishByMQuery,
  dbScriptCreateDish: dbApiScripts.dbScriptCreateDish,
  dbScriptGetDish: dbApiScripts.dbScriptGetDish,
  dbScriptListDishes: dbApiScripts.dbScriptListDishes,
  dbScriptUpdateDish: dbApiScripts.dbScriptUpdateDish,
  dbScriptDeleteDish: dbApiScripts.dbScriptDeleteDish,
  dbScript_fetchListdish: dbApiScripts.dbScript_fetchListdish,
};
