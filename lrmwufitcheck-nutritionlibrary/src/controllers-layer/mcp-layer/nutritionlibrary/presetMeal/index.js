module.exports = (headers) => {
  // PresetMeal Db Object Rest Api Router
  const presetMealMcpRouter = [];

  // createPresetMeal controller
  presetMealMcpRouter.push(require("./create-presetmeal-api")(headers));
  // getPresetMeal controller
  presetMealMcpRouter.push(require("./get-presetmeal-api")(headers));
  // listPresetMeals controller
  presetMealMcpRouter.push(require("./list-presetmeals-api")(headers));
  // updatePresetMeal controller
  presetMealMcpRouter.push(require("./update-presetmeal-api")(headers));
  // deletePresetMeal controller
  presetMealMcpRouter.push(require("./delete-presetmeal-api")(headers));
  // getPresetMealForLogging controller
  presetMealMcpRouter.push(require("./get-presetmealforlogging-api")(headers));
  // _fetchListPresetMeal controller
  presetMealMcpRouter.push(require("./_fetch-listpresetmeal-api")(headers));

  return presetMealMcpRouter;
};
