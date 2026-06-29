import {
  Wrench,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../../utils/cn";

export default function ToolResult({ message }) {
  const [expanded, setExpanded] = useState(false);
  const isCall = message.type === "tool_call";
  const isSuccess = message.status === "success";

  const extractTextContent = (result) => {
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
          // Try to parse as JSON for pretty display
          return JSON.parse(textContent.text);
        } catch {
          return textContent.text;
        }
      }
    }
    return result;
  };

  const formatResult = (result) => {
    const extracted = extractTextContent(result);
    if (typeof extracted === "object") {
      return JSON.stringify(extracted, null, 2);
    }
    return String(extracted);
  };

  return (
    <div className="flex gap-3">
      {/* Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
        <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[85%]">
        <div
          className={cn(
            "rounded-xl border overflow-hidden",
            isSuccess
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
              : message.status === "error"
                ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
          )}
        >
          {/* Header */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isCall ? (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Calling:{" "}
                  <code className="text-amber-600 dark:text-amber-400">
                    {message.toolName}
                  </code>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  {isSuccess ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {message.toolName} {isSuccess ? "completed" : "failed"}
                  </span>
                </div>
              )}
            </div>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* Expanded Content */}
          {expanded && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              {message.arguments && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Arguments
                  </p>
                  <pre className="text-xs bg-white dark:bg-gray-900 rounded p-2 overflow-x-auto text-gray-800 dark:text-gray-200">
                    {formatResult(message.arguments)}
                  </pre>
                </div>
              )}
              {message.result && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Result
                  </p>
                  <pre className="text-xs bg-white dark:bg-gray-900 rounded p-2 overflow-x-auto max-h-60 text-gray-800 dark:text-gray-200">
                    {formatResult(message.result)}
                  </pre>
                </div>
              )}
              {message.error && (
                <div>
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                    Error
                  </p>
                  <pre className="text-xs bg-red-100 dark:bg-red-900/20 rounded p-2 overflow-x-auto text-red-700 dark:text-red-400">
                    {message.error}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
