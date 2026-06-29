/**
 * getUsersWithNoMealsToday()
 * Returns users who have no mealLog for today or whose nutritionDay.mealCount === 0.
 * Enriches each with fullName and email via inter-service auth lookup.
 */
const { getNutritionDayListByMQuery } = require("dbLayer");
const { fetchRemoteListByMQuery } = require("serviceCommon");

module.exports = async function getUsersWithNoMealsToday() {
  const today = new Date().toISOString().slice(0, 10);

  // Get all nutritionDay records for today with mealCount === 0
  const zeroResult = await getNutritionDayListByMQuery({
    summaryDate: today,
    mealCount: 0,
  });
  const zeroUserIds =
    zeroResult && zeroResult.items ? zeroResult.items.map((d) => d.userId) : [];

  // Also get all users from auth service and subtract those who have logged meals today
  let allUsers = [];
  try {
    const usersResult = await fetchRemoteListByMQuery("user", {});
    allUsers = usersResult && usersResult.items ? usersResult.items : [];
  } catch (e) {
    allUsers = [];
  }

  const todayResult = await getNutritionDayListByMQuery({ summaryDate: today });
  const todayUserIds = new Set(
    todayResult && todayResult.items
      ? todayResult.items.filter((d) => d.mealCount > 0).map((d) => d.userId)
      : [],
  );

  const usersWithNoMeals = allUsers.filter((u) => !todayUserIds.has(u.id));

  return usersWithNoMeals.map((u) => ({
    userId: u.id,
    fullName: u.fullname || u.name || "",
    email: u.email || "",
    todayDate: today,
  }));
};
