const express = require("express");

// Dish Db Object Rest Api Router
const dishRouter = express.Router();

// add Dish controllers

// createDish controller
dishRouter.post("/v1/dishes", require("./create-dish-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishRouter.post("/dishes", require("./create-dish-api"));
// getDish controller
dishRouter.get("/v1/dishes/:dishId", require("./get-dish-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishRouter.get("/dishes/:dishId", require("./get-dish-api"));
// listDishes controller
dishRouter.get("/v1/dishes", require("./list-dishes-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishRouter.get("/dishes", require("./list-dishes-api"));
// updateDish controller
dishRouter.patch("/v1/dishes/:dishId", require("./update-dish-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishRouter.patch("/dishes/:dishId", require("./update-dish-api"));
// deleteDish controller
dishRouter.delete("/v1/dishes/:dishId", require("./delete-dish-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishRouter.delete("/dishes/:dishId", require("./delete-dish-api"));
// _fetchListDish controller
dishRouter.get("/v1/_fetchlistdish", require("./_fetch-listdish-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
dishRouter.get("/_fetchlistdish", require("./_fetch-listdish-api"));

module.exports = dishRouter;
