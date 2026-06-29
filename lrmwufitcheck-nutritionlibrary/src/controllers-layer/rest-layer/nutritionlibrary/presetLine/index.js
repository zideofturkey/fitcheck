const express = require("express");

// PresetLine Db Object Rest Api Router
const presetLineRouter = express.Router();

// add PresetLine controllers

// addPresetLine controller
presetLineRouter.post(
  "/v1/preset-meals/:presetMealId/lines",
  require("./add-presetline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetLineRouter.post(
  "/preset-meals/:presetMealId/lines",
  require("./add-presetline-api"),
);
// listPresetLines controller
presetLineRouter.get(
  "/v1/preset-meals/:presetMealId/lines",
  require("./list-presetlines-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetLineRouter.get(
  "/preset-meals/:presetMealId/lines",
  require("./list-presetlines-api"),
);
// deletePresetLine controller
presetLineRouter.delete(
  "/v1/preset-meals/:presetMealId/lines/:presetLineId",
  require("./delete-presetline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetLineRouter.delete(
  "/preset-meals/:presetMealId/lines/:presetLineId",
  require("./delete-presetline-api"),
);
// _fetchListPresetLine controller
presetLineRouter.get(
  "/v1/_fetchlistpresetline",
  require("./_fetch-listpresetline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
presetLineRouter.get(
  "/_fetchlistpresetline",
  require("./_fetch-listpresetline-api"),
);

module.exports = presetLineRouter;
