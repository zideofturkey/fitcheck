const {
  avgDailyCaloriesReWeeklyAnalyticsView,
} = require("aggregates/weeklyAnalyticsView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_nutritionDay-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "userId");
    await avgDailyCaloriesReWeeklyAnalyticsView(referenceValue);
    console.log("elastic-index-lrmwufitcheck_nutritionDay-created:", event);
  },
};
