import { useEffect, useCallback } from "react";
import { useChatStore } from "../stores/chatStore";

/**
 * Custom hook for chat functionality
 */
export function useChat() {
  const {
    messages,
    conversationId,
    isLoading,
    tools,
    suggestions,
    sendMessage,
    callTool,
    clearMessages,
    loadTools,
    loadHistory,
  } = useChatStore();

  // Load tools on mount
  useEffect(() => {
    loadTools();
  }, []);

  // Send message wrapper
  const send = useCallback(
    async (message) => {
      if (!message.trim()) return;
      return sendMessage(message);
    },
    [sendMessage],
  );

  // Quick action for tool calls
  const runTool = useCallback(
    async (toolName, args = {}) => {
      return callTool(toolName, args);
    },
    [callTool],
  );

  return {
    messages,
    conversationId,
    isLoading,
    tools,
    suggestions,
    send,
    runTool,
    clear: clearMessages,
    loadHistory,
  };
}
