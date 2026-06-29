module.exports = {
  MealTrackerServiceManager: require("./service-manager/MealTrackerServiceManager"),
  // mealTracker Database Crud Object Routes Manager Layer Classes
  // MealLog Db Object
  CreateMealLogManager: require("./mealTracker/mealLog/create-meallog-api"),
  GetMealLogManager: require("./mealTracker/mealLog/get-meallog-api"),
  ListMealLogsManager: require("./mealTracker/mealLog/list-meallogs-api"),
  UpdateMealLogManager: require("./mealTracker/mealLog/update-meallog-api"),
  DeleteMealLogManager: require("./mealTracker/mealLog/delete-meallog-api"),
  _fetchListMealLogManager: require("./mealTracker/mealLog/_fetch-listmeallog-api"),
  // MealLine Db Object
  CreateMealLineManager: require("./mealTracker/mealLine/create-mealline-api"),
  UpdateMealLineManager: require("./mealTracker/mealLine/update-mealline-api"),
  DeleteMealLineManager: require("./mealTracker/mealLine/delete-mealline-api"),
  ListMealLinesManager: require("./mealTracker/mealLine/list-meallines-api"),
  _fetchListMealLineManager: require("./mealTracker/mealLine/_fetch-listmealline-api"),
  // NutritionDay Db Object
  GetDailyProgressManager: require("./mealTracker/nutritionDay/get-dailyprogress-api"),
  GetNutritionDayManager: require("./mealTracker/nutritionDay/get-nutritionday-api"),
  ListNutritionDaysManager: require("./mealTracker/nutritionDay/list-nutritiondays-api"),
  GetWeeklyAnalyticsManager: require("./mealTracker/nutritionDay/get-weeklyanalytics-api"),
  GetMonthlyAnalyticsManager: require("./mealTracker/nutritionDay/get-monthlyanalytics-api"),
  TriggerDailyReminderCheckManager: require("./mealTracker/nutritionDay/trigger-dailyremindercheck-api"),
  TriggerDailySummaryManager: require("./mealTracker/nutritionDay/trigger-dailysummary-api"),
  _fetchListNutritionDayManager: require("./mealTracker/nutritionDay/_fetch-listnutritionday-api"),
  integrationRouter: require("./integrations/testRouter"),
};
