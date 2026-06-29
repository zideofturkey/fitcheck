/**
 * AI Complete Routes
 *
 * Provides endpoints for AI-powered auto-completion of API request bodies.
 * Used by the frontend API tester for intelligent data generation.
 */

const express = require("express");
const router = express.Router();
const aiCompleteService = require("../services/ai-complete-service");
const logger = require("../common/logger");

/**
 * POST /api/ai-complete/body
 *
 * Complete an API request body using AI with MCP tools
 *
 * Request body:
 * {
 *   serviceName: string,
 *   apiName: string,
 *   currentBody: object (optional),
 *   userContext: object (optional)
 * }
 *
 * Uses Authorization header for fetching related data via tools
 */
router.post("/body", async (req, res) => {
  try {
    const {
      serviceName,
      apiName,
      currentBody = {},
      userContext = {},
    } = req.body;

    if (!serviceName || !apiName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: serviceName and apiName",
      });
    }

    // Get MCP manager for tool access
    const mcpManager = req.app.get("mcpManager");

    // Extract auth token from header
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // Build user context with auth info
    const fullUserContext = {
      ...userContext,
      accessToken: authToken,
      userId: req.user?.userId,
      tenantCodename: req.tenant?.tenantCodename,
    };

    logger.info(`[AI Complete] Request: ${serviceName}/${apiName}`);

    const result = await aiCompleteService.completeApiBody(
      serviceName,
      apiName,
      currentBody,
      fullUserContext,
      authToken,
      mcpManager,
    );

    // Return the result (success or error)
    res.json(result);
  } catch (error) {
    logger.error(`[AI Complete] Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Failed to complete API body",
      message: error.message,
    });
  }
});

/**
 * GET /api/ai-complete/status
 *
 * Check AI Complete service status
 */
router.get("/status", async (req, res) => {
  try {
    const aiService = require("../services/ai-service");
    const mcpManager = req.app.get("mcpManager");

    const aiStatus = aiService.getStatus();
    const tools = mcpManager?.getAllTools() || [];

    res.json({
      success: true,
      ai: {
        available: aiService.isAvailable(),
        provider: aiService.getActiveProvider(),
      },
      tools: {
        count: tools.length,
        services: [...new Set(tools.map((t) => t.serviceName || "unknown"))],
      },
    });
  } catch (error) {
    logger.error(`[AI Complete] Status error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
