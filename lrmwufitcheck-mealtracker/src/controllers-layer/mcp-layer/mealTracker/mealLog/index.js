module.exports = (headers) => {
  // MealLog Db Object Rest Api Router
  const mealLogMcpRouter = [];

  // createMealLog controller
  mealLogMcpRouter.push(require("./create-meallog-api")(headers));
  // getMealLog controller
  mealLogMcpRouter.push(require("./get-meallog-api")(headers));
  // listMealLogs controller
  mealLogMcpRouter.push(require("./list-meallogs-api")(headers));
  // updateMealLog controller
  mealLogMcpRouter.push(require("./update-meallog-api")(headers));
  // deleteMealLog controller
  mealLogMcpRouter.push(require("./delete-meallog-api")(headers));
  // _fetchListMealLog controller
  mealLogMcpRouter.push(require("./_fetch-listmeallog-api")(headers));

  return mealLogMcpRouter;
};
