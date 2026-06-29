import { mcpBffClient } from "./apiClient";

// Get base URL and ensure it ends with /api
// Port allocation: mcp-bff=3005
const getMcpBffUrl = () => {
  let url = import.meta.env.VITE_MCP_BFF_URL || "http://localhost:3005";
  // Remove trailing slash
  url = url.replace(/\/+$/, "");
  // Ensure /api suffix
  if (!url.endsWith("/api")) {
    url += "/api";
  }
  return url;
};

const MCP_BFF_URL = getMcpBffUrl();

/**
 * Chat Service
 *
 * Handles all chat and MCP tool-related API calls.
 * Supports both regular HTTP and SSE streaming responses.
 */
export const chatService = {
  /**
   * Send a chat message (non-streaming)
   */
  sendMessage: async (message, conversationId = null, context = {}) => {
    const response = await mcpBffClient.post("/chat", {
      message,
      conversationId,
      disabledServices: context.disabledServices,
      context,
    });
    return response.data;
  },

  /**
   * Send a chat message with SSE streaming
   * @param {string} message - User message
   * @param {string|null} conversationId - Conversation ID
   * @param {object} callbacks - Event callbacks: { onText, onToolStart, onToolResult, onError, onDone }
   * @returns {function} Abort function to cancel the stream
   */
  sendMessageStream: (
    message,
    conversationId = null,
    disabledServices = [],
    callbacks = {},
  ) => {
    const {
      onStart,
      onText,
      onToolStart,
      onToolExecuting,
      onToolResult,
      onError,
      onDone,
    } = callbacks;
    const abortController = new AbortController();

    // Get auth token from localStorage - try multiple possible storage keys
    const storageKeys = [
      "lrmwufitcheck-auth-storage", // Project-specific key
      "auth-storage", // Generic fallback
    ];

    let token = null;
    for (const key of storageKeys) {
      const authData = localStorage.getItem(key);
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          // Auth store uses 'accessToken' not 'token'
          token = parsed?.state?.accessToken;
          if (token) break;
        } catch (e) {
          // Continue to next key
        }
      }
    }

    const startStream = async () => {
      let receivedDone = false;

      try {
        const response = await fetch(`${MCP_BFF_URL}/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message, conversationId, disabledServices }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = null;
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7);
            } else if (line.startsWith("data: ") && currentEvent) {
              try {
                const data = JSON.parse(line.slice(6));
                switch (currentEvent) {
                  case "start":
                    onStart?.(data);
                    break;
                  case "text":
                    onText?.(data.content);
                    break;
                  case "tool_start":
                    onToolStart?.(data.tool);
                    break;
                  case "tool_executing":
                    onToolExecuting?.(data.tool, data.args);
                    break;
                  case "tool_result":
                    onToolResult?.(
                      data.tool,
                      data.result,
                      data.success,
                      data.error,
                    );
                    break;
                  case "error":
                    onError?.(data.message);
                    break;
                  case "done":
                    receivedDone = true;
                    onDone?.(data);
                    break;
                }
              } catch (e) {
                console.warn("Failed to parse SSE data:", e);
              }
              currentEvent = null;
            }
          }
        }

        // Stream ended — if server never sent a 'done' event, fire onDone as fallback
        // to ensure the UI resets its loading/streaming state
        if (!receivedDone) {
          console.warn(
            "[ChatService] Stream ended without a done event — forcing completion",
          );
          onDone?.({ conversationId });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          onError?.(error.message);
        }
      }
    };

    startStream();

    // Return abort function
    return () => abortController.abort();
  },

  /**
   * Call an MCP tool directly
   */
  callTool: async (toolName, args = {}) => {
    const response = await mcpBffClient.post("/chat/tool", {
      tool: toolName,
      args,
    });
    return response.data;
  },

  /**
   * Get conversation history
   */
  getHistory: async (conversationId) => {
    const response = await mcpBffClient.get(`/chat/history/${conversationId}`);
    return response.data;
  },

  /**
   * Clear conversation history
   */
  clearHistory: async (conversationId) => {
    const response = await mcpBffClient.delete(
      `/chat/history/${conversationId}`,
    );
    return response.data;
  },

  /**
   * Get available tools
   */
  getTools: async () => {
    const response = await mcpBffClient.get("/tools");
    return response.data;
  },

  /**
   * Get tools for a specific service
   */
  getServiceTools: async (serviceName) => {
    const response = await mcpBffClient.get(`/tools/service/${serviceName}`);
    return response.data;
  },

  /**
   * Call a tool via the tools endpoint
   */
  invokeToolDirect: async (name, args = {}) => {
    const response = await mcpBffClient.post("/tools/call", {
      name,
      arguments: args,
    });
    return response.data;
  },

  /**
   * Get MCP connection status
   */
  getConnectionStatus: async () => {
    const response = await mcpBffClient.get("/tools/status");
    return response.data;
  },

  /**
   * Refresh tool registry
   */
  refreshTools: async () => {
    const response = await mcpBffClient.post("/tools/refresh");
    return response.data;
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    const response = await mcpBffClient.get("/health");
    return response.data;
  },

  /**
   * Get AI chat status and configuration
   */
  getChatStatus: async () => {
    const response = await mcpBffClient.get("/chat/status");
    return response.data;
  },

  /**
   * List all conversations
   */
  listConversations: async (page = 1, limit = 20) => {
    const response = await mcpBffClient.get("/chat/conversations", {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get a specific conversation with messages
   */
  getConversation: async (conversationId) => {
    const response = await mcpBffClient.get(
      `/chat/conversations/${conversationId}`,
    );
    return response.data;
  },

  /**
   * Update conversation title
   */
  updateConversationTitle: async (conversationId, title) => {
    const response = await mcpBffClient.patch(
      `/chat/conversations/${conversationId}`,
      {
        title,
      },
    );
    return response.data;
  },

  /**
   * Delete a conversation
   */
  deleteConversation: async (conversationId) => {
    const response = await mcpBffClient.delete(
      `/chat/conversations/${conversationId}`,
    );
    return response.data;
  },

  /**
   * Search conversations
   */
  searchConversations: async (query, page = 1, limit = 20) => {
    const response = await mcpBffClient.get("/chat/conversations/search", {
      params: { query, page, limit },
    });
    return response.data;
  },
};
