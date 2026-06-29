const express = require("express");

// AiGuidanceNote Db Object Rest Api Router
const aiGuidanceNoteRouter = express.Router();

// add AiGuidanceNote controllers

// getAiGuidanceNote controller
aiGuidanceNoteRouter.get(
  "/v1/ai-guidance-notes/:aiGuidanceNoteId",
  require("./get-aiguidancenote-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiGuidanceNoteRouter.get(
  "/ai-guidance-notes/:aiGuidanceNoteId",
  require("./get-aiguidancenote-api"),
);
// listAiGuidanceNotes controller
aiGuidanceNoteRouter.get(
  "/v1/ai-guidance-notes",
  require("./list-aiguidancenotes-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiGuidanceNoteRouter.get(
  "/ai-guidance-notes",
  require("./list-aiguidancenotes-api"),
);
// _fetchListAiGuidanceNote controller
aiGuidanceNoteRouter.get(
  "/v1/_fetchlistaiguidancenote",
  require("./_fetch-listaiguidancenote-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
aiGuidanceNoteRouter.get(
  "/_fetchlistaiguidancenote",
  require("./_fetch-listaiguidancenote-api"),
);

module.exports = aiGuidanceNoteRouter;
