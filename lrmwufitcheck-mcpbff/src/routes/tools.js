/**
 * Tools Routes
 *
 * Provides tool discovery and direct tool invocation endpoints.
 */

const express = require("express");
const router = express.Router();
const logger = require("../common/logger");
const aiService = require("../services/ai-service");
const uuidAliasRegistry = require("../services/uuid-alias-registry");
const {
  isFetchListTool,
  computeAutoFilteredServices,
} = require("../common/tool-filters");

function normalizeRoles(roles) {
  if (!roles) return [];
  if (Array.isArray(roles)) {
    return roles
      .map((r) =>
        String(r || "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);
  }
  return [String(roles).trim().toLowerCase()].filter(Boolean);
}

function buildToolAccessReport(tools, roleId) {
  const consideredRoles = normalizeRoles(roleId);
  const visibleTools = [];
  const filteredOutTools = [];

  for (const tool of tools || []) {
    const requiredRoles = normalizeRoles(tool.requiredRoles);
    const isAllowed =
      requiredRoles.length === 0 ||
      consideredRoles.length === 0 ||
      requiredRoles.some((role) => consideredRoles.includes(role));

    if (isAllowed) {
      visibleTools.push(tool);
    } else {
      filteredOutTools.push({
        name: tool.name,
        service: tool.service,
        requiredRoles: tool.requiredRoles || [],
        reason: `Missing required role(s): ${(tool.requiredRoles || []).join(", ")}`,
      });
    }
  }

  return {
    consideredRoleId: roleId || null,
    consideredRoles,
    totalTools: (tools || []).length,
    visibleCount: visibleTools.length,
    filteredOutCount: filteredOutTools.length,
    filteredOutTools,
    visibleTools,
  };
}

/**
 * GET /api/tools
 *
 * List all available MCP tools across all connected services.
 */
router.get("/", async (req, res) => {
  try {
    const mcpManager = req.app.get("mcpManager");
    const allTools = mcpManager.getAllTools();

    // Always strip _fetchXXList tools from display
    const tools = allTools.filter((t) => !isFetchListTool(t.name));
    const fetchListCount = allTools.length - tools.length;

    // Advisory: which services would be auto-filtered by the 120-tool cap
    const autoFilteredServices = computeAutoFilteredServices(allTools);

    const accessReport = buildToolAccessReport(tools, req.user?.roleId);

    res.json({
      success: true,
      count: accessReport.visibleCount,
      totalTools: accessReport.totalTools,
      fetchListToolsRemoved: fetchListCount,
      autoFilteredServices,
      tools: accessReport.visibleTools,
      roleAccess: {
        consideredRoleId: accessReport.consideredRoleId,
        consideredRoles: accessReport.consideredRoles,
        filteredOutCount: accessReport.filteredOutCount,
        filteredOutTools: accessReport.filteredOutTools,
      },
    });
  } catch (error) {
    logger.error("Error listing tools:", error);
    res.status(500).json({ error: "Failed to list tools" });
  }
});

/**
 * GET /api/tools/service/:serviceName
 *
 * List tools for a specific service.
 */
router.get("/service/:serviceName", async (req, res) => {
  try {
    const { serviceName } = req.params;
    const mcpManager = req.app.get("mcpManager");
    const tools = mcpManager.getToolsByService(serviceName);
    const accessReport = buildToolAccessReport(tools, req.user?.roleId);

    res.json({
      success: true,
      service: serviceName,
      count: accessReport.visibleCount,
      totalTools: accessReport.totalTools,
      tools: accessReport.visibleTools,
      roleAccess: {
        consideredRoleId: accessReport.consideredRoleId,
        consideredRoles: accessReport.consideredRoles,
        filteredOutCount: accessReport.filteredOutCount,
        filteredOutTools: accessReport.filteredOutTools,
      },
    });
  } catch (error) {
    logger.error(`Error listing tools for ${req.params.serviceName}:`, error);
    res.status(500).json({ error: "Failed to list service tools" });
  }
});

/**
 * POST /api/tools/call
 *
 * Call a specific MCP tool.
 *
 * Body:
 * - name: string - Tool name
 * - arguments: object - Tool arguments
 */
router.post("/call", async (req, res) => {
  try {
    const { name, arguments: args = {} } = req.body;
    const mcpManager = req.app.get("mcpManager");

    if (!name) {
      return res.status(400).json({ error: "Tool name is required" });
    }

    const userContext = {
      userId: req.user.userId,
      sessionId: req.user.sessionId,
      conversationId: req.body?.conversationId || req.user.sessionId,
      accessToken: req.accessToken,
    };

    let resolvedArgs = args;
    if (aiService.UUID_ALIAS_ENABLED) {
      const resolved = uuidAliasRegistry.resolveAliasesInArgs(
        userContext,
        args,
      );
      if (!resolved.success) {
        return res.status(400).json({
          success: false,
          error: `Unknown ID alias(es): ${(resolved.unknownAliases || []).join(", ")}`,
          code: "UNKNOWN_ID_ALIAS",
          unknownAliases: resolved.unknownAliases || [],
          knownAliases: resolved.knownAliases || [],
        });
      }
      resolvedArgs = resolved.resolvedArgs;
    }

    const result = await mcpManager.callTool(name, resolvedArgs, userContext);
    const aliasedResult = aiService.UUID_ALIAS_ENABLED
      ? uuidAliasRegistry.replaceUuidsWithAliases(userContext, result)
      : result;
    const aliasMapSummary = aiService.UUID_ALIAS_ENABLED
      ? { enabled: true, ...uuidAliasRegistry.getAliasMapSummary(userContext) }
      : { enabled: false, count: 0, samples: [] };

    res.json({
      ...aliasedResult,
      aliasMapSummary,
    });
  } catch (error) {
    logger.error("Tool call error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tools/status
 *
 * Get connection status of all MCP servers.
 */
router.get("/status", async (req, res) => {
  try {
    const mcpManager = req.app.get("mcpManager");
    const status = mcpManager.getConnectionStatus();

    res.json({
      success: true,
      connections: status,
    });
  } catch (error) {
    logger.error("Error getting status:", error);
    res.status(500).json({ error: "Failed to get connection status" });
  }
});

/**
 * POST /api/tools/refresh
 *
 * Reconnect disconnected services and refresh the tool registry.
 * Returns full status with all services and their tools.
 */
router.post("/refresh", async (req, res) => {
  try {
    const mcpManager = req.app.get("mcpManager");

    // First, try to reconnect any disconnected services
    const reconnected = await mcpManager.reconnectDisconnected();

    // Refresh tool registry (in case tools changed)
    await mcpManager.refreshToolRegistry();

    // Get updated status
    const connectionStatus = mcpManager.getConnectionStatus();
    const rawTools = mcpManager.getAllTools();
    const visibleTools = rawTools.filter((t) => !isFetchListTool(t.name));
    const autoFilteredServices = computeAutoFilteredServices(rawTools);
    const accessReport = buildToolAccessReport(visibleTools, req.user?.roleId);
    const tools = accessReport.visibleTools;

    // Group tools by service
    const toolsByService = {};
    for (const tool of tools) {
      const service = tool.service || "unknown";
      if (!toolsByService[service]) {
        toolsByService[service] = [];
      }
      toolsByService[service].push({
        name: tool.name,
        description: tool.description,
        requiredRoles: tool.requiredRoles || [],
      });
    }

    res.json({
      success: true,
      message: reconnected
        ? "Reconnected services and refreshed tools"
        : "Tool registry refreshed",
      reconnected,
      roleAccess: {
        consideredRoleId: accessReport.consideredRoleId,
        consideredRoles: accessReport.consideredRoles,
        filteredOutCount: accessReport.filteredOutCount,
        filteredOutTools: accessReport.filteredOutTools,
      },
      services: Object.fromEntries(
        Object.keys(connectionStatus).map((service) => [
          service,
          {
            connected: connectionStatus[service]?.connected || false,
            url: connectionStatus[service]?.url || "unknown",
            toolCount: toolsByService[service]?.length || 0,
          },
        ]),
      ),
      totalTools: accessReport.totalTools,
      visibleTools: accessReport.visibleCount,
      fetchListToolsRemoved: rawTools.length - visibleTools.length,
      autoFilteredServices,
      tools: toolsByService,
    });
  } catch (error) {
    logger.error("Error refreshing tools:", error);
    res.status(500).json({ error: "Failed to refresh tools" });
  }
});

module.exports = router;
