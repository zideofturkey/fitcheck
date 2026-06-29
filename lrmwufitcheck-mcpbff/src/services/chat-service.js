/**
 * Chat Service
 *
 * Processes user chat messages using AI (OpenAI or Anthropic) with
 * MCP tool calling capabilities to fulfill user requests.
 * Includes Mindbricks documentation search capability.
 */

const { v4: uuidv4 } = require("uuid");
const logger = require("../common/logger");
const conversationStore = require("./conversation-store");
const aiService = require("./ai-service");
const uuidAliasRegistry = require("./uuid-alias-registry");
const { filterTools } = require("../common/tool-filters");

/**
 * Enhanced MCP Manager wrapper that includes documentation search
 */
class EnhancedMcpManager {
  constructor(mcpManager) {
    this.mcpManager = mcpManager;
  }

  getAllTools() {
    const mcpTools = this.mcpManager.getAllTools();
    return [...mcpTools, aiService.DOCS_SEARCH_TOOL];
  }

  getBffTools() {
    return [aiService.DOCS_SEARCH_TOOL];
  }

  async callTool(toolName, args, userContext) {
    // Handle documentation search specially
    if (toolName === "search_mindbricks_docs") {
      return aiService.searchDocumentation(args.query, args.limit);
    }
    // Otherwise delegate to MCP manager
    return this.mcpManager.callTool(toolName, args, userContext);
  }

  getConnectionStatus() {
    return this.mcpManager.getConnectionStatus();
  }
}

/**
 * Process a chat message and return AI response with tool call results
 */
async function processMessage(
  mcpManager,
  message,
  userContext,
  conversationId = null,
  options = {},
) {
  const startTime = Date.now();
  const convId = conversationId || uuidv4();
  const scopedUserContext = { ...(userContext || {}), conversationId: convId };

  logger.info(
    `Processing message for conversation ${convId}: "${message.substring(0, 100)}..."`,
  );

  // Wrap MCP manager with documentation search capability
  const enhancedManager = new EnhancedMcpManager(mcpManager);

  // Check if AI service is available
  if (!aiService.isAvailable()) {
    logger.warn("AI service not available - using fallback response");
    return processFallbackMessage(
      enhancedManager,
      message,
      scopedUserContext,
      convId,
      startTime,
    );
  }

  // Filter MCP tools, then re-add BFF-level tools (always kept)
  const mcpTools = mcpManager.getAllTools();
  const { tools: filteredMcpTools } = filterTools(mcpTools, {
    disabledServices: options.disabledServices || [],
  });
  const availableTools = [
    ...filteredMcpTools,
    ...enhancedManager.getBffTools(),
  ];
  logger.info(
    `Available tools: ${availableTools.length} (after filtering, including BFF tools)`,
  );

  // Get userId from context for user-specific history
  const userId = scopedUserContext?.userId || "anonymous";

  // Get conversation history (user-specific)
  const history = (await conversationStore.getMessages(convId, userId)) || [];

  // Build messages array for AI
  const messages = [
    ...history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  // Store user message (user-specific)
  await conversationStore.addMessage(
    convId,
    {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    },
    userId,
  );

  let response = {
    conversationId: convId,
    message: "",
    toolCalls: [],
    suggestions: [],
    provider: aiService.getActiveProvider(),
  };

  try {
    // Call AI service with tools (using enhanced manager for docs search)
    const aiResponse = await aiService.chat(
      messages,
      availableTools,
      enhancedManager,
      scopedUserContext,
    );

    response.message = aiResponse.content;
    response.toolCalls = aiResponse.toolCalls || [];
    response.usage = aiResponse.usage;
    response.aliasMapSummary =
      aiResponse.aliasMapSummary ||
      uuidAliasRegistry.getAliasMapSummary(scopedUserContext);

    // Generate suggestions based on available tools
    response.suggestions = generateSuggestions(availableTools, message);
  } catch (error) {
    logger.error("AI chat error:", error);

    // Fallback to basic response
    response.message = `I encountered an error while processing your request: ${error.message}. `;
    response.message += `Please try again or rephrase your question.`;
    response.error = error.message;
  }

  // Store assistant response (user-specific)
  await conversationStore.addMessage(
    convId,
    {
      role: "assistant",
      content: response.message,
      toolCalls: response.toolCalls,
      timestamp: new Date().toISOString(),
    },
    userId,
  );

  response.processingTime = Date.now() - startTime;

  return response;
}

/**
 * Fallback message processing when AI is not available
 */
async function processFallbackMessage(
  mcpManager,
  message,
  userContext,
  convId,
  startTime,
) {
  const availableTools = mcpManager.getAllTools();
  const userId = userContext?.userId || "anonymous";

  // Store user message (user-specific)
  await conversationStore.addMessage(
    convId,
    {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    },
    userId,
  );

  let response = {
    conversationId: convId,
    message: "",
    toolCalls: [],
    suggestions: [],
    provider: "fallback",
  };

  // Simple intent detection
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("what can you do")
  ) {
    response.message = `I can help you interact with the following services:\n\n`;

    const toolsByService = {};
    for (const tool of availableTools) {
      const service = tool.service || "general";
      if (!toolsByService[service]) {
        toolsByService[service] = [];
      }
      toolsByService[service].push(tool);
    }

    for (const [service, tools] of Object.entries(toolsByService)) {
      response.message += `**${service}:**\n`;
      for (const tool of tools.slice(0, 5)) {
        response.message += `- ${tool.name}: ${(tool.description || "").substring(0, 80)}\n`;
      }
      if (tools.length > 5) {
        response.message += `  ... and ${tools.length - 5} more\n`;
      }
      response.message += "\n";
    }

    response.message += `\n**Note:** AI chat is not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY for full conversational AI features.`;
  } else {
    response.message = `AI chat is not currently configured. To enable AI-powered conversations with tool calling, please set either OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.\n\n`;
    response.message += `In the meantime, you can:\n`;
    response.message += `- Ask "help" to see available tools\n`;
    response.message += `- Use the /api/chat/tool endpoint to call tools directly\n`;
  }

  response.suggestions = ["help", "What tools are available?"];

  // Store assistant response (user-specific)
  await conversationStore.addMessage(
    convId,
    {
      role: "assistant",
      content: response.message,
      timestamp: new Date().toISOString(),
    },
    userId,
  );

  response.processingTime = Date.now() - startTime;

  return response;
}

/**
 * Generate contextual suggestions based on tools and recent message
 */
function generateSuggestions(tools, lastMessage) {
  const suggestions = [];
  const lowerMessage = lastMessage.toLowerCase();

  // Group tools by common actions
  const actions = {
    list: tools.filter((t) => t.name.toLowerCase().startsWith("list")),
    get: tools.filter((t) => t.name.toLowerCase().startsWith("get")),
    create: tools.filter((t) => t.name.toLowerCase().startsWith("create")),
    search: tools.filter((t) => t.name.toLowerCase().startsWith("search")),
  };

  // Add relevant suggestions
  if (lowerMessage.includes("list") || lowerMessage.includes("show")) {
    // Suggest other list operations
    for (const tool of actions.list.slice(0, 2)) {
      if (!lowerMessage.includes(tool.name.toLowerCase())) {
        suggestions.push(`List ${tool.name.replace("list", "").toLowerCase()}`);
      }
    }
  }

  if (suggestions.length < 3) {
    // Add general suggestions
    if (actions.list.length > 0) {
      suggestions.push(
        `Show all ${actions.list[0].name.replace("list", "").toLowerCase()}`,
      );
    }
    suggestions.push("What can you help me with?");
  }

  return suggestions.slice(0, 3);
}

/**
 * Get conversation history
 */
async function getConversationHistory(conversationId, userId) {
  return await conversationStore.getMessages(conversationId, userId);
}

/**
 * Clear conversation history
 */
async function clearConversationHistory(conversationId, userId) {
  const cleared = await conversationStore.clearConversation(
    conversationId,
    userId,
  );
  uuidAliasRegistry.clearConversationMap(conversationId);
  return cleared;
}

/**
 * Get AI service status
 */
function getAIStatus() {
  return aiService.getStatus();
}

module.exports = {
  processMessage,
  getConversationHistory,
  clearConversationHistory,
  getAIStatus,
};
