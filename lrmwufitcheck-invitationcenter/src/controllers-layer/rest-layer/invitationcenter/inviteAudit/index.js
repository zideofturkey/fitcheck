const express = require("express");

// InviteAudit Db Object Rest Api Router
const inviteAuditRouter = express.Router();

// add InviteAudit controllers

// listInviteAudits controller
inviteAuditRouter.get("/v1/invite-audits", require("./list-inviteaudits-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteAuditRouter.get("/invite-audits", require("./list-inviteaudits-api"));
// _fetchListInviteAudit controller
inviteAuditRouter.get(
  "/v1/_fetchlistinviteaudit",
  require("./_fetch-listinviteaudit-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteAuditRouter.get(
  "/_fetchlistinviteaudit",
  require("./_fetch-listinviteaudit-api"),
);

module.exports = inviteAuditRouter;
