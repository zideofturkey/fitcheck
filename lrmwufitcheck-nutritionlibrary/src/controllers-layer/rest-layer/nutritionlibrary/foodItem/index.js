const express = require("express");

// FoodItem Db Object Rest Api Router
const foodItemRouter = express.Router();

// add FoodItem controllers

// createFoodItem controller
foodItemRouter.post("/v1/food-items", require("./create-fooditem-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
foodItemRouter.post("/food-items", require("./create-fooditem-api"));
// getFoodItem controller
foodItemRouter.get("/v1/food-items/:foodItemId", require("./get-fooditem-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
foodItemRouter.get("/food-items/:foodItemId", require("./get-fooditem-api"));
// listFoodItems controller
foodItemRouter.get("/v1/food-items", require("./list-fooditems-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
foodItemRouter.get("/food-items", require("./list-fooditems-api"));
// updateFoodItem controller
foodItemRouter.patch(
  "/v1/food-items/:foodItemId",
  require("./update-fooditem-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
foodItemRouter.patch(
  "/food-items/:foodItemId",
  require("./update-fooditem-api"),
);
// deleteFoodItem controller
foodItemRouter.delete(
  "/v1/food-items/:foodItemId",
  require("./delete-fooditem-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
foodItemRouter.delete(
  "/food-items/:foodItemId",
  require("./delete-fooditem-api"),
);
// getFoodItemForLogging controller
foodItemRouter.get(
  "/v1/food-items/:foodItemId/for-logging",
  require("./get-fooditemforlogging-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
foodItemRouter.get(
  "/food-items/:foodItemId/for-logging",
  require("./get-fooditemforlogging-api"),
);
// _fetchListFoodItem controller
foodItemRouter.get(
  "/v1/_fetchlistfooditem",
  require("./_fetch-listfooditem-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
foodItemRouter.get("/_fetchlistfooditem", require("./_fetch-listfooditem-api"));

module.exports = foodItemRouter;
