const express = require("express");

// AiCandidateMeal Db Object Rest Api Router
const aiCandidateMealRouter = express.Router();

// add AiCandidateMeal controllers

// confirmCandidateMeal controller
aiCandidateMealRouter.patch(
  "/v1/ai-candidate-meals/:aiCandidateMealId/confirm",
  require("./confirm-candidatemeal-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiCandidateMealRouter.patch(
  "/ai-candidate-meals/:aiCandidateMealId/confirm",
  require("./confirm-candidatemeal-api"),
);
// getAiCandidateMeal controller
aiCandidateMealRouter.get(
  "/v1/ai-candidate-meals/:aiCandidateMealId",
  require("./get-aicandidatemeal-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiCandidateMealRouter.get(
  "/ai-candidate-meals/:aiCandidateMealId",
  require("./get-aicandidatemeal-api"),
);
// listAiCandidateMeals controller
aiCandidateMealRouter.get(
  "/v1/ai-candidate-meals",
  require("./list-aicandidatemeals-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiCandidateMealRouter.get(
  "/ai-candidate-meals",
  require("./list-aicandidatemeals-api"),
);
// rejectCandidateMeal controller
aiCandidateMealRouter.patch(
  "/v1/ai-candidate-meals/:aiCandidateMealId/reject",
  require("./reject-candidatemeal-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiCandidateMealRouter.patch(
  "/ai-candidate-meals/:aiCandidateMealId/reject",
  require("./reject-candidatemeal-api"),
);
// _fetchListAiCandidateMeal controller
aiCandidateMealRouter.get(
  "/v1/_fetchlistaicandidatemeal",
  require("./_fetch-listaicandidatemeal-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiCandidateMealRouter.get(
  "/_fetchlistaicandidatemeal",
  require("./_fetch-listaicandidatemeal-api"),
);

module.exports = aiCandidateMealRouter;
