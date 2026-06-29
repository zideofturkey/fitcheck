import { create } from "zustand";
import { chatService } from "../services/chatService";

/**
 * Chat Store
 *
 * Manages chat conversation state with streaming support.
 */
export const useChatStore = create((set, get) => ({
  // State
  messages: [],
  conversationId: null,
  conversationTitle: null,
  conversations: [],
  conversationsLoading: false,
  conversationsTotal: 0,
  isLoading: false,
  isStreaming: false,
  streamingSegments: [], // Array of { type: 'text'|'tool', content/tool/args/result/status }
  tools: [],
  suggestions: [],
  aiStatus: null, // AI provider status
  abortStream: null, // Function to abort current stream
  htmlContent: null, // Generated HTML content for the viewer
  browserView: null, // { type, title, ...payload }
  rightPanelTab: "tools", // 'tools' or 'browser'
  disabledServices: JSON.parse(
    localStorage.getItem("mbx-disabled-services") || "[]",
  ),
  autoFilteredServices: [],

  // Actions
  setConversationId: (conversationId) => set({ conversationId }),

  clearMessages: () =>
    set({
      messages: [],
      conversationId: null,
      suggestions: [],
      streamingSegments: [],
    }),

  setTools: (tools) => set({ tools }),

  setHtmlContent: (htmlContent) =>
    set({
      htmlContent,
      rightPanelTab: htmlContent ? "browser" : "tools",
    }),

  setBrowserView: (browserView) =>
    set({
      browserView,
      rightPanelTab: "browser",
      htmlContent:
        browserView?.type === "html"
          ? browserView?.html || null
          : get().htmlContent,
    }),

  clearBrowserView: () =>
    set({
      browserView: null,
    }),

  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

  toggleService: (serviceName) => {
    set((state) => {
      const disabled = [...state.disabledServices];
      const idx = disabled.indexOf(serviceName);
      if (idx >= 0) {
        disabled.splice(idx, 1);
      } else {
        disabled.push(serviceName);
      }
      localStorage.setItem("mbx-disabled-services", JSON.stringify(disabled));
      return { disabledServices: disabled };
    });
  },

  initAutoFilteredServices: (services) => {
    set((state) => {
      const disabled = [...state.disabledServices];
      let changed = false;
      for (const svc of services) {
        if (!disabled.includes(svc.service)) {
          disabled.push(svc.service);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem("mbx-disabled-services", JSON.stringify(disabled));
      }
      return { autoFilteredServices: services, disabledServices: disabled };
    });
  },

  // Send message (non-streaming fallback)
  sendMessage: async (message) => {
    const { conversationId, messages, disabledServices } = get();

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    set({
      messages: [...messages, userMessage],
      isLoading: true,
      suggestions: [],
    });

    try {
      const response = await chatService.sendMessage(message, conversationId, {
        disabledServices,
      });

      // Add assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        toolCalls: response.toolCalls,
        provider: response.provider,
        processingTime: response.processingTime,
        timestamp: new Date().toISOString(),
      };

      set({
        messages: [...get().messages, assistantMessage],
        conversationId: response.conversationId,
        suggestions: response.suggestions || [],
        isLoading: false,
      });

      return response;
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}`,
        isError: true,
        timestamp: new Date().toISOString(),
      };

      set({
        messages: [...get().messages, errorMessage],
        isLoading: false,
      });

      throw error;
    }
  },

  // Send message with streaming
  sendMessageStream: (message) => {
    const { conversationId, messages, disabledServices } = get();

    // Track if this is a new conversation BEFORE streaming starts
    const isNewConversation = !conversationId;

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    const assistantMessageId = (Date.now() + 1).toString();
    let streamProvider = null;
    let startTime = Date.now();

    set({
      messages: [...messages, userMessage],
      isLoading: true,
      isStreaming: true,
      streamingSegments: [],
      suggestions: [],
    });

    const abortFn = chatService.sendMessageStream(
      message,
      conversationId,
      disabledServices,
      {
        onStart: (data) => {
          streamProvider = data.provider;
          set({ conversationId: data.conversationId });
        },

        onText: (content) => {
          set((state) => {
            const segments = [...state.streamingSegments];
            const lastSegment = segments[segments.length - 1];

            // If last segment is text, append to it; otherwise create new text segment
            if (lastSegment && lastSegment.type === "text") {
              segments[segments.length - 1] = {
                ...lastSegment,
                content: lastSegment.content + content,
              };
            } else {
              segments.push({ type: "text", content });
            }

            return { streamingSegments: segments };
          });
        },

        onToolStart: (toolName) => {
          set((state) => ({
            streamingSegments: [
              ...state.streamingSegments,
              { type: "tool", tool: toolName, status: "starting" },
            ],
          }));
        },

        onToolExecuting: (toolName, args) => {
          set((state) => ({
            streamingSegments: state.streamingSegments.map((seg) =>
              seg.type === "tool" &&
              seg.tool === toolName &&
              seg.status === "starting"
                ? { ...seg, status: "executing", args }
                : seg,
            ),
          }));
        },

        onToolResult: (toolName, result, success, error) => {
          set((state) => ({
            streamingSegments: state.streamingSegments.map((seg) =>
              seg.type === "tool" &&
              seg.tool === toolName &&
              seg.status === "executing"
                ? { ...seg, status: "complete", result, success, error }
                : seg,
            ),
          }));
        },

        onError: (errorMsg) => {
          const { streamingSegments } = get();

          const assistantMessage = {
            id: assistantMessageId,
            role: "assistant",
            segments:
              streamingSegments.length > 0
                ? streamingSegments
                : [{ type: "text", content: `Error: ${errorMsg}` }],
            isError: true,
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isLoading: false,
            isStreaming: false,
            streamingSegments: [],
            abortStream: null,
          }));
        },

        onDone: (data) => {
          const {
            streamingSegments,
            setHtmlContent,
            setBrowserView,
            loadConversations,
          } = get();

          // Build full content from text segments for HTML extraction
          const fullContent = streamingSegments
            .filter((s) => s.type === "text")
            .map((s) => s.content)
            .join("");

          // Check if the response contains HTML content
          const htmlMatch = fullContent.match(/```html\s*([\s\S]*?)```/i);
          if (htmlMatch) {
            const extractedHtml = htmlMatch[1].trim();
            console.log(
              "[Chat] Extracted HTML for viewer:",
              extractedHtml.substring(0, 100) + "...",
            );
            setHtmlContent(extractedHtml);
            setBrowserView({
              type: "html",
              title: "Generated HTML",
              html: extractedHtml,
            });
          } else {
            const jsonMatch = fullContent.match(/```json\s*([\s\S]*?)```/i);
            if (jsonMatch) {
              const jsonText = jsonMatch[1].trim();
              try {
                const parsed = JSON.parse(jsonText);
                setBrowserView({
                  type: "json",
                  title: "Generated JSON",
                  data: parsed,
                });
              } catch {
                // Keep chat-only rendering if JSON is malformed.
              }
            } else if (fullContent && fullContent.length > 200) {
              setBrowserView({
                type: "markdown",
                title: "AI Document",
                markdown: fullContent,
              });
            }
          }

          const assistantMessage = {
            id: assistantMessageId,
            role: "assistant",
            segments: streamingSegments,
            provider: streamProvider,
            processingTime: data.processingTime || Date.now() - startTime,
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            conversationId: data.conversationId || state.conversationId,
            isLoading: false,
            isStreaming: false,
            streamingSegments: [],
            abortStream: null,
          }));

          // Refresh conversation list if a new conversation was created
          // (isNewConversation was captured at the start of sendMessageStream)
          if (isNewConversation && data.conversationId) {
            loadConversations();
          }
        },
      },
    );

    set({ abortStream: abortFn });
    return abortFn;
  },

  // Stop current stream
  stopStream: () => {
    const { abortStream } = get();
    if (abortStream) {
      abortStream();
      set({
        isLoading: false,
        isStreaming: false,
        streamingSegments: [],
        abortStream: null,
      });
    }
  },

  // Call tool directly
  callTool: async (toolName, args) => {
    set({ isLoading: true });

    try {
      const response = await chatService.callTool(toolName, args);

      // Add tool result as message
      const toolMessage = {
        id: Date.now().toString(),
        role: "tool",
        toolName,
        content: JSON.stringify(response.result, null, 2),
        success: response.success,
        timestamp: new Date().toISOString(),
      };

      set({
        messages: [...get().messages, toolMessage],
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Load tools
  loadTools: async () => {
    try {
      const response = await chatService.getTools();
      set({ tools: response.tools || [] });
      const autoFiltered = response.autoFilteredServices || [];
      if (autoFiltered.length > 0) {
        get().initAutoFilteredServices(autoFiltered);
      }
    } catch (error) {
      console.error("Failed to load tools:", error);
    }
  },

  // Refresh tools (reconnect disconnected services and reload tools)
  refreshTools: async () => {
    try {
      set({ isLoading: true });
      const response = await chatService.refreshTools();
      // Convert grouped tools to flat array
      const tools = [];
      if (response.tools) {
        for (const [service, serviceTools] of Object.entries(response.tools)) {
          for (const tool of serviceTools) {
            tools.push({ ...tool, service });
          }
        }
      }
      set({ tools, isLoading: false });
      const autoFiltered = response.autoFilteredServices || [];
      if (autoFiltered.length > 0) {
        get().initAutoFilteredServices(autoFiltered);
      }
      return response;
    } catch (error) {
      console.error("Failed to refresh tools:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Load conversation history
  loadHistory: async (conversationId) => {
    try {
      const response = await chatService.getHistory(conversationId);
      set({
        messages: response.history || [],
        conversationId,
      });
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  },

  // Load AI status
  loadStatus: async () => {
    try {
      const response = await chatService.getChatStatus();
      set({ aiStatus: response });
      return response;
    } catch (error) {
      console.error("Failed to load AI status:", error);
      return null;
    }
  },

  // Load conversations list
  loadConversations: async (page = 1, limit = 20) => {
    set({ conversationsLoading: true });
    try {
      const response = await chatService.listConversations(page, limit);
      set({
        conversations: response.conversations || [],
        conversationsTotal: response.total || 0,
        conversationsLoading: false,
      });
      return response;
    } catch (error) {
      console.error("Failed to load conversations:", error);
      set({ conversationsLoading: false });
      return null;
    }
  },

  // Load a specific conversation
  loadConversation: async (conversationId) => {
    set({ isLoading: true });
    try {
      const response = await chatService.getConversation(conversationId);
      set({
        messages: response.messages || [],
        conversationId: response.id,
        conversationTitle: response.title,
        isLoading: false,
      });
      return response;
    } catch (error) {
      console.error("Failed to load conversation:", error);
      set({ isLoading: false });
      return null;
    }
  },

  // Start new conversation
  newConversation: () => {
    const { abortStream } = get();
    // Abort any in-flight stream before resetting
    if (abortStream) {
      abortStream();
    }
    set({
      messages: [],
      conversationId: null,
      conversationTitle: null,
      streamingSegments: [],
      suggestions: [],
      isLoading: false,
      isStreaming: false,
      abortStream: null,
    });
  },

  // Update conversation title
  updateConversationTitle: async (conversationId, title) => {
    try {
      await chatService.updateConversationTitle(conversationId, title);
      set((state) => ({
        conversationTitle:
          state.conversationId === conversationId
            ? title
            : state.conversationTitle,
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, title } : c,
        ),
      }));
      return true;
    } catch (error) {
      console.error("Failed to update conversation title:", error);
      return false;
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      await chatService.deleteConversation(conversationId);
      set((state) => ({
        conversations: state.conversations.filter(
          (c) => c.id !== conversationId,
        ),
        // Clear current if deleted
        ...(state.conversationId === conversationId
          ? { messages: [], conversationId: null, conversationTitle: null }
          : {}),
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      return false;
    }
  },
}));
