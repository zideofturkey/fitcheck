const express = require("express");

// MealLine Db Object Rest Api Router
const mealLineRouter = express.Router();

// add MealLine controllers

// createMealLine controller
mealLineRouter.post("/v1/meal-lines", require("./create-mealline-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLineRouter.post("/meal-lines", require("./create-mealline-api"));
// updateMealLine controller
mealLineRouter.patch(
  "/v1/meal-lines/:mealLineId",
  require("./update-mealline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLineRouter.patch(
  "/meal-lines/:mealLineId",
  require("./update-mealline-api"),
);
// deleteMealLine controller
mealLineRouter.delete(
  "/v1/meal-lines/:mealLineId",
  require("./delete-mealline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLineRouter.delete(
  "/meal-lines/:mealLineId",
  require("./delete-mealline-api"),
);
// listMealLines controller
mealLineRouter.get("/v1/meal-lines", require("./list-meallines-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLineRouter.get("/meal-lines", require("./list-meallines-api"));
// _fetchListMealLine controller
mealLineRouter.get(
  "/v1/_fetchlistmealline",
  require("./_fetch-listmealline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLineRouter.get("/_fetchlistmealline", require("./_fetch-listmealline-api"));

module.exports = mealLineRouter;
