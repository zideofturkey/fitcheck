/**
 * MCP Server Route — Unified MCP endpoint for external tools
 *
 * Exposes all aggregated MCP tools through a single protocol-compliant endpoint.
 *
 * StreamableHTTP (primary, modern clients):
 *   POST   /mcp            — Initialize session or send MCP messages
 *   GET    /mcp            — Server-to-client notifications (with mcp-session-id)
 *   DELETE /mcp            — Terminate session
 *
 * SSE (legacy fallback):
 *   GET    /mcp/sse        — Establish SSE connection
 *   POST   /mcp/messages   — Send MCP messages (requires sessionId query param)
 */

const express = require("express");
const { randomUUID } = require("crypto");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StreamableHTTPServerTransport,
} = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const {
  SSEServerTransport,
} = require("@modelcontextprotocol/sdk/server/sse.js");
const { isInitializeRequest } = require("@modelcontextprotocol/sdk/types.js");
const { z } = require("zod");
const logger = require("../common/logger");
const { filterTools } = require("../common/tool-filters");

/**
 * Convert a JSON Schema object (from upstream /api/mcp-tools) to a Zod schema
 * so that McpServer.tool() accepts it.
 */
function jsonSchemaToZod(inputSchema) {
  if (!inputSchema || !inputSchema.properties) {
    return z.object({});
  }
  const required = Array.isArray(inputSchema.required)
    ? inputSchema.required
    : [];
  const shape = {};
  for (const [key, prop] of Object.entries(inputSchema.properties)) {
    let zodType;
    switch (prop.type) {
      case "integer":
      case "number":
        zodType = z.number();
        break;
      case "boolean":
        zodType = z.boolean();
        break;
      case "array":
        zodType = z.array(z.any());
        break;
      case "object":
        zodType = z.record(z.any());
        break;
      default:
        zodType = z.string();
    }
    if (prop.description) {
      zodType = zodType.describe(prop.description);
    }
    if (!required.includes(key)) {
      zodType = zodType.optional();
    }
    shape[key] = zodType;
  }
  return z.object(shape);
}

const router = express.Router();

// Session stores (separate per transport type)
const streamableSessions = {};
const sseSessions = new Map();

// ---------------------------------------------------------------------------
// Connection attempt logging — captures every external MCP request
// ---------------------------------------------------------------------------
router.use((req, res, next) => {
  const ts = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip =
    req.headers["x-forwarded-for"] || req.ip || req.connection?.remoteAddress;
  const userAgent = req.headers["user-agent"] || "unknown";
  const hasAuth = !!req.headers["authorization"];
  const authPrefix = hasAuth
    ? req.headers["authorization"].substring(0, 30) + "..."
    : "none";
  const sessionId = req.headers["mcp-session-id"] || "none";

  logger.info("[MCP-Connect] Incoming request", {
    ts,
    method,
    url,
    ip,
    userAgent,
    hasAuth,
    authPrefix,
    sessionId,
  });

  // Track response for logging outcome
  const origEnd = res.end;
  res.end = function (...args) {
    logger.info("[MCP-Connect] Response sent", {
      ts,
      method,
      url,
      ip,
      statusCode: res.statusCode,
      hasAuth,
      sessionId,
      success: res.statusCode < 400,
    });
    origEnd.apply(res, args);
  };

  next();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeRoles(roles) {
  if (!roles) return [];
  if (Array.isArray(roles))
    return roles.map((r) => String(r).toLowerCase()).filter(Boolean);
  return [String(roles).toLowerCase()].filter(Boolean);
}

function canRegisterTool(tool, userRoles) {
  const required = normalizeRoles(tool.requiredRoles);
  if (required.length === 0) return true;
  if (!userRoles || userRoles.length === 0) return true;
  return required.some((r) => userRoles.includes(r));
}

/**
 * Create an McpServer instance with all aggregated tools registered.
 */
function createMcpServer(req) {
  const mcpManager = req.app.get("mcpManager");
  const rawTools = mcpManager ? mcpManager.getAllTools() : [];
  const userRoles = normalizeRoles(req.user?.roleId);

  const {
    tools: allTools,
    autoFilteredServices,
    fetchListCount,
  } = filterTools(rawTools);
  if (fetchListCount > 0) {
    logger.info(
      `[MCP-Server] Filtered out ${fetchListCount} _fetch*List tools`,
    );
  }
  if (autoFilteredServices.length > 0) {
    logger.info(
      `[MCP-Server] Auto-filtered services (tool cap): ${autoFilteredServices.map((s) => s.service).join(", ")}`,
    );
  }

  const server = new McpServer(
    {
      name: "lrmwufitcheck-mcpbff",
      version: "1.0.0",
    },
    {
      capabilities: { tools: { listChanged: true } },
    },
  );

  for (const tool of allTools) {
    if (!canRegisterTool(tool, userRoles)) continue;

    const zodSchema = jsonSchemaToZod(tool.inputSchema);

    server.tool(
      tool.name,
      tool.description || tool.name,
      zodSchema,
      async (args) => {
        const context = {
          accessToken: req.accessToken,
        };

        try {
          const result = await mcpManager.callTool(tool.name, args, context);
          const content = result?.result?.content;
          if (Array.isArray(content)) return { content };
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result?.result ?? result, null, 2),
              },
            ],
          };
        } catch (err) {
          return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true,
          };
        }
      },
    );
  }

  return server;
}

// ---------------------------------------------------------------------------
// StreamableHTTP routes (primary)
// ---------------------------------------------------------------------------

/**
 * POST /mcp — StreamableHTTP init + messages
 */
router.post("/", express.json({ limit: "50mb" }), async (req, res) => {
  const sessionIdHeader = req.headers["mcp-session-id"];
  let entry = null;

  try {
    if (sessionIdHeader && streamableSessions[sessionIdHeader]) {
      logger.info("[MCP-Server] StreamableHTTP message on existing session", {
        sessionId: sessionIdHeader,
      });
      entry = streamableSessions[sessionIdHeader];
      entry.latestHeaders = { ...req.headers };
    } else if (!sessionIdHeader && isInitializeRequest(req.body)) {
      logger.info("[MCP-Server] New StreamableHTTP session initialization", {
        user: req.user?.userId || "unknown",
        method: req.body?.method,
        ip: req.headers["x-forwarded-for"] || req.ip,
        userAgent: req.headers["user-agent"],
      });

      const newSessionId = randomUUID();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (sid) => {
          logger.info(
            `[MCP-Server] StreamableHTTP session ${sid} initialized successfully`,
          );
        },
      });

      transport.onclose = () => {
        if (transport.sessionId && streamableSessions[transport.sessionId]) {
          logger.info(
            `[MCP-Server] Cleaning up StreamableHTTP session ${transport.sessionId}`,
          );
          const s = streamableSessions[transport.sessionId];
          if (s.server) s.server = null;
          if (s.transport) s.transport = null;
          delete streamableSessions[transport.sessionId];
        }
      };

      const server = createMcpServer(req);
      await server.connect(transport);

      streamableSessions[newSessionId] = {
        server,
        transport,
        latestHeaders: { ...req.headers },
      };
      entry = streamableSessions[newSessionId];
      logger.info("[MCP-Server] StreamableHTTP session ready", {
        sessionId: newSessionId,
      });
    } else {
      logger.warn(
        "[MCP-Server] Bad StreamableHTTP request — no session ID and not an init request",
        {
          hasSessionHeader: !!sessionIdHeader,
          bodyMethod: req.body?.method,
          bodyJsonrpc: req.body?.jsonrpc,
          contentType: req.headers["content-type"],
          ip: req.headers["x-forwarded-for"] || req.ip,
          userAgent: req.headers["user-agent"],
        },
      );
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
    }

    await entry.transport.handleRequest(req, res, req.body);
  } catch (err) {
    logger.error("[MCP-Server] StreamableHTTP POST error", {
      error: err.message,
      stack: err.stack?.substring(0, 500),
      sessionId: sessionIdHeader,
      ip: req.headers["x-forwarded-for"] || req.ip,
    });
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: `Internal error: ${err.message}` },
        id: null,
      });
    }
  }
});

/**
 * GET /mcp — StreamableHTTP notifications (when mcp-session-id present), else info
 */
router.get("/", async (req, res) => {
  const sessionIdHeader = req.headers["mcp-session-id"];

  if (sessionIdHeader && streamableSessions[sessionIdHeader]) {
    const { transport } = streamableSessions[sessionIdHeader];
    await transport.handleRequest(req, res);
    return;
  }

  if (sessionIdHeader) {
    return res.status(400).json({ error: "Invalid or missing session ID" });
  }

  // Info endpoint
  const mcpManager = req.app.get("mcpManager");
  const rawTools = mcpManager ? mcpManager.getAllTools() : [];
  const {
    tools: filtered,
    autoFilteredServices: infoAutoFiltered,
    fetchListCount: infoFetchCount,
  } = filterTools(rawTools);

  res.json({
    name: "lrmwufitcheck MCP-BFF Unified Server",
    version: "1.0.0",
    transports: {
      streamableHttp: {
        description: "Primary transport for modern MCP clients",
        endpoint: "POST /mcp",
      },
      sse: {
        description: "Legacy fallback transport",
        connect: "GET /mcp/sse",
        messages: "POST /mcp/messages?sessionId=<id>",
      },
    },
    toolCount: filtered.length,
    totalBeforeFiltering: rawTools.length,
    fetchListToolsRemoved: infoFetchCount,
    autoFilteredServices: infoAutoFiltered,
    activeSessions: {
      streamableHttp: Object.keys(streamableSessions).length,
      sse: sseSessions.size,
    },
  });
});

/**
 * DELETE /mcp — StreamableHTTP session termination
 */
router.delete("/", async (req, res) => {
  const sessionIdHeader = req.headers["mcp-session-id"];
  if (!sessionIdHeader || !streamableSessions[sessionIdHeader]) {
    return res.status(400).json({ error: "Invalid or missing session ID" });
  }
  const { transport } = streamableSessions[sessionIdHeader];
  await transport.handleRequest(req, res);
});

// ---------------------------------------------------------------------------
// SSE routes (legacy fallback)
// ---------------------------------------------------------------------------

/**
 * GET /mcp/sse — Establish SSE connection
 */
router.get("/sse", async (req, res) => {
  logger.info("[MCP-Server] New SSE connection request", {
    user: req.user?.userId || "unknown",
    ip: req.headers["x-forwarded-for"] || req.ip,
    userAgent: req.headers["user-agent"],
  });

  try {
    const transport = new SSEServerTransport("/mcpbff-api/mcp/messages", res);
    const server = createMcpServer(req);

    sseSessions.set(transport.sessionId, { transport, server });
    logger.info(`[MCP-Server] SSE session created successfully`, {
      sessionId: transport.sessionId,
    });

    await server.connect(transport);

    const heartbeat = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 30000);

    req.on("close", () => {
      logger.info(`[MCP-Server] SSE session closed`, {
        sessionId: transport.sessionId,
      });
      clearInterval(heartbeat);
      sseSessions.delete(transport.sessionId);
    });
  } catch (error) {
    logger.error("[MCP-Server] SSE connection error", {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      ip: req.headers["x-forwarded-for"] || req.ip,
    });
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to establish SSE connection" });
    }
  }
});

/**
 * POST /mcp/messages — Handle MCP messages for SSE sessions
 */
router.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId query parameter" });
  }

  const entry = sseSessions.get(sessionId);
  if (!entry) {
    return res.status(404).json({ error: `Session not found: ${sessionId}` });
  }

  try {
    await entry.transport.handlePostMessage(req, res);
  } catch (error) {
    logger.error(
      `[MCP-Server] SSE message error for session ${sessionId}:`,
      error,
    );
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process message" });
    }
  }
});

module.exports = router;
