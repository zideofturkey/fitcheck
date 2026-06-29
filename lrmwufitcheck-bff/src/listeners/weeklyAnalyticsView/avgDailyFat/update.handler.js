const {
  avgDailyFatReWeeklyAnalyticsView,
} = require("aggregates/weeklyAnalyticsView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_nutritionDay-updated",
  handle: async (event) => {
    const referenceValue = _.get(event, "userId");
    await avgDailyFatReWeeklyAnalyticsView(referenceValue);
    console.log("elastic-index-lrmwufitcheck_nutritionDay-updated:", event);
  },
};
