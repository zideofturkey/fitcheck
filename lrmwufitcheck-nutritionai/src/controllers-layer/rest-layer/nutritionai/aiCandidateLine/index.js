const express = require("express");

// AiCandidateLine Db Object Rest Api Router
const aiCandidateLineRouter = express.Router();

// add AiCandidateLine controllers

// updateAiCandidateLine controller
aiCandidateLineRouter.patch(
  "/v1/ai-candidate-lines/:aiCandidateLineId",
  require("./update-aicandidateline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiCandidateLineRouter.patch(
  "/ai-candidate-lines/:aiCandidateLineId",
  require("./update-aicandidateline-api"),
);
// _fetchListAiCandidateLine controller
aiCandidateLineRouter.get(
  "/v1/_fetchlistaicandidateline",
  require("./_fetch-listaicandidateline-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiCandidateLineRouter.get(
  "/_fetchlistaicandidateline",
  require("./_fetch-listaicandidateline-api"),
);

module.exports = aiCandidateLineRouter;
