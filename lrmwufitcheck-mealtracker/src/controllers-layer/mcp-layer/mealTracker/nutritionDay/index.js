module.exports = (headers) => {
  // NutritionDay Db Object Rest Api Router
  const nutritionDayMcpRouter = [];

  // getDailyProgress controller
  nutritionDayMcpRouter.push(require("./get-dailyprogress-api")(headers));
  // getNutritionDay controller
  nutritionDayMcpRouter.push(require("./get-nutritionday-api")(headers));
  // listNutritionDays controller
  nutritionDayMcpRouter.push(require("./list-nutritiondays-api")(headers));
  // getWeeklyAnalytics controller
  nutritionDayMcpRouter.push(require("./get-weeklyanalytics-api")(headers));
  // getMonthlyAnalytics controller
  nutritionDayMcpRouter.push(require("./get-monthlyanalytics-api")(headers));
  // _fetchListNutritionDay controller
  nutritionDayMcpRouter.push(require("./_fetch-listnutritionday-api")(headers));

  return nutritionDayMcpRouter;
};
