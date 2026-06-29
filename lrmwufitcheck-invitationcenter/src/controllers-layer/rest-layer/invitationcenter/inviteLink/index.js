const express = require("express");

// InviteLink Db Object Rest Api Router
const inviteLinkRouter = express.Router();

// add InviteLink controllers

// validateInviteCode controller
inviteLinkRouter.post(
  "/v1/invite-links/validate",
  require("./validate-invitecode-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.post(
  "/invite-links/validate",
  require("./validate-invitecode-api"),
);
// createInviteLink controller
inviteLinkRouter.post("/v1/invite-links", require("./create-invitelink-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.post("/invite-links", require("./create-invitelink-api"));
// getInviteLinkByCode controller
inviteLinkRouter.get(
  "/v1/invite-links/by-code/:inviteCode",
  require("./get-invitelinkbycode-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.get(
  "/invite-links/by-code/:inviteCode",
  require("./get-invitelinkbycode-api"),
);
// activateInviteLink controller
inviteLinkRouter.patch(
  "/v1/invite-links/:inviteLinkId/activate",
  require("./activate-invitelink-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.patch(
  "/invite-links/:inviteLinkId/activate",
  require("./activate-invitelink-api"),
);
// revokeInviteLink controller
inviteLinkRouter.patch(
  "/v1/invite-links/:inviteLinkId/revoke",
  require("./revoke-invitelink-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.patch(
  "/invite-links/:inviteLinkId/revoke",
  require("./revoke-invitelink-api"),
);
// deliverInviteEmail controller
inviteLinkRouter.post(
  "/v1/invite-links/:inviteLinkId/deliver",
  require("./deliver-inviteemail-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.post(
  "/invite-links/:inviteLinkId/deliver",
  require("./deliver-inviteemail-api"),
);
// consumeInviteLink controller
inviteLinkRouter.patch(
  "/v1/invite-links/:inviteLinkId/consume",
  require("./consume-invitelink-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.patch(
  "/invite-links/:inviteLinkId/consume",
  require("./consume-invitelink-api"),
);
// getInviteLink controller
inviteLinkRouter.get(
  "/v1/invite-links/:inviteLinkId",
  require("./get-invitelink-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.get(
  "/invite-links/:inviteLinkId",
  require("./get-invitelink-api"),
);
// listInviteLinks controller
inviteLinkRouter.get("/v1/invite-links", require("./list-invitelinks-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.get("/invite-links", require("./list-invitelinks-api"));
// _fetchListInviteLink controller
inviteLinkRouter.get(
  "/v1/_fetchlistinvitelink",
  require("./_fetch-listinvitelink-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
inviteLinkRouter.get(
  "/_fetchlistinvitelink",
  require("./_fetch-listinvitelink-api"),
);

module.exports = inviteLinkRouter;
