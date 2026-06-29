const express = require("express");

// MealLog Db Object Rest Api Router
const mealLogRouter = express.Router();

// add MealLog controllers

// createMealLog controller
mealLogRouter.post("/v1/meal-logs", require("./create-meallog-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLogRouter.post("/meal-logs", require("./create-meallog-api"));
// getMealLog controller
mealLogRouter.get("/v1/meal-logs/:mealLogId", require("./get-meallog-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLogRouter.get("/meal-logs/:mealLogId", require("./get-meallog-api"));
// listMealLogs controller
mealLogRouter.get("/v1/meal-logs", require("./list-meallogs-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLogRouter.get("/meal-logs", require("./list-meallogs-api"));
// updateMealLog controller
mealLogRouter.patch(
  "/v1/meal-logs/:mealLogId",
  require("./update-meallog-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLogRouter.patch("/meal-logs/:mealLogId", require("./update-meallog-api"));
// deleteMealLog controller
mealLogRouter.delete(
  "/v1/meal-logs/:mealLogId",
  require("./delete-meallog-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLogRouter.delete("/meal-logs/:mealLogId", require("./delete-meallog-api"));
// _fetchListMealLog controller
mealLogRouter.get("/v1/_fetchlistmeallog", require("./_fetch-listmeallog-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
mealLogRouter.get("/_fetchlistmeallog", require("./_fetch-listmeallog-api"));

module.exports = mealLogRouter;
