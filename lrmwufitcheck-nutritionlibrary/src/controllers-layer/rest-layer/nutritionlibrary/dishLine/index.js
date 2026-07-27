const express = require("express");

// DishLine Db Object Rest Api Router
const dishLineRouter = express.Router();

// add DishLine controllers

// addDishLine controller
dishLineRouter.post(
  "/v1/dishes/:dishId/lines",
  require("./add-dishline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishLineRouter.post("/dishes/:dishId/lines", require("./add-dishline-api"));
// listDishLines controller
dishLineRouter.get(
  "/v1/dishes/:dishId/lines",
  require("./list-dishlines-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishLineRouter.get("/dishes/:dishId/lines", require("./list-dishlines-api"));
// deleteDishLine controller
dishLineRouter.delete(
  "/v1/dishes/:dishId/lines/:dishLineId",
  require("./delete-dishline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishLineRouter.delete(
  "/dishes/:dishId/lines/:dishLineId",
  require("./delete-dishline-api"),
);
// _fetchListDishLine controller
dishLineRouter.get(
  "/v1/_fetchlistdishline",
  require("./_fetch-listdishline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishLineRouter.get(
  "/_fetchlistdishline",
  require("./_fetch-listdishline-api"),
);

module.exports = dishLineRouter;
