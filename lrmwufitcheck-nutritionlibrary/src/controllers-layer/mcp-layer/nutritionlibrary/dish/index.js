module.exports = (headers) => {
  // Dish Db Object Rest Api Router
  const dishMcpRouter = [];

  // createDish controller
  dishMcpRouter.push(require("./create-dish-api")(headers));
  // getDish controller
  dishMcpRouter.push(require("./get-dish-api")(headers));
  // listDishes controller
  dishMcpRouter.push(require("./list-dishes-api")(headers));
  // updateDish controller
  dishMcpRouter.push(require("./update-dish-api")(headers));
  // deleteDish controller
  dishMcpRouter.push(require("./delete-dish-api")(headers));
  // _fetchListDish controller
  dishMcpRouter.push(require("./_fetch-listdish-api")(headers));

  return dishMcpRouter;
};
