/**
 * MCP Client Manager
 *
 * Manages connections to multiple upstream services and provides
 * a unified interface for tool discovery and invocation.
 *
 * Uses plain REST calls to upstream /api/mcp-tools endpoints —
 * completely stateless, no MCP sessions, no reconnect logic needed.
 */

const logger = require("./common/logger");

const REQUIRED_ROLES_MARKER_REGEX = /\s*\[MBX_REQUIRED_ROLES:([^\]]*)\]\s*$/i;

function parseToolRoleMetadata(tool = {}) {
  const rawDescription = String(tool.description || "");
  const match = rawDescription.match(REQUIRED_ROLES_MARKER_REGEX);
  if (!match) {
    return {
      description: rawDescription,
      requiredRoles: tool.requiredRoles || [],
    };
  }
  const requiredRoles = match[1]
    .split("|")
    .map((role) => String(role || "").trim())
    .filter(Boolean);

  return {
    description: rawDescription.replace(REQUIRED_ROLES_MARKER_REGEX, "").trim(),
    requiredRoles,
  };
}

/**
 * REST Service Client — stateless HTTP client for a single upstream service.
 * Replaces the former MCP SDK client (McpSdkClient) with simple fetch calls.
 */
class RestServiceClient {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.tools = [];
    this._lastListToolsLive = false;
  }

  async listTools() {
    const url = `${this.baseUrl}/api/mcp-tools`;
    logger.debug(`[${this.name}] GET ${url}`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }
      const data = await res.json();
      this.tools = data.tools || [];
      this._lastListToolsLive = true;
      logger.info(`[${this.name}] Discovered ${this.tools.length} tools`);
      if (this.tools.length > 0) {
        logger.debug(
          `[${this.name}] Tool names: ${this.tools.map((t) => t.name).join(", ")}`,
        );
      }
      return this.tools;
    } catch (err) {
      logger.error(`[${this.name}] Error listing tools: ${err.message}`);
      this._lastListToolsLive = false;
      return this.tools;
    }
  }

  async callTool(toolName, args = {}, headers = {}) {
    const url = `${this.baseUrl}/api/mcp-tools/call`;
    const reqHeaders = {
      "Content-Type": "application/json",
    };
    if (headers.authorization)
      reqHeaders["authorization"] = headers.authorization;
    if (headers["authorization"])
      reqHeaders["authorization"] = headers["authorization"];

    logger.debug(`[${this.name}] POST ${url} tool=${toolName}`);
    const res = await fetch(url, {
      method: "POST",
      headers: reqHeaders,
      body: JSON.stringify({ name: toolName, arguments: args }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `${this.name}: tool call failed (HTTP ${res.status}): ${body.slice(0, 300)}`,
      );
    }
    return await res.json();
  }
}

/**
 * MCP Client Manager — orchestrates multiple REST service clients.
 */
class McpClientManager {
  constructor(endpoints) {
    this.endpoints = endpoints;
    this.clients = new Map();
    this.toolRegistry = new Map();
    this._refreshLock = null;
    this._lastRefresh = null;
    this._refreshSeq = 0;
    this._serviceStatus = {};
  }

  async connectAll() {
    for (const [serviceName, url] of Object.entries(this.endpoints)) {
      const client = new RestServiceClient(serviceName, url);
      this.clients.set(serviceName, client);
      this._serviceStatus[serviceName] = {
        toolSource: "pending",
        lastError: null,
        lastFetchAt: null,
      };
    }

    await this.refreshToolRegistry();
  }

  async refreshToolRegistry() {
    if (this._refreshLock) {
      logger.debug(
        "[McpManager] refreshToolRegistry already running, waiting...",
      );
      return this._refreshLock;
    }
    this._refreshLock = this._doRefreshToolRegistry();
    try {
      return await this._refreshLock;
    } finally {
      this._refreshLock = null;
    }
  }

  async _doRefreshToolRegistry() {
    const seq = ++this._refreshSeq;
    const startMs = Date.now();
    logger.info(`[McpManager] Registry refresh #${seq} starting`);

    const newRegistry = new Map();
    const perService = {};

    const fetchPromises = [...this.clients.entries()].map(
      async ([serviceName, client]) => {
        let tools = [];
        let toolSource = "none";
        let fetchError = null;

        try {
          tools = await client.listTools();
          toolSource = client._lastListToolsLive
            ? "live"
            : tools.length > 0
              ? "cached"
              : "none";
        } catch (err) {
          fetchError = err.message;
          tools = client.tools;
          toolSource = tools.length > 0 ? "cached" : "none";
        }

        return { serviceName, client, tools, toolSource, fetchError };
      },
    );

    const results = await Promise.all(fetchPromises);

    for (const {
      serviceName,
      client,
      tools,
      toolSource,
      fetchError,
    } of results) {
      const statusEntry = {
        toolSource,
        toolCount: tools.length,
        lastError:
          fetchError || this._serviceStatus[serviceName]?.lastError || null,
        lastFetchAt: new Date().toISOString(),
      };
      perService[serviceName] = statusEntry;
      this._serviceStatus[serviceName] = statusEntry;

      if (toolSource === "none") {
        logger.warn(`[McpManager] #${seq} ${serviceName}: no tools available`);
        continue;
      }

      logger.info(
        `[McpManager] #${seq} ${serviceName}: ${tools.length} tools [${toolSource}]`,
      );

      for (const tool of tools) {
        const roleMeta = parseToolRoleMetadata(tool);
        const normalizedTool = {
          ...tool,
          description: roleMeta.description,
          requiredRoles: roleMeta.requiredRoles,
        };
        const fullToolName = `${serviceName}:${tool.name}`;
        newRegistry.set(fullToolName, {
          service: serviceName,
          tool: normalizedTool,
          client: client,
        });
        if (!newRegistry.has(tool.name)) {
          newRegistry.set(tool.name, {
            service: serviceName,
            tool: normalizedTool,
            client: client,
          });
        }
      }
    }

    this.toolRegistry = newRegistry;
    this._lastRefresh = new Date().toISOString();

    const elapsedMs = Date.now() - startMs;
    logger.info(
      `[McpManager] Registry refresh #${seq} done in ${elapsedMs}ms — ${newRegistry.size} entries`,
    );

    return perService;
  }

  getAllTools() {
    const tools = [];
    const seen = new Set();

    for (const [name, entry] of this.toolRegistry) {
      if (!name.includes(":") && !seen.has(entry.tool.name)) {
        seen.add(entry.tool.name);
        tools.push({
          name: entry.tool.name,
          service: entry.service,
          description: entry.tool.description,
          inputSchema: entry.tool.inputSchema,
          requiredRoles: entry.tool.requiredRoles || [],
        });
      }
    }

    return tools;
  }

  getToolsByService(serviceName) {
    const tools = [];
    for (const [name, entry] of this.toolRegistry) {
      if (!name.includes(":") && entry.service === serviceName) {
        tools.push({
          name: entry.tool.name,
          description: entry.tool.description,
          inputSchema: entry.tool.inputSchema,
          requiredRoles: entry.tool.requiredRoles || [],
        });
      }
    }
    return tools;
  }

  async callTool(toolName, args = {}, context = {}) {
    let entry = this.toolRegistry.get(toolName);

    if (!entry) {
      for (const [name, e] of this.toolRegistry) {
        if (name.endsWith(`:${toolName}`)) {
          entry = e;
          break;
        }
      }
    }

    if (!entry) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const resolvedTenantCodename = context.tenantCodename;

    const enrichedArgs = {
      ...args,
      accessToken: context.accessToken,
    };

    const forwardHeaders = {};
    if (context.accessToken) {
      forwardHeaders["authorization"] = `Bearer ${context.accessToken}`;
    }

    logger.info(`Calling tool ${toolName} on ${entry.service}`);
    logger.debug(`[REST] Tool args:`, {
      hasAccessToken: !!enrichedArgs.accessToken,
      accessTokenPrefix: enrichedArgs.accessToken
        ? enrichedArgs.accessToken.substring(0, 20) + "..."
        : "none",
      argsKeys: Object.keys(enrichedArgs),
    });

    try {
      const result = await entry.client.callTool(
        entry.tool.name,
        enrichedArgs,
        forwardHeaders,
      );
      return {
        success: true,
        service: entry.service,
        tool: toolName,
        result: result,
      };
    } catch (error) {
      logger.error(`Tool call failed: ${toolName}`, error);
      return {
        success: false,
        service: entry.service,
        tool: toolName,
        error: error.message,
      };
    }
  }

  async disconnectAll() {
    this.clients.clear();
    this.toolRegistry = new Map();
  }

  async reconnectDisconnected() {
    // REST is stateless — no persistent connections to restore.
    // The next refreshToolRegistry() call will re-fetch tools from all services.
    return false;
  }

  getConnectionStatus() {
    const status = {};
    for (const [name, client] of this.clients) {
      const svcDiag = this._serviceStatus[name] || {};
      status[name] = {
        connected: svcDiag.toolSource === "live",
        toolCount: client.tools.length,
        registryToolCount: this._getRegistryCountForService(name),
        toolSource: svcDiag.toolSource || "unknown",
        lastError: svcDiag.lastError || null,
        lastFetchAt: svcDiag.lastFetchAt || null,
        url: client.baseUrl,
      };
    }
    return status;
  }

  _getRegistryCountForService(serviceName) {
    let count = 0;
    for (const [name, entry] of this.toolRegistry) {
      if (!name.includes(":") && entry.service === serviceName) count++;
    }
    return count;
  }

  getRegistryDiagnostics() {
    return {
      lastRefresh: this._lastRefresh,
      refreshSeq: this._refreshSeq,
      registrySize: this.toolRegistry.size,
      isRefreshing: !!this._refreshLock,
      services: { ...this._serviceStatus },
    };
  }

  startHealthCheck(intervalMs = 30000) {
    if (this.healthCheckInterval) {
      return;
    }

    logger.info(
      `[McpManager] Starting health check (interval: ${intervalMs}ms)`,
    );

    this.healthCheckInterval = setInterval(async () => {
      await this.refreshToolRegistry();
    }, intervalMs);
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      logger.info("[McpManager] Health check stopped");
    }
  }
}

module.exports = { McpClientManager, RestServiceClient };
