module.exports = {
  NutritionLibraryServiceManager: require("./service-manager/NutritionLibraryServiceManager"),
  // nutritionlibrary Database Crud Object Routes Manager Layer Classes
  // MacroTarget Db Object
  SetMacroTargetManager: require("./nutritionlibrary/macroTarget/set-macrotarget-api"),
  GetMyMacroTargetManager: require("./nutritionlibrary/macroTarget/get-mymacrotarget-api"),
  GetMyMacroTargetForLoggingManager: require("./nutritionlibrary/macroTarget/get-mymacrotargetforlogging-api"),
  _fetchListMacroTargetManager: require("./nutritionlibrary/macroTarget/_fetch-listmacrotarget-api"),
  // FoodItem Db Object
  CreateFoodItemManager: require("./nutritionlibrary/foodItem/create-fooditem-api"),
  GetFoodItemManager: require("./nutritionlibrary/foodItem/get-fooditem-api"),
  ListFoodItemsManager: require("./nutritionlibrary/foodItem/list-fooditems-api"),
  UpdateFoodItemManager: require("./nutritionlibrary/foodItem/update-fooditem-api"),
  DeleteFoodItemManager: require("./nutritionlibrary/foodItem/delete-fooditem-api"),
  GetFoodItemForLoggingManager: require("./nutritionlibrary/foodItem/get-fooditemforlogging-api"),
  _fetchListFoodItemManager: require("./nutritionlibrary/foodItem/_fetch-listfooditem-api"),
  // PresetMeal Db Object
  CreatePresetMealManager: require("./nutritionlibrary/presetMeal/create-presetmeal-api"),
  GetPresetMealManager: require("./nutritionlibrary/presetMeal/get-presetmeal-api"),
  ListPresetMealsManager: require("./nutritionlibrary/presetMeal/list-presetmeals-api"),
  UpdatePresetMealManager: require("./nutritionlibrary/presetMeal/update-presetmeal-api"),
  DeletePresetMealManager: require("./nutritionlibrary/presetMeal/delete-presetmeal-api"),
  GetPresetMealForLoggingManager: require("./nutritionlibrary/presetMeal/get-presetmealforlogging-api"),
  _fetchListPresetMealManager: require("./nutritionlibrary/presetMeal/_fetch-listpresetmeal-api"),
  // PresetLine Db Object
  AddPresetLineManager: require("./nutritionlibrary/presetLine/add-presetline-api"),
  ListPresetLinesManager: require("./nutritionlibrary/presetLine/list-presetlines-api"),
  DeletePresetLineManager: require("./nutritionlibrary/presetLine/delete-presetline-api"),
  _fetchListPresetLineManager: require("./nutritionlibrary/presetLine/_fetch-listpresetline-api"),
  // Dish Db Object
  CreateDishManager: require("./nutritionlibrary/dish/create-dish-api"),
  GetDishManager: require("./nutritionlibrary/dish/get-dish-api"),
  ListDishesManager: require("./nutritionlibrary/dish/list-dishes-api"),
  UpdateDishManager: require("./nutritionlibrary/dish/update-dish-api"),
  DeleteDishManager: require("./nutritionlibrary/dish/delete-dish-api"),
  _fetchListDishManager: require("./nutritionlibrary/dish/_fetch-listdish-api"),
  // DishLine Db Object
  AddDishLineManager: require("./nutritionlibrary/dishLine/add-dishline-api"),
  ListDishLinesManager: require("./nutritionlibrary/dishLine/list-dishlines-api"),
  DeleteDishLineManager: require("./nutritionlibrary/dishLine/delete-dishline-api"),
  _fetchListDishLineManager: require("./nutritionlibrary/dishLine/_fetch-listdishline-api"),
  integrationRouter: require("./integrations/testRouter"),
};
