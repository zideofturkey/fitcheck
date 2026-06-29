const express = require("express");
const router = express.Router();
const { authenticationMiddleware } = require("../middlewares/authentication");

const notificationRoute = require("./notification.route");
const deviceRoute = require("./device.route");

router.use("/notifications", authenticationMiddleware, notificationRoute);
router.use("/devices", authenticationMiddleware, deviceRoute);

module.exports = router;
