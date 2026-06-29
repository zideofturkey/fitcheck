const {
  goalHitRateProteinReMonthlyAnalyticsView,
} = require("aggregates/monthlyAnalyticsView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_nutritionDay-updated",
  handle: async (event) => {
    const referenceValue = _.get(event, "userId");
    await goalHitRateProteinReMonthlyAnalyticsView(referenceValue);
    console.log("elastic-index-lrmwufitcheck_nutritionDay-updated:", event);
  },
};
