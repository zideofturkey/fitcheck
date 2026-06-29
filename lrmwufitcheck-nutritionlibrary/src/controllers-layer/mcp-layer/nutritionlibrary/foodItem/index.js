module.exports = (headers) => {
  // FoodItem Db Object Rest Api Router
  const foodItemMcpRouter = [];

  // createFoodItem controller
  foodItemMcpRouter.push(require("./create-fooditem-api")(headers));
  // getFoodItem controller
  foodItemMcpRouter.push(require("./get-fooditem-api")(headers));
  // listFoodItems controller
  foodItemMcpRouter.push(require("./list-fooditems-api")(headers));
  // updateFoodItem controller
  foodItemMcpRouter.push(require("./update-fooditem-api")(headers));
  // deleteFoodItem controller
  foodItemMcpRouter.push(require("./delete-fooditem-api")(headers));
  // getFoodItemForLogging controller
  foodItemMcpRouter.push(require("./get-fooditemforlogging-api")(headers));
  // _fetchListFoodItem controller
  foodItemMcpRouter.push(require("./_fetch-listfooditem-api")(headers));

  return foodItemMcpRouter;
};
