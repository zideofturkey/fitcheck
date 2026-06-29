const express = require("express");

// NutritionDay Db Object Rest Api Router
const nutritionDayRouter = express.Router();

// add NutritionDay controllers

// getDailyProgress controller
nutritionDayRouter.get(
  "/v1/nutrition-days/daily-progress",
  require("./get-dailyprogress-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
nutritionDayRouter.get(
  "/nutrition-days/daily-progress",
  require("./get-dailyprogress-api"),
);
// getNutritionDay controller
nutritionDayRouter.get(
  "/v1/nutrition-days/:nutritionDayId",
  require("./get-nutritionday-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
nutritionDayRouter.get(
  "/nutrition-days/:nutritionDayId",
  require("./get-nutritionday-api"),
);
// listNutritionDays controller
nutritionDayRouter.get(
  "/v1/nutrition-days",
  require("./list-nutritiondays-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
nutritionDayRouter.get("/nutrition-days", require("./list-nutritiondays-api"));
// getWeeklyAnalytics controller
nutritionDayRouter.get(
  "/v1/analytics/weekly",
  require("./get-weeklyanalytics-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
nutritionDayRouter.get(
  "/analytics/weekly",
  require("./get-weeklyanalytics-api"),
);
// getMonthlyAnalytics controller
nutritionDayRouter.get(
  "/v1/analytics/monthly",
  require("./get-monthlyanalytics-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
nutritionDayRouter.get(
  "/analytics/monthly",
  require("./get-monthlyanalytics-api"),
);
// triggerDailyReminderCheck controller
nutritionDayRouter.post(
  "/v1/scheduled/daily-reminder-check",
  require("./trigger-dailyremindercheck-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
nutritionDayRouter.post(
  "/scheduled/daily-reminder-check",
  require("./trigger-dailyremindercheck-api"),
);
// triggerDailySummary controller
nutritionDayRouter.post(
  "/v1/scheduled/daily-summary",
  require("./trigger-dailysummary-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
nutritionDayRouter.post(
  "/scheduled/daily-summary",
  require("./trigger-dailysummary-api"),
);
// _fetchListNutritionDay controller
nutritionDayRouter.get(
  "/v1/_fetchlistnutritionday",
  require("./_fetch-listnutritionday-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
nutritionDayRouter.get(
  "/_fetchlistnutritionday",
  require("./_fetch-listnutritionday-api"),
);

module.exports = nutritionDayRouter;
