/**
 * Health Routes
 *
 * Health check and service status endpoints.
 */

const express = require("express");
const router = express.Router();

/**
 * GET /api/health
 *
 * Basic health check.
 */
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "lrmwufitcheck-mcpbff-service",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/health/detailed
 *
 * Detailed health check including MCP connections.
 */
router.get("/detailed", (req, res) => {
  const mcpManager = req.app.get("mcpManager");
  let connectionStatus = {};

  try {
    connectionStatus = mcpManager?.getConnectionStatus() || {};
  } catch (err) {
    connectionStatus = { error: "Unable to get connection status" };
  }

  const allConnected = Object.values(connectionStatus).every(
    (s) => s.connected === true,
  );

  res.json({
    status: allConnected ? "healthy" : "degraded",
    service: "lrmwufitcheck-mcpbff-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: connectionStatus,
  });
});

module.exports = router;
