const express = require("express");

// User Db Object Rest Api Router
const userRouter = express.Router();

// add User controllers

// getUser controller
userRouter.get("/v1/users/:userId", require("./get-user-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.get("/users/:userId", require("./get-user-api"));
// updateUser controller
userRouter.patch("/v1/users/:userId", require("./update-user-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.patch("/users/:userId", require("./update-user-api"));
// updateProfile controller
userRouter.patch("/v1/profile", require("./update-profile-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.patch("/profile", require("./update-profile-api"));
// createUser controller
userRouter.post("/v1/users", require("./create-user-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.post("/users", require("./create-user-api"));
// deleteUser controller
userRouter.delete("/v1/users/:userId", require("./delete-user-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.delete("/users/:userId", require("./delete-user-api"));
// archiveProfile controller
userRouter.delete("/v1/archiveprofile", require("./archive-profile-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.delete("/archiveprofile", require("./archive-profile-api"));
// listUsers controller
userRouter.get("/v1/users", require("./list-users-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.get("/users", require("./list-users-api"));
// searchUsers controller
userRouter.get("/v1/searchusers", require("./search-users-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.get("/searchusers", require("./search-users-api"));
// updateUserRole controller
userRouter.patch("/v1/userrole/:userId", require("./update-userrole-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.patch("/userrole/:userId", require("./update-userrole-api"));
// updateUserPassword controller
userRouter.patch("/v1/userpassword", require("./update-userpassword-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.patch("/userpassword", require("./update-userpassword-api"));
// updateUserPasswordByAdmin controller
userRouter.patch(
  "/v1/userpasswordbyadmin/:userId",
  require("./update-userpasswordbyadmin-api"),
);
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.patch(
  "/userpasswordbyadmin/:userId",
  require("./update-userpasswordbyadmin-api"),
);
// getBriefUser controller
userRouter.get("/v1/briefuser/:userId", require("./get-briefuser-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.get("/briefuser/:userId", require("./get-briefuser-api"));
// streamTest controller
userRouter.get("/v1/streamtest/:userId", require("./stream-test-api"));
// Default-version alias: bare path resolves to v1 (the default version,
// pinned for stability). Lets clients call either /v1/foo or /foo and
// get the same handler. Add /v2 explicitly when a v2 ships.
userRouter.get("/streamtest/:userId", require("./stream-test-api"));

module.exports = userRouter;
