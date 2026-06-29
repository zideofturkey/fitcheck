const express = require("express");

// Sys_agentOverride Db Object Rest Api Router
const sys_agentOverrideRouter = express.Router();

// add Sys_agentOverride controllers

// getAgentOverride controller
sys_agentOverrideRouter.get(
  "/v1/agentoverride/:sys_agentOverrideId",
  require("./get-agentoverride-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentOverrideRouter.get(
  "/agentoverride/:sys_agentOverrideId",
  require("./get-agentoverride-api"),
);
// listAgentOverrides controller
sys_agentOverrideRouter.get(
  "/v1/agentoverrides",
  require("./list-agentoverrides-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentOverrideRouter.get(
  "/agentoverrides",
  require("./list-agentoverrides-api"),
);
// createAgentOverride controller
sys_agentOverrideRouter.post(
  "/v1/agentoverride",
  require("./create-agentoverride-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentOverrideRouter.post(
  "/agentoverride",
  require("./create-agentoverride-api"),
);
// updateAgentOverride controller
sys_agentOverrideRouter.patch(
  "/v1/agentoverride/:sys_agentOverrideId",
  require("./update-agentoverride-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentOverrideRouter.patch(
  "/agentoverride/:sys_agentOverrideId",
  require("./update-agentoverride-api"),
);
// deleteAgentOverride controller
sys_agentOverrideRouter.delete(
  "/v1/agentoverride/:sys_agentOverrideId",
  require("./delete-agentoverride-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentOverrideRouter.delete(
  "/agentoverride/:sys_agentOverrideId",
  require("./delete-agentoverride-api"),
);
// _fetchListSys_agentOverride controller
sys_agentOverrideRouter.get(
  "/v1/_fetchlistsys_agentoverride",
  require("./_fetch-listsys_agentoverride-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentOverrideRouter.get(
  "/_fetchlistsys_agentoverride",
  require("./_fetch-listsys_agentoverride-api"),
);

module.exports = sys_agentOverrideRouter;
