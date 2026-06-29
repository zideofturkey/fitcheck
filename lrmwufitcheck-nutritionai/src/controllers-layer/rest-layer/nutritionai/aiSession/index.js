const express = require("express");

// AiSession Db Object Rest Api Router
const aiSessionRouter = express.Router();

// add AiSession controllers

// parseMeal controller
aiSessionRouter.post("/v1/ai-sessions/parse-meal", require("./parse-meal-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiSessionRouter.post("/ai-sessions/parse-meal", require("./parse-meal-api"));
// askNutritionQuestion controller
aiSessionRouter.post(
  "/v1/ai-sessions/ask",
  require("./ask-nutritionquestion-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiSessionRouter.post(
  "/ai-sessions/ask",
  require("./ask-nutritionquestion-api"),
);
// getAiSession controller
aiSessionRouter.get(
  "/v1/ai-sessions/:aiSessionId",
  require("./get-aisession-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiSessionRouter.get(
  "/ai-sessions/:aiSessionId",
  require("./get-aisession-api"),
);
// listAiSessions controller
aiSessionRouter.get("/v1/ai-sessions", require("./list-aisessions-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiSessionRouter.get("/ai-sessions", require("./list-aisessions-api"));
// _fetchListAiSession controller
aiSessionRouter.get(
  "/v1/_fetchlistaisession",
  require("./_fetch-listaisession-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiSessionRouter.get(
  "/_fetchlistaisession",
  require("./_fetch-listaisession-api"),
);

module.exports = aiSessionRouter;
