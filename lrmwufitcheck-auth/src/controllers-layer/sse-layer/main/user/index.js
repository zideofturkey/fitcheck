const express = require("express");

// User Db Object SSE Api Router
const userSseRouter = express.Router();

// getUser SSE controller
userSseRouter.get("/v1/users/:userId/stream", require("./get-user-api"));
// listUsers SSE controller
userSseRouter.get("/v1/users/stream", require("./list-users-api"));
// streamTest SSE controller
userSseRouter.get(
  "/v1/streamtest/:userId/stream",
  require("./stream-test-api"),
);

module.exports = userSseRouter;
