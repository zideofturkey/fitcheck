/**
 * AI Service
 *
 * Provides AI chat capabilities using OpenAI or Anthropic APIs.
 * Supports tool calling to interact with MCP backend services.
 * Includes Mindbricks documentation search capability.
 */

const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const axios = require("axios");
const logger = require("../common/logger");
const uuidAliasRegistry = require("./uuid-alias-registry");

// Mindbricks Documentation MCP Server
const DOCS_MCP_URL = "https://docs.mindbricks.com/_mcp";
const UUID_ALIAS_ENABLED = process.env.UUID_ALIAS_ENABLED !== "false";

// AI Configuration
const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || "auto", // 'openai', 'anthropic', or 'auto'
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  model: {
    openai: process.env.OPENAI_MODEL || "gpt-4o",
    anthropic: process.env.ANTHROPIC_MODEL || "claude-opus-4-6",
  },
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || "4096", 10),
  temperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
};

// Log AI configuration at startup
logger.info("═══════════════════════════════════════════════════════════");
logger.info("[AI SERVICE] Initializing AI Service...");
logger.info(
  `[AI SERVICE] AI_PROVIDER env: "${process.env.AI_PROVIDER || "(not set, defaulting to auto)"}"`,
);
logger.info(
  `[AI SERVICE] OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? `configured (${process.env.OPENAI_API_KEY.substring(0, 7)}...)` : "NOT SET"}`,
);
logger.info(
  `[AI SERVICE] ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? `configured (${process.env.ANTHROPIC_API_KEY.substring(0, 7)}...)` : "NOT SET"}`,
);
logger.info(`[AI SERVICE] Config provider setting: ${AI_CONFIG.provider}`);
logger.info(
  `[AI SERVICE] OpenAI key in config: ${AI_CONFIG.openaiApiKey ? "YES" : "NO"}`,
);
logger.info(
  `[AI SERVICE] Anthropic key in config: ${AI_CONFIG.anthropicApiKey ? "YES" : "NO"}`,
);

// Determine active provider immediately for logging
const initialProvider = (() => {
  const { provider, openaiApiKey, anthropicApiKey } = AI_CONFIG;
  if (provider === "anthropic" && anthropicApiKey) return "anthropic";
  if (provider === "openai" && openaiApiKey) return "openai";
  if (provider === "auto") {
    if (anthropicApiKey) return "anthropic";
    if (openaiApiKey) return "openai";
  }
  return null;
})();

if (initialProvider) {
  logger.info(`[AI SERVICE] ✓ Active provider: ${initialProvider}`);
  logger.info(`[AI SERVICE] ✓ Model: ${AI_CONFIG.model[initialProvider]}`);
} else {
  logger.warn("[AI SERVICE] ✗ No AI provider configured!");
  logger.warn(
    "[AI SERVICE] Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.local",
  );
}
logger.info("═══════════════════════════════════════════════════════════");

function getSystemPrompt(userContext = {}) {
  const tenantCodename = userContext?.tenantCodename || "root";

  const tenantId = userContext?.tenantId || null;
  const tenantScopeSection = "";

  return `You are an expert AI assistant for **FitCheck**, a backend application built with **Mindbricks**.

## About This Application

FitCheck is a private, invite-only nutrition and meal tracking web application designed for individual users who want to manage their daily nutrition intake in a secure, personal environment. Users can log meals through multiple methods—food library, preset templates, manual entry, or AI-assisted parsing—track daily progress against personalized macro targets, and gain insights through weekly and monthly analytics. The platform includes an integrated AI assistant that parses natural-language meal descriptions and provides context-aware nutrition guidance, all while maintaining strict data isolation and privacy for each user.

This application was built using **Mindbricks**, a pattern-based code generation platform that creates production-ready backend services. The application includes:
- **6 Service(s)** with **18 Data Object(s)**
- Full CRUD operations on all data objects
- Search and filtering capabilities
- Business logic and validation

## Available Services

- **auth**: Authentication service for the project (Data: user, userAvatarsFile)
- **invitationCenter**: Manages invite-only onboarding links for platform operators, including creation, activation, delivery, validation, and audit tracking of unique registration invite tokens. (Data: inviteLink, inviteAudit)
- **nutritionLibrary**: Manages each user&#39;s private macro targets, personal food library, and reusable preset meal templates with auto-calculated nutrition totals. (Data: macroTarget, foodItem, presetMeal, presetLine)
- **mealTracker**: Creates and manages user meal logs from multiple sources, calculates per-item and meal-level nutrition totals, stores immutable daily consumption snapshots, and exposes daily progress, weekly, and monthly analytics APIs. (Data: mealLog, mealLine, nutritionDay)
- **nutritionAi**: Processes natural-language Turkish meal descriptions into structured nutrition intents, answers personalized nutrition questions with live meal-log and macro-target context, and maintains operational traceability for all AI parsing and guidance interactions. (Data: aiSession, aiCandidateMeal, aiCandidateLine, aiGuidanceNote)
- **agentHub**: AI Agent Hub (Data: sys_agentOverride, sys_agentExecution, sys_toolCatalog)

${tenantScopeSection}

## Your Capabilities

You can help users by:
1. **Querying data** - Search, filter, list, and retrieve records
2. **Creating records** - Add new data with proper validation
3. **Updating records** - Modify existing data
4. **Deleting records** - Remove data (with confirmation)
5. **Searching documentation** - Find information about Mindbricks patterns and APIs

## Tool Usage Guidelines

1. **Understand first** - Use list/get tools to understand current data before making changes
2. **Preserve data integrity** - When updating, only modify the fields that need to change
3. **Confirm destructive actions** - Always confirm with the user before deleting
4. **Handle errors gracefully** - If a tool fails, explain the error and suggest alternatives
5. **Search documentation** - When you need information about Mindbricks patterns or best practices

${
  UUID_ALIAS_ENABLED
    ? `## ID Alias Usage (Important)

- Tools may document ID fields as UUID strings, but you can use readable aliases as well.
- Alias examples: \`customer_001\`, \`ticketType_003\`, \`customer_xcorp\`.
- The backend resolves aliases to real UUIDs before tool execution.
- Tool results may return aliases instead of raw UUIDs to improve readability.
- Prefer aliases shown in prior tool results; if an alias is unknown, fetch/list records first and reuse returned IDs/aliases.`
    : ""
}

## Response Format

- Be concise but thorough
- Use markdown for formatting (tables, lists, code blocks)
- When showing data, present it in a readable format
- For large result sets, summarize and offer to show more
- Include relevant IDs when showing records (useful for follow-up actions)

## Important Notes

- User permissions are enforced by the backend - tools will only access what the user is allowed to see
- All operations are logged and auditable
- The user's access token is automatically included in tool calls
- Tenant context (codename/id) is included in tool calls for multi-tenant routing

You are knowledgeable, efficient, and focused on helping users accomplish their goals.`;
}

// Clients (lazy initialized)
let openaiClient = null;
let anthropicClient = null;

/**
 * Get the active AI provider based on configuration
 */
function getActiveProvider() {
  const { provider, openaiApiKey, anthropicApiKey } = AI_CONFIG;

  if (provider === "anthropic" && anthropicApiKey) {
    return "anthropic";
  }
  if (provider === "openai" && openaiApiKey) {
    return "openai";
  }

  // Auto-detect: prefer Anthropic if both are available
  if (provider === "auto") {
    if (anthropicApiKey) return "anthropic";
    if (openaiApiKey) return "openai";
  }

  return null;
}

/**
 * Initialize OpenAI client
 */
function getOpenAIClient() {
  if (!openaiClient && AI_CONFIG.openaiApiKey) {
    openaiClient = new OpenAI({
      apiKey: AI_CONFIG.openaiApiKey,
    });
  }
  return openaiClient;
}

/**
 * Initialize Anthropic client
 */
function getAnthropicClient() {
  if (!anthropicClient && AI_CONFIG.anthropicApiKey) {
    anthropicClient = new Anthropic({
      apiKey: AI_CONFIG.anthropicApiKey,
    });
  }
  return anthropicClient;
}

/**
 * Convert MCP tools to OpenAI function format
 */
function isIdentifierLikeField(fieldName = "") {
  const k = String(fieldName || "").toLowerCase();
  return (
    k === "id" ||
    k === "uuid" ||
    k === "identifier" ||
    /(?:_?id|_?uuid|_?identifier)$/.test(k)
  );
}

function appendAliasGuidance(description = "") {
  const base = String(description || "").trim();
  const aliasNote =
    "ID aliases are supported: you can pass readable aliases (e.g., customer_001 or customer_xcorp) instead of raw UUIDs.";
  if (!base) return aliasNote;
  if (base.toLowerCase().includes("alias")) return base;
  return `${base} ${aliasNote}`;
}

function cloneAndAnnotateSchemaForAliases(schema, parentKey = "") {
  if (!schema || typeof schema !== "object") return schema;
  const cloned = Array.isArray(schema)
    ? schema.map((item) => cloneAndAnnotateSchemaForAliases(item, parentKey))
    : { ...schema };

  if (
    !Array.isArray(cloned) &&
    cloned.properties &&
    typeof cloned.properties === "object"
  ) {
    const updatedProperties = {};
    for (const [propKey, propSchema] of Object.entries(cloned.properties)) {
      const child = cloneAndAnnotateSchemaForAliases(propSchema, propKey);
      if (
        child &&
        typeof child === "object" &&
        !Array.isArray(child) &&
        isIdentifierLikeField(propKey) &&
        (child.type === "string" || !child.type)
      ) {
        updatedProperties[propKey] = {
          ...child,
          description: appendAliasGuidance(child.description || ""),
        };
      } else {
        updatedProperties[propKey] = child;
      }
    }
    cloned.properties = updatedProperties;
  }

  if (!Array.isArray(cloned) && cloned.items) {
    cloned.items = cloneAndAnnotateSchemaForAliases(cloned.items, parentKey);
  }
  if (!Array.isArray(cloned) && Array.isArray(cloned.oneOf)) {
    cloned.oneOf = cloned.oneOf.map((item) =>
      cloneAndAnnotateSchemaForAliases(item, parentKey),
    );
  }
  if (!Array.isArray(cloned) && Array.isArray(cloned.anyOf)) {
    cloned.anyOf = cloned.anyOf.map((item) =>
      cloneAndAnnotateSchemaForAliases(item, parentKey),
    );
  }
  if (!Array.isArray(cloned) && Array.isArray(cloned.allOf)) {
    cloned.allOf = cloned.allOf.map((item) =>
      cloneAndAnnotateSchemaForAliases(item, parentKey),
    );
  }

  return cloned;
}

function enrichToolForAliases(tool) {
  if (!UUID_ALIAS_ENABLED) return tool;
  return {
    ...tool,
    description: appendAliasGuidance(tool.description || `Tool: ${tool.name}`),
    inputSchema: cloneAndAnnotateSchemaForAliases(
      tool.inputSchema || { type: "object", properties: {} },
      tool.name,
    ),
  };
}

function convertToolsToOpenAI(mcpTools) {
  return mcpTools.map((rawTool) => {
    const tool = enrichToolForAliases(rawTool);
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description || `Tool: ${tool.name}`,
        parameters: tool.inputSchema || { type: "object", properties: {} },
      },
    };
  });
}

/**
 * Convert MCP tools to Anthropic tool format
 */
function convertToolsToAnthropic(mcpTools) {
  return mcpTools.map((rawTool) => {
    const tool = enrichToolForAliases(rawTool);
    return {
      name: tool.name,
      description: tool.description || `Tool: ${tool.name}`,
      input_schema: tool.inputSchema || { type: "object", properties: {} },
    };
  });
}

function buildUnknownAliasError(toolName, translationResult) {
  const unknownAliases = translationResult?.unknownAliases || [];
  const knownAliases = translationResult?.knownAliases || [];
  const unknownText = unknownAliases.join(", ");
  const knownText =
    knownAliases.length > 0 ? knownAliases.join(", ") : "(none)";
  const error = new Error(
    `Unknown ID alias in tool args for ${toolName}: ${unknownText}. Known aliases: ${knownText}`,
  );
  error.code = "UNKNOWN_ID_ALIAS";
  error.unknownAliases = unknownAliases;
  error.knownAliases = knownAliases;
  return error;
}

function resolveToolArgsForExecution(toolName, toolArgs, userContext) {
  if (!UUID_ALIAS_ENABLED) {
    return toolArgs;
  }
  const translation = uuidAliasRegistry.resolveAliasesInArgs(
    userContext,
    toolArgs,
  );
  if (!translation.success) {
    throw buildUnknownAliasError(toolName, translation);
  }
  return translation.resolvedArgs;
}

function aliasifyToolResult(result, userContext) {
  if (!UUID_ALIAS_ENABLED) {
    return result;
  }
  return uuidAliasRegistry.replaceUuidsWithAliases(userContext, result);
}

function getAliasMapSummary(userContext) {
  if (!UUID_ALIAS_ENABLED) {
    return { enabled: false, count: 0, samples: [] };
  }
  return {
    enabled: true,
    ...uuidAliasRegistry.getAliasMapSummary(userContext),
  };
}

/**
 * Chat with OpenAI
 */
async function chatWithOpenAI(messages, tools, mcpManager, userContext) {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OpenAI client not configured");
  }

  const systemPrompt = getSystemPrompt(userContext);

  const openaiTools = convertToolsToOpenAI(tools);

  // Convert message history to OpenAI format
  const openaiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
  ];

  let response = await client.chat.completions.create({
    model: AI_CONFIG.model.openai,
    messages: openaiMessages,
    tools: openaiTools.length > 0 ? openaiTools : undefined,
    tool_choice: openaiTools.length > 0 ? "auto" : undefined,
    max_tokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature,
  });

  const toolCalls = [];
  let assistantMessage = response.choices[0].message;

  // Handle tool calls
  while (
    assistantMessage.tool_calls &&
    assistantMessage.tool_calls.length > 0
  ) {
    logger.info(
      `OpenAI requested ${assistantMessage.tool_calls.length} tool calls`,
    );

    // Add assistant message to conversation
    openaiMessages.push(assistantMessage);

    // Process each tool call
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      let toolArgs = {};

      try {
        toolArgs = JSON.parse(toolCall.function.arguments || "{}");
      } catch (e) {
        logger.warn(`Failed to parse tool arguments for ${toolName}:`, e);
      }

      let resolvedToolArgs = toolArgs;
      try {
        resolvedToolArgs = resolveToolArgsForExecution(
          toolName,
          toolArgs,
          userContext,
        );
      } catch (aliasError) {
        logger.warn(
          `Alias resolution failed for ${toolName}: ${aliasError.message}`,
        );
        openaiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: aliasError.message,
            code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
            unknownAliases: aliasError.unknownAliases || [],
            knownAliases: aliasError.knownAliases || [],
          }),
        });
        toolCalls.push({
          tool: toolName,
          args: toolArgs,
          error: aliasError.message,
          code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
        });
        continue;
      }

      logger.info(`Calling tool: ${toolName}`, { args: resolvedToolArgs });

      try {
        const result = await mcpManager.callTool(
          toolName,
          resolvedToolArgs,
          userContext,
        );
        const aliasedResult = aliasifyToolResult(result, userContext);
        toolCalls.push({
          tool: toolName,
          args: resolvedToolArgs,
          result: aliasedResult,
        });

        // Add tool result to conversation
        openaiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(aliasedResult),
        });
      } catch (error) {
        logger.error(`Tool call failed: ${toolName}`, error);
        openaiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: error.message }),
        });
        toolCalls.push({
          tool: toolName,
          args: resolvedToolArgs,
          error: error.message,
        });
      }
    }

    // Get next response
    response = await client.chat.completions.create({
      model: AI_CONFIG.model.openai,
      messages: openaiMessages,
      tools: openaiTools,
      tool_choice: "auto",
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
    });

    assistantMessage = response.choices[0].message;
  }

  return {
    content: assistantMessage.content || "",
    toolCalls,
    usage: response.usage,
    aliasMapSummary: getAliasMapSummary(userContext),
  };
}

/**
 * Chat with Anthropic
 */
async function chatWithAnthropic(messages, tools, mcpManager, userContext) {
  const client = getAnthropicClient();
  if (!client) {
    throw new Error("Anthropic client not configured");
  }

  const systemPrompt = getSystemPrompt(userContext);
  const anthropicTools = convertToolsToAnthropic(tools);

  // Convert message history to Anthropic format
  const anthropicMessages = messages.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));

  let response = await client.messages.create({
    model: AI_CONFIG.model.anthropic,
    max_tokens: AI_CONFIG.maxTokens,
    system: systemPrompt,
    messages: anthropicMessages,
    tools: anthropicTools.length > 0 ? anthropicTools : undefined,
  });

  const toolCalls = [];
  let finalContent = "";

  // Process response and handle tool use
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (block) => block.type === "tool_use",
    );
    const textBlocks = response.content.filter(
      (block) => block.type === "text",
    );

    // Collect any text content
    for (const block of textBlocks) {
      finalContent += block.text;
    }

    logger.info(`Anthropic requested ${toolUseBlocks.length} tool calls`);

    // Add assistant response to messages
    anthropicMessages.push({
      role: "assistant",
      content: response.content,
    });

    // Process tool calls and build results
    const toolResults = [];
    for (const toolBlock of toolUseBlocks) {
      const toolName = toolBlock.name;
      const toolArgs = toolBlock.input || {};
      let resolvedToolArgs = toolArgs;
      try {
        resolvedToolArgs = resolveToolArgsForExecution(
          toolName,
          toolArgs,
          userContext,
        );
      } catch (aliasError) {
        logger.warn(
          `Alias resolution failed for ${toolName}: ${aliasError.message}`,
        );
        toolCalls.push({
          tool: toolName,
          args: toolArgs,
          error: aliasError.message,
          code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolBlock.id,
          content: JSON.stringify({
            error: aliasError.message,
            code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
            unknownAliases: aliasError.unknownAliases || [],
            knownAliases: aliasError.knownAliases || [],
          }),
          is_error: true,
        });
        continue;
      }

      logger.info(`Calling tool: ${toolName}`, { args: resolvedToolArgs });

      try {
        const result = await mcpManager.callTool(
          toolName,
          resolvedToolArgs,
          userContext,
        );
        const aliasedResult = aliasifyToolResult(result, userContext);
        toolCalls.push({
          tool: toolName,
          args: resolvedToolArgs,
          result: aliasedResult,
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolBlock.id,
          content: JSON.stringify(aliasedResult),
        });
      } catch (error) {
        logger.error(`Tool call failed: ${toolName}`, error);
        toolCalls.push({
          tool: toolName,
          args: resolvedToolArgs,
          error: error.message,
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolBlock.id,
          content: JSON.stringify({ error: error.message }),
          is_error: true,
        });
      }
    }

    // Add tool results and get next response
    anthropicMessages.push({
      role: "user",
      content: toolResults,
    });

    response = await client.messages.create({
      model: AI_CONFIG.model.anthropic,
      max_tokens: AI_CONFIG.maxTokens,
      system: systemPrompt,
      messages: anthropicMessages,
      tools: anthropicTools,
    });
  }

  // Extract final text content
  for (const block of response.content) {
    if (block.type === "text") {
      finalContent += block.text;
    }
  }

  return {
    content: finalContent,
    toolCalls,
    usage: response.usage,
    aliasMapSummary: getAliasMapSummary(userContext),
  };
}

/**
 * Main chat function - automatically selects provider
 */
async function chat(messages, mcpTools, mcpManager, userContext) {
  const provider = getActiveProvider();

  if (!provider) {
    throw new Error(
      "No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.",
    );
  }

  logger.info(`Using AI provider: ${provider}`);

  if (provider === "anthropic") {
    return chatWithAnthropic(messages, mcpTools, mcpManager, userContext);
  } else {
    return chatWithOpenAI(messages, mcpTools, mcpManager, userContext);
  }
}

/**
 * Stream chat with Anthropic - yields events for SSE
 */
async function* streamChatWithAnthropic(
  messages,
  tools,
  mcpManager,
  userContext,
  onToolCall,
) {
  const client = getAnthropicClient();
  if (!client) {
    throw new Error("Anthropic client not configured");
  }

  const systemPrompt = getSystemPrompt(userContext);
  const anthropicTools = convertToolsToAnthropic(tools);
  const anthropicMessages = messages.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));

  const toolCalls = [];
  let continueLoop = true;

  while (continueLoop) {
    // Create streaming response
    const stream = await client.messages.stream({
      model: AI_CONFIG.model.anthropic,
      max_tokens: AI_CONFIG.maxTokens,
      system: systemPrompt,
      messages: anthropicMessages,
      tools: anthropicTools.length > 0 ? anthropicTools : undefined,
    });

    let currentToolUse = null;
    let toolInput = "";

    for await (const event of stream) {
      if (event.type === "content_block_start") {
        if (event.content_block.type === "tool_use") {
          currentToolUse = {
            id: event.content_block.id,
            name: event.content_block.name,
          };
          toolInput = "";
          yield { type: "tool_start", tool: currentToolUse.name };
        }
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          yield { type: "text", content: event.delta.text };
        } else if (event.delta.type === "input_json_delta") {
          toolInput += event.delta.partial_json;
        }
      } else if (event.type === "content_block_stop") {
        if (currentToolUse) {
          // Execute the tool
          let toolArgs = {};
          try {
            toolArgs = JSON.parse(toolInput || "{}");
          } catch (e) {
            logger.warn(`Failed to parse tool args: ${e.message}`);
          }

          let resolvedToolArgs = toolArgs;
          try {
            resolvedToolArgs = resolveToolArgsForExecution(
              currentToolUse.name,
              toolArgs,
              userContext,
            );
          } catch (aliasError) {
            toolCalls.push({
              tool: currentToolUse.name,
              args: toolArgs,
              error: aliasError.message,
              code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
            });
            yield {
              type: "tool_result",
              tool: currentToolUse.name,
              error: aliasError.message,
              code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
              unknownAliases: aliasError.unknownAliases || [],
              knownAliases: aliasError.knownAliases || [],
              success: false,
            };
            // Keep Anthropic conversation state consistent: every tool_use must have tool_result.
            anthropicMessages.push({
              role: "assistant",
              content: [
                {
                  type: "tool_use",
                  id: currentToolUse.id,
                  name: currentToolUse.name,
                  input: toolArgs,
                },
              ],
            });
            anthropicMessages.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: currentToolUse.id,
                  content: JSON.stringify({
                    error: aliasError.message,
                    code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
                    unknownAliases: aliasError.unknownAliases || [],
                    knownAliases: aliasError.knownAliases || [],
                  }),
                  is_error: true,
                },
              ],
            });
            currentToolUse = null;
            continue;
          }

          yield {
            type: "tool_executing",
            tool: currentToolUse.name,
            args: resolvedToolArgs,
          };

          try {
            const result = await mcpManager.callTool(
              currentToolUse.name,
              resolvedToolArgs,
              userContext,
            );
            const aliasedResult = aliasifyToolResult(result, userContext);
            toolCalls.push({
              tool: currentToolUse.name,
              args: resolvedToolArgs,
              result: aliasedResult,
            });
            yield {
              type: "tool_result",
              tool: currentToolUse.name,
              result: aliasedResult,
              success: true,
            };

            // Add to conversation for next iteration
            anthropicMessages.push({
              role: "assistant",
              content: [
                {
                  type: "tool_use",
                  id: currentToolUse.id,
                  name: currentToolUse.name,
                  input: toolArgs,
                },
              ],
            });
            anthropicMessages.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: currentToolUse.id,
                  content: JSON.stringify(aliasedResult),
                },
              ],
            });
          } catch (error) {
            toolCalls.push({
              tool: currentToolUse.name,
              args: resolvedToolArgs,
              error: error.message,
            });
            yield {
              type: "tool_result",
              tool: currentToolUse.name,
              error: error.message,
              success: false,
            };
          }

          currentToolUse = null;
        }
      } else if (event.type === "message_stop") {
        // Check if we need to continue (tool use)
        const finalMessage = await stream.finalMessage();
        if (finalMessage.stop_reason !== "tool_use") {
          continueLoop = false;
        }
      }
    }

    // If no tool use, exit loop
    const finalMessage = await stream.finalMessage();
    if (finalMessage.stop_reason !== "tool_use") {
      continueLoop = false;
    }
  }

  yield {
    type: "done",
    toolCalls,
    aliasMapSummary: getAliasMapSummary(userContext),
  };
}

/**
 * Stream chat with OpenAI - yields events for SSE
 */
async function* streamChatWithOpenAI(messages, tools, mcpManager, userContext) {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OpenAI client not configured");
  }

  const systemPrompt = getSystemPrompt(userContext);
  const openaiTools = convertToolsToOpenAI(tools);
  const openaiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
  ];

  const toolCalls = [];
  let continueLoop = true;

  while (continueLoop) {
    // Create streaming response
    const stream = await client.chat.completions.create({
      model: AI_CONFIG.model.openai,
      messages: openaiMessages,
      tools: openaiTools.length > 0 ? openaiTools : undefined,
      stream: true,
    });

    let currentToolCalls = [];
    let currentContent = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      if (delta?.content) {
        currentContent += delta.content;
        yield { type: "text", content: delta.content };
      }

      // Handle tool calls
      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          const idx = toolCall.index;

          if (!currentToolCalls[idx]) {
            currentToolCalls[idx] = {
              id: toolCall.id || "",
              name: toolCall.function?.name || "",
              arguments: "",
            };
            if (toolCall.function?.name) {
              yield { type: "tool_start", tool: toolCall.function.name };
            }
          }

          if (toolCall.id) {
            currentToolCalls[idx].id = toolCall.id;
          }
          if (toolCall.function?.name) {
            currentToolCalls[idx].name = toolCall.function.name;
          }
          if (toolCall.function?.arguments) {
            currentToolCalls[idx].arguments += toolCall.function.arguments;
          }
        }
      }
    }

    // Process tool calls if any
    if (currentToolCalls.length > 0 && currentToolCalls.some((tc) => tc.name)) {
      // Add assistant message with tool calls to history
      openaiMessages.push({
        role: "assistant",
        content: currentContent || null,
        tool_calls: currentToolCalls.map((tc, idx) => ({
          id: tc.id || `call_${idx}`,
          type: "function",
          function: {
            name: tc.name,
            arguments: tc.arguments,
          },
        })),
      });

      // Execute each tool
      for (const toolCall of currentToolCalls) {
        if (!toolCall.name) continue;

        let toolArgs = {};
        try {
          toolArgs = JSON.parse(toolCall.arguments || "{}");
        } catch (e) {
          logger.warn(`Failed to parse tool args: ${e.message}`);
        }

        let resolvedToolArgs = toolArgs;
        try {
          resolvedToolArgs = resolveToolArgsForExecution(
            toolCall.name,
            toolArgs,
            userContext,
          );
        } catch (aliasError) {
          toolCalls.push({
            tool: toolCall.name,
            args: toolArgs,
            error: aliasError.message,
            code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
          });
          yield {
            type: "tool_result",
            tool: toolCall.name,
            error: aliasError.message,
            code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
            unknownAliases: aliasError.unknownAliases || [],
            knownAliases: aliasError.knownAliases || [],
            success: false,
          };
          openaiMessages.push({
            role: "tool",
            tool_call_id:
              toolCall.id || `call_${currentToolCalls.indexOf(toolCall)}`,
            content: JSON.stringify({
              error: aliasError.message,
              code: aliasError.code || "ALIAS_RESOLUTION_FAILED",
              unknownAliases: aliasError.unknownAliases || [],
              knownAliases: aliasError.knownAliases || [],
            }),
          });
          continue;
        }

        yield {
          type: "tool_executing",
          tool: toolCall.name,
          args: resolvedToolArgs,
        };

        try {
          const result = await mcpManager.callTool(
            toolCall.name,
            resolvedToolArgs,
            userContext,
          );
          const aliasedResult = aliasifyToolResult(result, userContext);
          toolCalls.push({
            tool: toolCall.name,
            args: resolvedToolArgs,
            result: aliasedResult,
          });
          yield {
            type: "tool_result",
            tool: toolCall.name,
            result: aliasedResult,
            success: true,
          };

          // Add tool result to messages
          openaiMessages.push({
            role: "tool",
            tool_call_id:
              toolCall.id || `call_${currentToolCalls.indexOf(toolCall)}`,
            content: JSON.stringify(aliasedResult),
          });
        } catch (error) {
          logger.error(`Tool call failed: ${toolCall.name}`, error);
          toolCalls.push({
            tool: toolCall.name,
            args: resolvedToolArgs,
            error: error.message,
          });
          yield {
            type: "tool_result",
            tool: toolCall.name,
            error: error.message,
            success: false,
          };

          openaiMessages.push({
            role: "tool",
            tool_call_id:
              toolCall.id || `call_${currentToolCalls.indexOf(toolCall)}`,
            content: JSON.stringify({ error: error.message }),
          });
        }
      }
      // Continue loop to get AI's response after tool results
    } else {
      // No tool calls, we're done
      continueLoop = false;
    }
  }

  yield {
    type: "done",
    toolCalls,
    aliasMapSummary: getAliasMapSummary(userContext),
  };
}

/**
 * Stream chat - main streaming function
 */
async function* streamChat(messages, mcpTools, mcpManager, userContext) {
  const provider = getActiveProvider();

  if (!provider) {
    throw new Error("No AI provider configured.");
  }

  yield { type: "start", provider };

  if (provider === "anthropic") {
    yield* streamChatWithAnthropic(messages, mcpTools, mcpManager, userContext);
  } else {
    yield* streamChatWithOpenAI(messages, mcpTools, mcpManager, userContext);
  }
}

/**
 * Check if AI service is available
 */
function isAvailable() {
  return getActiveProvider() !== null;
}

/**
 * Get current AI configuration status
 */
function getStatus() {
  const provider = getActiveProvider();
  const status = {
    available: provider !== null,
    provider: provider,
    openaiConfigured: !!AI_CONFIG.openaiApiKey,
    anthropicConfigured: !!AI_CONFIG.anthropicApiKey,
    model: provider ? AI_CONFIG.model[provider] : null,
  };
  logger.debug("[AI SERVICE] getStatus called:", status);
  return status;
}

/**
 * Simple completion generation - no tools, just text generation
 * Used for generating test data, summaries, etc.
 */
async function generateCompletion(prompt, options = {}) {
  const provider = getActiveProvider();

  if (!provider) {
    throw new Error("No AI provider configured");
  }

  const maxTokens = options.maxTokens || 1000;
  const temperature = options.temperature || 0.7;

  logger.info(`[AI] Generating completion with ${provider}`);

  if (provider === "anthropic") {
    const client = getAnthropicClient();
    if (!client) {
      throw new Error("Anthropic client not configured");
    }

    const response = await client.messages.create({
      model: AI_CONFIG.model.anthropic,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text content
    let content = "";
    for (const block of response.content) {
      if (block.type === "text") {
        content += block.text;
      }
    }
    return content;
  } else {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error("OpenAI client not configured");
    }

    const response = await client.chat.completions.create({
      model: AI_CONFIG.model.openai,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: temperature,
    });

    return response.choices[0].message.content || "";
  }
}

/**
 * Search Mindbricks documentation
 */
async function searchDocumentation(query, limit = 5) {
  logger.info(`[AI] Searching documentation for: ${query}`);

  try {
    const response = await axios.post(
      `${DOCS_MCP_URL}/tools/search_documentation`,
      {
        query,
        limit,
        semanticRatio: 0.75,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      },
    );

    const result = response.data;

    if (result.results && result.results.length > 0) {
      return {
        count: result.count || result.results.length,
        results: result.results.map((r) => ({
          title: r.section_title || r.page_title,
          page: r.page_title,
          url: r.url,
          content: r.llm_markdown || r.content,
          breadcrumb: r.breadcrumb,
        })),
      };
    }

    return {
      count: 0,
      results: [],
      message: "No documentation found for this query.",
    };
  } catch (error) {
    logger.error("[AI] Documentation search failed:", error.message);
    return { error: error.message, results: [] };
  }
}

/**
 * Documentation search tool definition
 */
const DOCS_SEARCH_TOOL = {
  name: "search_mindbricks_docs",
  description:
    "Search Mindbricks documentation for information about patterns, APIs, configuration, and best practices. Use this when you need to understand how something works in Mindbricks.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          'The search query (e.g., "dataObject properties", "authentication setup", "pipeline patterns")',
      },
      limit: {
        type: "number",
        description: "Maximum results to return (default: 5)",
        default: 5,
      },
    },
    required: ["query"],
  },
};

module.exports = {
  chat,
  streamChat,
  isAvailable,
  getStatus,
  getActiveProvider,
  generateCompletion,
  searchDocumentation,
  DOCS_SEARCH_TOOL,
  AI_CONFIG,
  UUID_ALIAS_ENABLED,
};
