import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../stores/chatStore";
import MessageList from "./MessageList";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import Suggestions from "./Suggestions";
import ToolsPanel from "./ToolsPanel";
import HtmlViewer from "./HtmlViewer";
import ConversationSidebar from "./ConversationSidebar";
import { Bot, Loader2, Wrench, Settings, Globe } from "lucide-react";
import ActionCard, { extractFrontendAction } from "./ActionCard";
import { useAuthStore } from "../../stores/authStore";

export default function ChatContainer() {
  const {
    messages,
    isLoading,
    isStreaming,
    streamingSegments,
    loadTools,
    loadStatus,
    aiStatus,
    htmlContent,
    browserView,
    rightPanelTab,
    setRightPanelTab,
  } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [showTools, setShowTools] = useState(true);
  const roleId = Array.isArray(user?.roleId) ? user.roleId[0] : user?.roleId;
  const isStandardUser = roleId === "user" || roleId === "tenantUser";

  useEffect(() => {
    loadTools();
    loadStatus();
  }, [loadTools, loadStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingSegments]);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation Sidebar (hidden for standard users) */}
      {!isStandardUser && <ConversationSidebar />}

      {/* Main Chat Area */}
      <div
        className={`flex flex-col min-w-0 ${isStandardUser ? "w-1/2 px-2" : "flex-1 px-6"}`}
      >
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                fitcheck Assistant
              </h1>
              {aiStatus?.ai && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    aiStatus.ai.available
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {aiStatus.ai.available ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      {aiStatus.ai.provider === "anthropic" ? "Claude" : "GPT"}
                    </>
                  ) : (
                    "AI Not Configured"
                  )}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {aiStatus?.ai?.available
                ? "Ask me anything about your data or request actions through the available tools."
                : "Configure OPENAI_API_KEY or ANTHROPIC_API_KEY to enable AI chat."}
            </p>
          </div>
          {!isStandardUser && (
            <button
              onClick={() => setShowTools(!showTools)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={showTools ? "Hide Tools" : "Show Tools"}
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pr-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start a Conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                I can help you interact with your services, query data, and
                perform actions. Try asking me something!
              </p>
              <Suggestions />
            </div>
          ) : (
            <>
              <MessageList messages={messages} />

              {/* Streaming Message */}
              {isStreaming && (
                <div className="flex gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>

                  {/* Content */}
                  <div className="max-w-[75%] min-w-0 overflow-hidden rounded-2xl px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm">
                    {streamingSegments.length > 0 ? (
                      <div className="space-y-2">
                        {streamingSegments.map((segment, idx) => (
                          <div key={idx}>
                            {segment.type === "text" ? (
                              <div
                                className="whitespace-pre-wrap break-words text-sm"
                                style={{
                                  overflowWrap: "anywhere",
                                  wordBreak: "break-word",
                                }}
                              >
                                {segment.content}
                                {idx === streamingSegments.length - 1 && (
                                  <span className="inline-block w-2 h-4 ml-1 bg-primary-500 animate-pulse" />
                                )}
                              </div>
                            ) : (
                              (() => {
                                const frontendAction =
                                  segment.status === "complete" &&
                                  segment.success &&
                                  segment.result
                                    ? extractFrontendAction(segment.result)
                                    : null;

                                if (frontendAction) {
                                  return <ActionCard action={frontendAction} />;
                                }

                                return (
                                  <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-200/50 dark:bg-gray-700/50 text-sm my-2">
                                    <Wrench
                                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                        segment.status === "complete"
                                          ? segment.success
                                            ? "text-green-500"
                                            : "text-red-500"
                                          : "text-amber-500 animate-pulse"
                                      }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-primary-600 dark:text-primary-400">
                                        {segment.tool}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {segment.status === "starting" &&
                                          "Starting..."}
                                        {segment.status === "executing" &&
                                          "Executing..."}
                                        {segment.status === "complete" &&
                                          (segment.success
                                            ? "Completed"
                                            : "Failed")}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <ChatInput />
        </div>
      </div>

      {/* Right Visual Browser */}
      <div
        className={`flex-shrink-0 transition-all duration-300 flex flex-col border-l border-gray-200 dark:border-gray-700 ${
          isStandardUser ? "w-1/2" : showTools ? "block" : "hidden lg:block"
        } ${!isStandardUser && rightPanelTab === "browser" && (htmlContent || browserView) ? "w-[560px]" : !isStandardUser ? "w-80" : ""}`}
      >
        {/* Tab Bar (admin/advanced users only) */}
        {!isStandardUser && (
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setRightPanelTab("tools")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                rightPanelTab === "tools"
                  ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-white dark:bg-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Settings className="w-4 h-4" />
              Tools
            </button>
            <button
              onClick={() => setRightPanelTab("browser")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                rightPanelTab === "browser"
                  ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-white dark:bg-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Globe className="w-4 h-4" />
              Browser
              {(htmlContent || browserView) && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {!isStandardUser && rightPanelTab === "tools" ? (
            <ToolsPanel />
          ) : (
            <HtmlViewer />
          )}
        </div>
      </div>
    </div>
  );
}
