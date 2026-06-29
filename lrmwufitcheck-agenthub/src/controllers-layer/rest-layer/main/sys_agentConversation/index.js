const express = require("express");

// Sys_agentConversation Db Object Rest Api Router
const sys_agentConversationRouter = express.Router();

// add Sys_agentConversation controllers

// listAgentChats controller
sys_agentConversationRouter.get(
  "/v1/agentchats",
  require("./list-agentchats-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentConversationRouter.get(
  "/agentchats",
  require("./list-agentchats-api"),
);
// getAgentChatMessages controller
sys_agentConversationRouter.get(
  "/v1/agentchatmessages/:sys_agentConversationId",
  require("./get-agentchatmessages-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentConversationRouter.get(
  "/agentchatmessages/:sys_agentConversationId",
  require("./get-agentchatmessages-api"),
);
// _fetchListSys_agentConversation controller
sys_agentConversationRouter.get(
  "/v1/_fetchlistsys_agentconversation",
  require("./_fetch-listsys_agentconversation-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
sys_agentConversationRouter.get(
  "/_fetchlistsys_agentconversation",
  require("./_fetch-listsys_agentconversation-api"),
);

module.exports = sys_agentConversationRouter;
