const express = require("express");

// UserAvatarsFile Db Object Rest Api Router
const userAvatarsFileRouter = express.Router();

// add UserAvatarsFile controllers

// getUserAvatarsFile controller
userAvatarsFileRouter.get(
  "/v1/useravatarsfiles/:userAvatarsFileId",
  require("./get-useravatarsfile-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userAvatarsFileRouter.get(
  "/useravatarsfiles/:userAvatarsFileId",
  require("./get-useravatarsfile-api"),
);
// listUserAvatarsFiles controller
userAvatarsFileRouter.get(
  "/v1/useravatarsfiles",
  require("./list-useravatarsfiles-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userAvatarsFileRouter.get(
  "/useravatarsfiles",
  require("./list-useravatarsfiles-api"),
);
// deleteUserAvatarsFile controller
userAvatarsFileRouter.delete(
  "/v1/useravatarsfiles/:userAvatarsFileId",
  require("./delete-useravatarsfile-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userAvatarsFileRouter.delete(
  "/useravatarsfiles/:userAvatarsFileId",
  require("./delete-useravatarsfile-api"),
);
// _fetchListUserAvatarsFile controller
userAvatarsFileRouter.get(
  "/v1/_fetchlistuseravatarsfile",
  require("./_fetch-listuseravatarsfile-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userAvatarsFileRouter.get(
  "/_fetchlistuseravatarsfile",
  require("./_fetch-listuseravatarsfile-api"),
);

module.exports = userAvatarsFileRouter;
