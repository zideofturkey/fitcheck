const app = require("./express-app");

const { randomUUID } = require("crypto");
const {
  McpServer,
  ResourceTemplate,
} = require("@modelcontextprotocol/sdk/server/mcp.js");

const {
  StreamableHTTPServerTransport,
} = require("@modelcontextprotocol/sdk/server/streamableHttp.js");

const { isInitializeRequest } = require("@modelcontextprotocol/sdk/types.js");

/**
 * In-memory session store:
 *   sessions[sessionId] = {
 *     server:   McpServer instance for this session,
 *     transport: StreamableHTTPServerTransport bound to this session
 *     latestHeader: Request Headers refreshed in each post
 *   }
 */
const sessions = {};
const SESSION_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_CLEANUP_INTERVAL_MS = 60 * 1000; // check every minute

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of Object.entries(sessions)) {
    if (entry._createdAt && now - entry._createdAt > SESSION_MAX_AGE_MS) {
      console.log(`[MCP] Cleaning up expired session ${id.slice(0, 8)}...`);
      try {
        if (entry.transport) entry.transport.close();
      } catch (e) {}
      delete sessions[id];
    }
  }
}, SESSION_CLEANUP_INTERVAL_MS).unref();

const normalizeRoles = (roles) => {
  if (!roles) return [];
  if (Array.isArray(roles)) {
    return roles.map((r) => String(r).toLowerCase()).filter(Boolean);
  }
  return [String(roles).toLowerCase()];
};

const getUserRolesFromRequest = (req) => {
  const roleId =
    req?.body?.params?.session?.roleId ??
    req?.body?.session?.roleId ??
    req?.body?.mcpParams?.session?.roleId ??
    req?.session?.roleId;
  return normalizeRoles(roleId);
};

const canRegisterToolByRole = (tool, userRoles) => {
  const requiredRoles = normalizeRoles(tool?.requiredRoles);
  if (requiredRoles.length === 0) return true;
  // Service-to-service MCP clients (like mcp-bff startup discovery) may not provide
  // role context during initialize. In that case, do not hide tools at registration.
  // Role checks are still enforced at request execution level by API managers.
  if (!userRoles || userRoles.length === 0) return true;
  return requiredRoles.some((role) => userRoles.includes(role));
};

/**
 * Synthetic MCP handshake for auto-session-recovery.
 * When a non-initialize request arrives with an unknown session ID (e.g. the
 * session was created on a different pod), we create a fresh session and drive
 * the initialize handshake internally so the actual request can be handled
 * immediately — zero extra round-trips, fully transparent to any MCP client.
 */
const { PassThrough } = require("stream");

function _createMockRes() {
  const stream = new PassThrough();
  stream.setHeader = function () {
    return this;
  };
  stream.getHeader = function () {
    return undefined;
  };
  stream.writeHead = function (code) {
    this.statusCode = code;
    this.headersSent = true;
    return this;
  };
  stream.statusCode = 200;
  stream.headersSent = false;
  return stream;
}

async function _autoInitializeSession(transport, sessionId) {
  const initBody = {
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "auto-session-recovery", version: "1.0.0" },
    },
    id: "_auto_" + Date.now(),
  };
  await transport.handleRequest(
    { method: "POST", headers: { "content-type": "application/json" } },
    _createMockRes(),
    initBody,
  );

  const notifBody = { jsonrpc: "2.0", method: "notifications/initialized" };
  await transport.handleRequest(
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "mcp-session-id": sessionId,
      },
    },
    _createMockRes(),
    notifBody,
  );
}

app.post("/mcp", async (req, res) => {
  const sessionIdHeader = req.headers["mcp-session-id"];
  let sessionEntry = null;

  // Fast path: existing session on this pod
  if (sessionIdHeader && sessions[sessionIdHeader]) {
    sessionEntry = sessions[sessionIdHeader];
    sessionEntry.latestHeaders = { ...req.headers };
  } else {
    // Create a new session for ANY request without a valid local session.
    // Handles both: (a) genuine initialize from new clients, and
    // (b) auto-recovery when a request lands on a pod that doesn't hold
    // the session (multi-pod routing, pod restart, session expiry).
    const isAutoRecover = !isInitializeRequest(req.body);

    // JSON-RPC notifications (no `id` field) don't expect a response payload.
    // If one arrives at a pod that doesn't hold the session (e.g. the
    // `initialized` notification during multi-pod connect), just acknowledge
    // it — creating a full session + auto-init for a fire-and-forget message
    // is wasteful and can hang if the mock response doesn't satisfy the SDK.
    if (isAutoRecover && !req.body?.id) {
      res.status(202).end();
      return;
    }

    if (isAutoRecover) {
      console.log(
        `[MCP] Auto-session-recovery: ${sessionIdHeader ? `stale session ${sessionIdHeader.slice(0, 8)}...` : "no session"}, creating new session for ${req.body?.method || "unknown"}`,
      );
    }
    const newSessionId = randomUUID();

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId,
      onsessioninitialized: (sid) => {
        console.log(`Session ${sid} initialized`);
      },
    });

    // When this transport closes, clean up the session entry
    transport.onclose = () => {
      if (transport.sessionId && sessions[transport.sessionId]) {
        console.log(`Cleaning up session ${transport.sessionId}`);
        const session = sessions[transport.sessionId];

        // Clear any references
        if (session.server) {
          session.server = null;
        }
        if (session.transport) {
          session.transport = null;
        }

        delete sessions[transport.sessionId];
      }
    };

    const initialHeaders = { ...req.headers };

    // Create server but don't register tools yet
    const server = new McpServer({
      name: process.env.PROJECT_NAME + "-mcp-server",
      version: "1.0.0",
      capabilities: {
        tools: { listChanged: true },
      },
    });

    // register mcp routers as tools
    const mcpExports = require("mcpLayer")(initialHeaders);
    const userRoles = getUserRolesFromRequest(req);
    const {
      // nutritionlibrary Database Crud Object Mcp Routers
      macroTargetMcpRouter,
      foodItemMcpRouter,
      presetMealMcpRouter,
      presetLineMcpRouter,
      getSessionRouter,
    } = mcpExports;

    const sessionRouter = getSessionRouter(initialHeaders);

    macroTargetMcpRouter
      .filter((mcpTool) => canRegisterToolByRole(mcpTool, userRoles))
      .forEach((mcpTool) =>
        server.tool(
          mcpTool.name,
          mcpTool.description,
          mcpTool.parameters,
          mcpTool.controller,
        ),
      );
    foodItemMcpRouter
      .filter((mcpTool) => canRegisterToolByRole(mcpTool, userRoles))
      .forEach((mcpTool) =>
        server.tool(
          mcpTool.name,
          mcpTool.description,
          mcpTool.parameters,
          mcpTool.controller,
        ),
      );
    presetMealMcpRouter
      .filter((mcpTool) => canRegisterToolByRole(mcpTool, userRoles))
      .forEach((mcpTool) =>
        server.tool(
          mcpTool.name,
          mcpTool.description,
          mcpTool.parameters,
          mcpTool.controller,
        ),
      );
    presetLineMcpRouter
      .filter((mcpTool) => canRegisterToolByRole(mcpTool, userRoles))
      .forEach((mcpTool) =>
        server.tool(
          mcpTool.name,
          mcpTool.description,
          mcpTool.parameters,
          mcpTool.controller,
        ),
      );

    // register session routes
    sessionRouter.forEach((mcpTool) =>
      server.tool(
        mcpTool.name,
        mcpTool.description,
        mcpTool.parameters,
        mcpTool.controller,
      ),
    );

    // Connect first
    await server.connect(transport);

    // After `onsessioninitialized` fires, `sessions[newSessionId]` is set.
    // But we can also assign it here for immediate access.
    sessions[newSessionId] = {
      server,
      transport,
      latestHeaders: initialHeaders,
      _createdAt: Date.now(),
    };
    sessionEntry = sessions[newSessionId];

    if (isAutoRecover) {
      await _autoInitializeSession(transport, newSessionId);
      req.headers["mcp-session-id"] = newSessionId;
    }
  }

  // Forward the request to the transport of the retrieved/created session
  await sessionEntry.transport.handleRequest(req, res, req.body);
});

/**
 * Handler for GET/DELETE /mcp:
 *   Used for server-to-client notifications (SSE) and session termination.
 */
async function handleSessionRequest(req, res) {
  const sessionIdHeader = req.headers["mcp-session-id"];
  if (!sessionIdHeader || !sessions[sessionIdHeader]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  const { transport } = sessions[sessionIdHeader];
  await transport.handleRequest(req, res);
}

app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);

module.exports = sessions;
