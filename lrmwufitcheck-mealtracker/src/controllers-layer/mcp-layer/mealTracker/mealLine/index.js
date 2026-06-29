module.exports = (headers) => {
  // MealLine Db Object Rest Api Router
  const mealLineMcpRouter = [];

  // createMealLine controller
  mealLineMcpRouter.push(require("./create-mealline-api")(headers));
  // updateMealLine controller
  mealLineMcpRouter.push(require("./update-mealline-api")(headers));
  // deleteMealLine controller
  mealLineMcpRouter.push(require("./delete-mealline-api")(headers));
  // listMealLines controller
  mealLineMcpRouter.push(require("./list-meallines-api")(headers));
  // _fetchListMealLine controller
  mealLineMcpRouter.push(require("./_fetch-listmealline-api")(headers));

  return mealLineMcpRouter;
};
