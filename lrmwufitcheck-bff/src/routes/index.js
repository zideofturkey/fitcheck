const express = require("express");
const router = express.Router();

const httpLogsRoute = require("./httpLogs.route.js");
router.use("/logs", httpLogsRoute);

const inviteLinkDeliveredNotificationViewRoute = require("./inviteLinkDeliveredNotificationView.route.js");
router.use(
  "/inviteLinkDeliveredNotificationView",
  inviteLinkDeliveredNotificationViewRoute,
);

const inviteLinkListViewRoute = require("./inviteLinkListView.route.js");
router.use("/inviteLinkListView", inviteLinkListViewRoute);

const presetMealWithLinesRoute = require("./presetMealWithLines.route.js");
router.use("/presetMealWithLines", presetMealWithLinesRoute);

const foodItemListRoute = require("./foodItemList.route.js");
router.use("/foodItemList", foodItemListRoute);

const aiCandidateMealWithLinesRoute = require("./aiCandidateMealWithLines.route.js");
router.use("/aiCandidateMealWithLines", aiCandidateMealWithLinesRoute);

const mealLogWithLinesRoute = require("./mealLogWithLines.route.js");
router.use("/mealLogWithLines", mealLogWithLinesRoute);

const aiSessionHistoryRoute = require("./aiSessionHistory.route.js");
router.use("/aiSessionHistory", aiSessionHistoryRoute);

const dailyProgressViewRoute = require("./dailyProgressView.route.js");
router.use("/dailyProgressView", dailyProgressViewRoute);

const weeklyAnalyticsViewRoute = require("./weeklyAnalyticsView.route.js");
router.use("/weeklyAnalyticsView", weeklyAnalyticsViewRoute);

const monthlyAnalyticsViewRoute = require("./monthlyAnalyticsView.route.js");
router.use("/monthlyAnalyticsView", monthlyAnalyticsViewRoute);

const dailyNutritionSummaryNotificationViewRoute = require("./dailyNutritionSummaryNotificationView.route.js");
router.use(
  "/dailyNutritionSummaryNotificationView",
  dailyNutritionSummaryNotificationViewRoute,
);

const dailyMealReminderNotificationViewRoute = require("./dailyMealReminderNotificationView.route.js");
router.use(
  "/dailyMealReminderNotificationView",
  dailyMealReminderNotificationViewRoute,
);

const dynamicRoute = require("./dynamic.route.js");
router.use("/dynamic", dynamicRoute);

module.exports = router;
