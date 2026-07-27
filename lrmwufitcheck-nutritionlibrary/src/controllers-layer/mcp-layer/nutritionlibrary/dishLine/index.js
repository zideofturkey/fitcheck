module.exports = (headers) => {
  // DishLine Db Object Rest Api Router
  const dishLineMcpRouter = [];

  // addDishLine controller
  dishLineMcpRouter.push(require("./add-dishline-api")(headers));
  // listDishLines controller
  dishLineMcpRouter.push(require("./list-dishlines-api")(headers));
  // deleteDishLine controller
  dishLineMcpRouter.push(require("./delete-dishline-api")(headers));
  // _fetchListDishLine controller
  dishLineMcpRouter.push(require("./_fetch-listdishline-api")(headers));

  return dishLineMcpRouter;
};
