const express = require("express");

// Sys_agentExecution Db Object Rest Api Router
const sys_agentExecutionRouter = express.Router();

// add Sys_agentExecution controllers

// listAgentExecutions controller
sys_agentExecutionRouter.get(
  "/v1/agentexecutions",
  require("./list-agentexecutions-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentExecutionRouter.get(
  "/agentexecutions",
  require("./list-agentexecutions-api"),
);
// getAgentExecution controller
sys_agentExecutionRouter.get(
  "/v1/agentexecution/:sys_agentExecutionId",
  require("./get-agentexecution-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentExecutionRouter.get(
  "/agentexecution/:sys_agentExecutionId",
  require("./get-agentexecution-api"),
);
// _fetchListSys_agentExecution controller
sys_agentExecutionRouter.get(
  "/v1/_fetchlistsys_agentexecution",
  require("./_fetch-listsys_agentexecution-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentExecutionRouter.get(
  "/_fetchlistsys_agentexecution",
  require("./_fetch-listsys_agentexecution-api"),
);

module.exports = sys_agentExecutionRouter;
