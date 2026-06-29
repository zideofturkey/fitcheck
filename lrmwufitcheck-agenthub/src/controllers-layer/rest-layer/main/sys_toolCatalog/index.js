const express = require("express");

// Sys_toolCatalog Db Object Rest Api Router
const sys_toolCatalogRouter = express.Router();

// add Sys_toolCatalog controllers

// listToolCatalog controller
sys_toolCatalogRouter.get("/v1/toolcatalog", require("./list-toolcatalog-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_toolCatalogRouter.get("/toolcatalog", require("./list-toolcatalog-api"));
// getToolCatalogEntry controller
sys_toolCatalogRouter.get(
  "/v1/toolcatalogentry/:sys_toolCatalogId",
  require("./get-toolcatalogentry-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_toolCatalogRouter.get(
  "/toolcatalogentry/:sys_toolCatalogId",
  require("./get-toolcatalogentry-api"),
);
// _fetchListSys_toolCatalog controller
sys_toolCatalogRouter.get(
  "/v1/_fetchlistsys_toolcatalog",
  require("./_fetch-listsys_toolcatalog-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_toolCatalogRouter.get(
  "/_fetchlistsys_toolcatalog",
  require("./_fetch-listsys_toolcatalog-api"),
);

module.exports = sys_toolCatalogRouter;
