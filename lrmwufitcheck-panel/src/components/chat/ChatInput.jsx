import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Square } from "lucide-react";
import { useChatStore } from "../../stores/chatStore";

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const { sendMessageStream, stopStream, isLoading, isStreaming } =
    useChatStore();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const text = message.trim();
    setMessage("");
    sendMessageStream(text);
  };

  const handleStop = () => {
    stopStream();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 max-h-48 py-2 px-2"
          rows={1}
        />
        <div className="flex items-center gap-1">
          {isStreaming ? (
            <button
              type="button"
              onClick={handleStop}
              className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              title="Stop generating"
            >
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        {isStreaming
          ? "AI is responding... Click stop to cancel"
          : "Press Enter to send, Shift+Enter for new line"}
      </p>
    </form>
  );
}
