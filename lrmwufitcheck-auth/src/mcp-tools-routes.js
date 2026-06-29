const express = require("express");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const router = express.Router();

const ROLES_MARKER_RE = /\s*\[MBX_REQUIRED_ROLES:[^\]]*\]\s*$/i;

function collectAllTools(headers) {
  const mcpExports = require("mcpLayer")(headers);
  const {
    userMcpRouter,
    userAvatarsFileMcpRouter,
    getLoginRouter,
    getVerificationServicesRouter,
  } = mcpExports;

  const allTools = [];
  const seen = new Set();

  const addTool = (t) => {
    if (t && t.name && t.controller && !seen.has(t.name)) {
      seen.add(t.name);
      allTools.push(t);
    }
  };

  (userMcpRouter || []).forEach(addTool);
  (userAvatarsFileMcpRouter || []).forEach(addTool);

  const sessionToolList = getLoginRouter(headers);
  (sessionToolList || []).forEach(addTool);
  const verificationToolList = getVerificationServicesRouter(headers);
  (verificationToolList || []).forEach(addTool);

  return allTools;
}

function safeZodToJsonSchema(params) {
  try {
    return zodToJsonSchema(z.object(params || {}));
  } catch (err) {
    console.warn("[mcp-tools-routes] Schema conversion failed:", err.message);
    return { type: "object", properties: {} };
  }
}

router.get("/", (req, res) => {
  try {
    const tools = collectAllTools(req.headers);
    const toolList = tools.map((t) => ({
      name: t.name,
      description: (t.description || "").replace(ROLES_MARKER_RE, "").trim(),
      inputSchema: safeZodToJsonSchema(t.parameters),
      requiredRoles: t.requiredRoles || [],
    }));
    res.json({ tools: toolList });
  } catch (err) {
    console.error("[mcp-tools-routes] Error listing tools:", err);
    res
      .status(500)
      .json({ error: "Failed to list tools", message: err.message });
  }
});

router.post("/call", async (req, res) => {
  try {
    const { name, arguments: args } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: "Missing required field: name" });
    }

    const tools = collectAllTools(req.headers);
    const tool = tools.find((t) => t.name === name);
    if (!tool) {
      return res
        .status(404)
        .json({
          isError: true,
          content: [{ type: "text", text: `Tool not found: ${name}` }],
        });
    }

    const result = await tool.controller(args || {});
    res.json(result);
  } catch (err) {
    console.error("[mcp-tools-routes] Error calling tool:", err);
    res.status(500).json({
      isError: true,
      content: [{ type: "text", text: `Error: ${err.message}` }],
    });
  }
});

module.exports = router;
