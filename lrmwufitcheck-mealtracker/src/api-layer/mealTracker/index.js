module.exports = {
  // mealTracker Database Crud Object Routes Manager Layer Classes
  // MealLog Db Object
  CreateMealLogManager: require("./mealLog/create-meallog-api"),
  GetMealLogManager: require("./mealLog/get-meallog-api"),
  ListMealLogsManager: require("./mealLog/list-meallogs-api"),
  UpdateMealLogManager: require("./mealLog/update-meallog-api"),
  DeleteMealLogManager: require("./mealLog/delete-meallog-api"),
  _fetchListMealLogManager: require("./mealLog/_fetch-listmeallog-api"),
  // MealLine Db Object
  CreateMealLineManager: require("./mealLine/create-mealline-api"),
  UpdateMealLineManager: require("./mealLine/update-mealline-api"),
  DeleteMealLineManager: require("./mealLine/delete-mealline-api"),
  ListMealLinesManager: require("./mealLine/list-meallines-api"),
  _fetchListMealLineManager: require("./mealLine/_fetch-listmealline-api"),
  // NutritionDay Db Object
  GetDailyProgressManager: require("./nutritionDay/get-dailyprogress-api"),
  GetNutritionDayManager: require("./nutritionDay/get-nutritionday-api"),
  ListNutritionDaysManager: require("./nutritionDay/list-nutritiondays-api"),
  GetWeeklyAnalyticsManager: require("./nutritionDay/get-weeklyanalytics-api"),
  GetMonthlyAnalyticsManager: require("./nutritionDay/get-monthlyanalytics-api"),
  TriggerDailyReminderCheckManager: require("./nutritionDay/trigger-dailyremindercheck-api"),
  TriggerDailySummaryManager: require("./nutritionDay/trigger-dailysummary-api"),
  _fetchListNutritionDayManager: require("./nutritionDay/_fetch-listnutritionday-api"),
};
