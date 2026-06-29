const nutritionlibraryFunctions = require("./nutritionlibrary");

module.exports = {
  // nutritionlibrary Database
  createMacroTarget: nutritionlibraryFunctions.createMacroTarget,
  createBulkMacroTarget: nutritionlibraryFunctions.createBulkMacroTarget,
  getIdListOfMacroTargetByField:
    nutritionlibraryFunctions.getIdListOfMacroTargetByField,
  getMacroTargetById: nutritionlibraryFunctions.getMacroTargetById,
  getMacroTargetAggById: nutritionlibraryFunctions.getMacroTargetAggById,
  getMacroTargetListByQuery:
    nutritionlibraryFunctions.getMacroTargetListByQuery,
  getMacroTargetListByMQuery:
    nutritionlibraryFunctions.getMacroTargetListByMQuery,
  getMacroTargetStatsByQuery:
    nutritionlibraryFunctions.getMacroTargetStatsByQuery,
  getMacroTargetStatsByMQuery:
    nutritionlibraryFunctions.getMacroTargetStatsByMQuery,
  getMacroTargetByQuery: nutritionlibraryFunctions.getMacroTargetByQuery,
  getMacroTargetByMQuery: nutritionlibraryFunctions.getMacroTargetByMQuery,
  updateMacroTargetById: nutritionlibraryFunctions.updateMacroTargetById,
  updateMacroTargetByIdList:
    nutritionlibraryFunctions.updateMacroTargetByIdList,
  updateMacroTargetByQuery: nutritionlibraryFunctions.updateMacroTargetByQuery,
  updateMacroTargetByMQuery:
    nutritionlibraryFunctions.updateMacroTargetByMQuery,
  deleteMacroTargetById: nutritionlibraryFunctions.deleteMacroTargetById,
  deleteMacroTargetByQuery: nutritionlibraryFunctions.deleteMacroTargetByQuery,
  deleteMacroTargetByMQuery:
    nutritionlibraryFunctions.deleteMacroTargetByMQuery,
  dbScriptSetMacrotarget: nutritionlibraryFunctions.dbScriptSetMacrotarget,
  dbScriptGetMymacrotarget: nutritionlibraryFunctions.dbScriptGetMymacrotarget,
  dbScriptGetMymacrotargetforlogging:
    nutritionlibraryFunctions.dbScriptGetMymacrotargetforlogging,
  dbScript_fetchListmacrotarget:
    nutritionlibraryFunctions.dbScript_fetchListmacrotarget,
  createFoodItem: nutritionlibraryFunctions.createFoodItem,
  createBulkFoodItem: nutritionlibraryFunctions.createBulkFoodItem,
  getIdListOfFoodItemByField:
    nutritionlibraryFunctions.getIdListOfFoodItemByField,
  getFoodItemById: nutritionlibraryFunctions.getFoodItemById,
  getFoodItemAggById: nutritionlibraryFunctions.getFoodItemAggById,
  getFoodItemListByQuery: nutritionlibraryFunctions.getFoodItemListByQuery,
  getFoodItemListByMQuery: nutritionlibraryFunctions.getFoodItemListByMQuery,
  getFoodItemStatsByQuery: nutritionlibraryFunctions.getFoodItemStatsByQuery,
  getFoodItemStatsByMQuery: nutritionlibraryFunctions.getFoodItemStatsByMQuery,
  getFoodItemByQuery: nutritionlibraryFunctions.getFoodItemByQuery,
  getFoodItemByMQuery: nutritionlibraryFunctions.getFoodItemByMQuery,
  updateFoodItemById: nutritionlibraryFunctions.updateFoodItemById,
  updateFoodItemByIdList: nutritionlibraryFunctions.updateFoodItemByIdList,
  updateFoodItemByQuery: nutritionlibraryFunctions.updateFoodItemByQuery,
  updateFoodItemByMQuery: nutritionlibraryFunctions.updateFoodItemByMQuery,
  deleteFoodItemById: nutritionlibraryFunctions.deleteFoodItemById,
  deleteFoodItemByQuery: nutritionlibraryFunctions.deleteFoodItemByQuery,
  deleteFoodItemByMQuery: nutritionlibraryFunctions.deleteFoodItemByMQuery,
  dbScriptCreateFooditem: nutritionlibraryFunctions.dbScriptCreateFooditem,
  dbScriptGetFooditem: nutritionlibraryFunctions.dbScriptGetFooditem,
  dbScriptListFooditems: nutritionlibraryFunctions.dbScriptListFooditems,
  dbScriptUpdateFooditem: nutritionlibraryFunctions.dbScriptUpdateFooditem,
  dbScriptDeleteFooditem: nutritionlibraryFunctions.dbScriptDeleteFooditem,
  dbScriptGetFooditemforlogging:
    nutritionlibraryFunctions.dbScriptGetFooditemforlogging,
  dbScript_fetchListfooditem:
    nutritionlibraryFunctions.dbScript_fetchListfooditem,
  createPresetMeal: nutritionlibraryFunctions.createPresetMeal,
  createBulkPresetMeal: nutritionlibraryFunctions.createBulkPresetMeal,
  getIdListOfPresetMealByField:
    nutritionlibraryFunctions.getIdListOfPresetMealByField,
  getPresetMealById: nutritionlibraryFunctions.getPresetMealById,
  getPresetMealAggById: nutritionlibraryFunctions.getPresetMealAggById,
  getPresetMealListByQuery: nutritionlibraryFunctions.getPresetMealListByQuery,
  getPresetMealListByMQuery:
    nutritionlibraryFunctions.getPresetMealListByMQuery,
  getPresetMealStatsByQuery:
    nutritionlibraryFunctions.getPresetMealStatsByQuery,
  getPresetMealStatsByMQuery:
    nutritionlibraryFunctions.getPresetMealStatsByMQuery,
  getPresetMealByQuery: nutritionlibraryFunctions.getPresetMealByQuery,
  getPresetMealByMQuery: nutritionlibraryFunctions.getPresetMealByMQuery,
  updatePresetMealById: nutritionlibraryFunctions.updatePresetMealById,
  updatePresetMealByIdList: nutritionlibraryFunctions.updatePresetMealByIdList,
  updatePresetMealByQuery: nutritionlibraryFunctions.updatePresetMealByQuery,
  updatePresetMealByMQuery: nutritionlibraryFunctions.updatePresetMealByMQuery,
  deletePresetMealById: nutritionlibraryFunctions.deletePresetMealById,
  deletePresetMealByQuery: nutritionlibraryFunctions.deletePresetMealByQuery,
  deletePresetMealByMQuery: nutritionlibraryFunctions.deletePresetMealByMQuery,
  dbScriptCreatePresetmeal: nutritionlibraryFunctions.dbScriptCreatePresetmeal,
  dbScriptGetPresetmeal: nutritionlibraryFunctions.dbScriptGetPresetmeal,
  dbScriptListPresetmeals: nutritionlibraryFunctions.dbScriptListPresetmeals,
  dbScriptUpdatePresetmeal: nutritionlibraryFunctions.dbScriptUpdatePresetmeal,
  dbScriptDeletePresetmeal: nutritionlibraryFunctions.dbScriptDeletePresetmeal,
  dbScriptGetPresetmealforlogging:
    nutritionlibraryFunctions.dbScriptGetPresetmealforlogging,
  dbScript_fetchListpresetmeal:
    nutritionlibraryFunctions.dbScript_fetchListpresetmeal,
  createPresetLine: nutritionlibraryFunctions.createPresetLine,
  createBulkPresetLine: nutritionlibraryFunctions.createBulkPresetLine,
  getIdListOfPresetLineByField:
    nutritionlibraryFunctions.getIdListOfPresetLineByField,
  getPresetLineById: nutritionlibraryFunctions.getPresetLineById,
  getPresetLineAggById: nutritionlibraryFunctions.getPresetLineAggById,
  getPresetLineListByQuery: nutritionlibraryFunctions.getPresetLineListByQuery,
  getPresetLineListByMQuery:
    nutritionlibraryFunctions.getPresetLineListByMQuery,
  getPresetLineStatsByQuery:
    nutritionlibraryFunctions.getPresetLineStatsByQuery,
  getPresetLineStatsByMQuery:
    nutritionlibraryFunctions.getPresetLineStatsByMQuery,
  getPresetLineByQuery: nutritionlibraryFunctions.getPresetLineByQuery,
  getPresetLineByMQuery: nutritionlibraryFunctions.getPresetLineByMQuery,
  updatePresetLineById: nutritionlibraryFunctions.updatePresetLineById,
  updatePresetLineByIdList: nutritionlibraryFunctions.updatePresetLineByIdList,
  updatePresetLineByQuery: nutritionlibraryFunctions.updatePresetLineByQuery,
  updatePresetLineByMQuery: nutritionlibraryFunctions.updatePresetLineByMQuery,
  deletePresetLineById: nutritionlibraryFunctions.deletePresetLineById,
  deletePresetLineByQuery: nutritionlibraryFunctions.deletePresetLineByQuery,
  deletePresetLineByMQuery: nutritionlibraryFunctions.deletePresetLineByMQuery,
  dbScriptAddPresetline: nutritionlibraryFunctions.dbScriptAddPresetline,
  dbScriptListPresetlines: nutritionlibraryFunctions.dbScriptListPresetlines,
  dbScriptDeletePresetline: nutritionlibraryFunctions.dbScriptDeletePresetline,
  dbScript_fetchListpresetline:
    nutritionlibraryFunctions.dbScript_fetchListpresetline,
};
