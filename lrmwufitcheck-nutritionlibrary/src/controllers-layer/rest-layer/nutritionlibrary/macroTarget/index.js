const express = require("express");

// MacroTarget Db Object Rest Api Router
const macroTargetRouter = express.Router();

// add MacroTarget controllers

// setMacroTarget controller
macroTargetRouter.post("/v1/macro-targets", require("./set-macrotarget-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
macroTargetRouter.post("/macro-targets", require("./set-macrotarget-api"));
// getMyMacroTargetForLogging controller
macroTargetRouter.get(
  "/v1/macro-targets/me/for-logging",
  require("./get-mymacrotargetforlogging-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
macroTargetRouter.get(
  "/macro-targets/me/for-logging",
  require("./get-mymacrotargetforlogging-api"),
);
// getMyMacroTarget controller
macroTargetRouter.get(
  "/v1/macro-targets/me",
  require("./get-mymacrotarget-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
macroTargetRouter.get("/macro-targets/me", require("./get-mymacrotarget-api"));
// _fetchListMacroTarget controller
macroTargetRouter.get(
  "/v1/_fetchlistmacrotarget",
  require("./_fetch-listmacrotarget-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
macroTargetRouter.get(
  "/_fetchlistmacrotarget",
  require("./_fetch-listmacrotarget-api"),
);

module.exports = macroTargetRouter;
