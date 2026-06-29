module.exports = {
  // nutritionlibrary Database Crud Object Routes Manager Layer Classes
  // MacroTarget Db Object
  SetMacroTargetManager: require("./macroTarget/set-macrotarget-api"),
  GetMyMacroTargetManager: require("./macroTarget/get-mymacrotarget-api"),
  GetMyMacroTargetForLoggingManager: require("./macroTarget/get-mymacrotargetforlogging-api"),
  _fetchListMacroTargetManager: require("./macroTarget/_fetch-listmacrotarget-api"),
  // FoodItem Db Object
  CreateFoodItemManager: require("./foodItem/create-fooditem-api"),
  GetFoodItemManager: require("./foodItem/get-fooditem-api"),
  ListFoodItemsManager: require("./foodItem/list-fooditems-api"),
  UpdateFoodItemManager: require("./foodItem/update-fooditem-api"),
  DeleteFoodItemManager: require("./foodItem/delete-fooditem-api"),
  GetFoodItemForLoggingManager: require("./foodItem/get-fooditemforlogging-api"),
  _fetchListFoodItemManager: require("./foodItem/_fetch-listfooditem-api"),
  // PresetMeal Db Object
  CreatePresetMealManager: require("./presetMeal/create-presetmeal-api"),
  GetPresetMealManager: require("./presetMeal/get-presetmeal-api"),
  ListPresetMealsManager: require("./presetMeal/list-presetmeals-api"),
  UpdatePresetMealManager: require("./presetMeal/update-presetmeal-api"),
  DeletePresetMealManager: require("./presetMeal/delete-presetmeal-api"),
  GetPresetMealForLoggingManager: require("./presetMeal/get-presetmealforlogging-api"),
  _fetchListPresetMealManager: require("./presetMeal/_fetch-listpresetmeal-api"),
  // PresetLine Db Object
  AddPresetLineManager: require("./presetLine/add-presetline-api"),
  ListPresetLinesManager: require("./presetLine/list-presetlines-api"),
  DeletePresetLineManager: require("./presetLine/delete-presetline-api"),
  _fetchListPresetLineManager: require("./presetLine/_fetch-listpresetline-api"),
};
