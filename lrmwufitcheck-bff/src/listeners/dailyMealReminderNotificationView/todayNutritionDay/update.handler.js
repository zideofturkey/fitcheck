const {
  todayNutritionDayReDailyMealReminderNotificationView,
} = require("aggregates/dailyMealReminderNotificationView.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_nutritionday-updated",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await todayNutritionDayReDailyMealReminderNotificationView(referenceValue);
    console.log("elastic-index-lrmwufitcheck_nutritionday-updated:", event);
  },
};
