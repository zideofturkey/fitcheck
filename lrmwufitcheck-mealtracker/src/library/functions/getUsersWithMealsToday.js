/**
 * getUsersWithMealsToday()
 * Returns nutritionDay rows for today where mealCount > 0,
 * enriched with fullName and email from auth service.
 */
const { getNutritionDayListByMQuery } = require("dbLayer");
const { fetchRemoteObjectByMQuery } = require("serviceCommon");

module.exports = async function getUsersWithMealsToday() {
  const today = new Date().toISOString().slice(0, 10);

  const result = await getNutritionDayListByMQuery({
    summaryDate: today,
    mealCount: { $gt: 0 },
  });
  const days = result && result.items ? result.items : [];

  const enriched = await Promise.all(
    days.map(async (day) => {
      let fullName = "";
      let email = "";
      try {
        const user = await fetchRemoteObjectByMQuery("user", {
          id: day.userId,
        });
        if (user) {
          fullName = user.fullname || user.name || "";
          email = user.email || "";
        }
      } catch (e) {}
      return { ...day, fullName, email };
    }),
  );

  return enriched;
};
