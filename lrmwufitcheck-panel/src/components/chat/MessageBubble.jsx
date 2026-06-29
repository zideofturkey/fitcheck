import { useState } from "react";
import {
  User,
  Bot,
  Wrench,
  Code,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../utils/cn";
import ToolResult from "./ToolResult";
import ActionCard, { extractFrontendAction } from "./ActionCard";

// Custom code block component with collapsible HTML
const CodeBlock = ({ children, className, ...props }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const isHtml = language === "html";
  const codeContent = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // For HTML blocks, make them collapsible
  if (isHtml) {
    return (
      <div className="my-2 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Code className="w-4 h-4" />
            <span>Generated HTML</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({codeContent.split("\n").length} lines)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="p-1 hover:bg-gray-400/30 rounded"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </button>
        {isExpanded && (
          <pre className="p-3 bg-gray-100 dark:bg-gray-900 text-xs overflow-x-auto max-h-64 overflow-y-auto">
            <code className="whitespace-pre-wrap break-all">{codeContent}</code>
          </pre>
        )}
      </div>
    );
  }

  // For other code blocks, render normally with wrapping
  return (
    <pre className="my-2 p-3 bg-gray-200 dark:bg-gray-900 rounded-lg text-xs overflow-x-auto">
      <code
        className={cn("whitespace-pre-wrap break-all", className)}
        {...props}
      >
        {children}
      </code>
    </pre>
  );
};

// Inline code component
const InlineCode = ({ children, ...props }) => (
  <code
    className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm break-all"
    {...props}
  >
    {children}
  </code>
);

// Helper to extract and format MCP tool results
const formatToolResult = (result) => {
  // mcp-client-manager wraps results: { success, service, tool, result: { content: [...] } }
  let data = result;

  // Unwrap the mcp-client-manager wrapper
  if (result?.result?.content) {
    data = result.result;
  }

  // MCP responses have format: { content: [{ type: "text", text: "..." }] }
  if (data?.content && Array.isArray(data.content)) {
    const textContent = data.content.find((c) => c.type === "text");
    if (textContent?.text) {
      try {
        return JSON.parse(textContent.text);
      } catch {
        return textContent.text;
      }
    }
  }

  return result;
};

// Inline tool call component
const InlineToolCall = ({ segment }) => {
  const formattedResult = segment.result
    ? formatToolResult(segment.result)
    : null;
  const frontendAction = segment.result
    ? extractFrontendAction(segment.result)
    : null;
  const resultStr = formattedResult
    ? typeof formattedResult === "object"
      ? JSON.stringify(formattedResult, null, 2)
      : String(formattedResult)
    : null;

  // If the tool returned a frontend action, render the ActionCard instead of JSON
  if (frontendAction && segment.status === "complete" && segment.success) {
    return <ActionCard action={frontendAction} />;
  }

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-200/50 dark:bg-gray-700/50 text-sm my-2">
      <Wrench
        className={cn(
          "w-4 h-4 mt-0.5 flex-shrink-0",
          segment.status === "complete"
            ? segment.success
              ? "text-green-500"
              : "text-red-500"
            : "text-amber-500 animate-pulse",
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-primary-600 dark:text-primary-400">
          {segment.tool}
        </div>
        {segment.error ? (
          <div className="text-red-500 text-xs mt-1">
            Error: {segment.error}
          </div>
        ) : segment.status === "complete" && resultStr ? (
          <details className="mt-1">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              View result
            </summary>
            <pre className="mt-1 p-2 rounded bg-gray-100 dark:bg-gray-900 text-xs overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
              {resultStr.length > 1000
                ? resultStr.substring(0, 1000) + "\n...(truncated)"
                : resultStr}
            </pre>
          </details>
        ) : (
          <div className="text-xs text-gray-500">
            {segment.status === "starting" && "Starting..."}
            {segment.status === "executing" && "Executing..."}
          </div>
        )}
      </div>
    </div>
  );
};

// Text segment with markdown rendering
const TextSegment = ({ content }) => (
  <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-0 prose-code:bg-transparent prose-code:p-0 prose-code:before:content-none prose-code:after:content-none [overflow-wrap:anywhere]">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ node, inline, className, children, ...props }) => {
          // In react-markdown v6+, inline detection can be unreliable
          // A code block has a className (language-xxx) or is inside a <pre>
          // Check if this is truly inline: no className AND (inline prop is true OR no newlines in content)
          const codeContent = String(children);
          const hasLanguage = className && className.startsWith("language-");
          const hasNewlines = codeContent.includes("\n");
          const isInlineCode =
            !hasLanguage &&
            (inline === true || (!hasNewlines && inline !== false));

          if (isInlineCode) {
            return <InlineCode {...props}>{children}</InlineCode>;
          }
          return (
            <CodeBlock className={className} {...props}>
              {children}
            </CodeBlock>
          );
        },
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {content || ""}
    </ReactMarkdown>
  </div>
);

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const isToolCall = message.type === "tool_call";
  const isToolResult = message.type === "tool_result";

  if (isToolCall || isToolResult) {
    return <ToolResult message={message} />;
  }

  // Check if message uses new segments format or old content format
  const hasSegments = message.segments && message.segments.length > 0;

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary-100 dark:bg-primary-900/20"
            : "bg-gray-100 dark:bg-gray-700",
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        ) : (
          <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[75%] min-w-0 overflow-hidden rounded-2xl px-4 py-2",
          isUser
            ? "bg-primary-600 text-white rounded-tr-sm"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm",
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : hasSegments ? (
          /* Render segments inline */
          <div>
            {message.segments.map((segment, idx) => (
              <div key={idx}>
                {segment.type === "text" ? (
                  <TextSegment content={segment.content} />
                ) : (
                  <InlineToolCall segment={segment} />
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Fallback for old message format with content + toolCalls */
          <>
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mb-3 space-y-2">
                {message.toolCalls.map((tc, idx) => (
                  <InlineToolCall
                    key={idx}
                    segment={{
                      type: "tool",
                      tool: tc.tool,
                      args: tc.args,
                      result: tc.result,
                      error: tc.error,
                      status: "complete",
                      success: !tc.error,
                    }}
                  />
                ))}
              </div>
            )}
            <TextSegment content={message.content} />
          </>
        )}

        {/* Footer with timestamp and provider */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs mt-1",
            isUser ? "text-primary-200" : "text-gray-500 dark:text-gray-400",
          )}
        >
          {message.timestamp && (
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {!isUser && message.provider && (
            <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {message.provider === "anthropic"
                ? "Claude"
                : message.provider === "openai"
                  ? "GPT"
                  : message.provider}
            </span>
          )}
          {!isUser && message.processingTime && (
            <span>{message.processingTime}ms</span>
          )}
        </div>
      </div>
    </div>
  );
}
