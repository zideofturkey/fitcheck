const express = require("express");

// PresetMeal Db Object Rest Api Router
const presetMealRouter = express.Router();

// add PresetMeal controllers

// createPresetMeal controller
presetMealRouter.post("/v1/preset-meals", require("./create-presetmeal-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetMealRouter.post("/preset-meals", require("./create-presetmeal-api"));
// getPresetMeal controller
presetMealRouter.get(
  "/v1/preset-meals/:presetMealId",
  require("./get-presetmeal-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetMealRouter.get(
  "/preset-meals/:presetMealId",
  require("./get-presetmeal-api"),
);
// listPresetMeals controller
presetMealRouter.get("/v1/preset-meals", require("./list-presetmeals-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetMealRouter.get("/preset-meals", require("./list-presetmeals-api"));
// updatePresetMeal controller
presetMealRouter.patch(
  "/v1/preset-meals/:presetMealId",
  require("./update-presetmeal-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetMealRouter.patch(
  "/preset-meals/:presetMealId",
  require("./update-presetmeal-api"),
);
// deletePresetMeal controller
presetMealRouter.delete(
  "/v1/preset-meals/:presetMealId",
  require("./delete-presetmeal-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetMealRouter.delete(
  "/preset-meals/:presetMealId",
  require("./delete-presetmeal-api"),
);
// getPresetMealForLogging controller
presetMealRouter.get(
  "/v1/preset-meals/:presetMealId/for-logging",
  require("./get-presetmealforlogging-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetMealRouter.get(
  "/preset-meals/:presetMealId/for-logging",
  require("./get-presetmealforlogging-api"),
);
// _fetchListPresetMeal controller
presetMealRouter.get(
  "/v1/_fetchlistpresetmeal",
  require("./_fetch-listpresetmeal-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetMealRouter.get(
  "/_fetchlistpresetmeal",
  require("./_fetch-listpresetmeal-api"),
);

module.exports = presetMealRouter;
