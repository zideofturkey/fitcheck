const {
  userProfileReDailyNutritionSummaryNotificationView,
} = require("aggregates/dailyNutritionSummaryNotificationView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_user-updated",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await userProfileReDailyNutritionSummaryNotificationView(referenceValue);
    console.log("elastic-index-lrmwufitcheck_user-updated:", event);
  },
};
