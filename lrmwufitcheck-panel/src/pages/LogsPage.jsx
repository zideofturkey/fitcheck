import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  FileText,
  Activity,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Server,
  X,
  Loader2,
  ExternalLink,
  Radio,
  ArrowUpRight,
  ArrowDownLeft,
  Terminal,
  Wifi,
  WifiOff,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { createMcpBffClient } from "../services/apiClient";
import { cn } from "../utils/cn";

// Log type configurations
const LOG_TYPES = {
  0: {
    name: "INFO",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: Info,
  },
  1: {
    name: "WARNING",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: AlertTriangle,
  },
  2: {
    name: "ERROR",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    icon: AlertCircle,
  },
};

// Request type configurations
const REQUEST_TYPES = {
  REST: {
    name: "REST",
    color: "text-green-700 dark:text-green-300",
    bg: "bg-green-100 dark:bg-green-900/40",
  },
  MCP: {
    name: "MCP",
    color: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-100 dark:bg-purple-900/40",
  },
  GRPC: {
    name: "GRPC",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 dark:bg-orange-900/40",
  },
  KAFKA: {
    name: "KAFKA",
    color: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-100 dark:bg-cyan-900/40",
  },
  UNKNOWN: {
    name: "LOG",
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
  },
};

// Helper to detect request type from log
const getRequestType = (log) => {
  // Check params first
  if (log.params?.requestType) return log.params.requestType;
  // Check data
  if (log.data?.requestType) return log.data.requestType;
  // Infer from subject
  if (log.subject?.includes("Rest") || log.subject?.includes("REST"))
    return "REST";
  if (log.subject?.includes("Mcp") || log.subject?.includes("MCP"))
    return "MCP";
  if (log.subject?.includes("Grpc") || log.subject?.includes("GRPC"))
    return "GRPC";
  if (log.subject?.includes("Kafka") || log.subject?.includes("KAFKA"))
    return "KAFKA";
  return null;
};

// Helper to get display title from log (URL for REST, toolName for MCP)
const getLogTitle = (log) => {
  // For REST requests
  if (log.data?.url) return log.data.url;
  if (log.data?.method && log.data?.url)
    return `${log.data.method} ${log.data.url}`;
  // For MCP requests
  if (log.data?.toolName) return log.data.toolName;
  if (log.params?.toolName) return log.params.toolName;
  if (log.params?.function) return log.params.function;
  // Fallback to subject
  return log.subject;
};

// Check if log is a request (vs response)
const isRequestLog = (log) => {
  return log.subject?.includes("Received") || log.subject?.includes("Request");
};

// Check if log is a response
const isResponseLog = (log) => {
  return (
    log.subject?.includes("Responded") || log.subject?.includes("Response")
  );
};

// Helper to get time recency badge (NOW = last 1 min, RECENT = last 5 min)
const getRecencyBadge = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes <= 1) {
    return { label: "NOW", bg: "bg-red-500", color: "text-white", pulse: true };
  } else if (diffMinutes <= 5) {
    return {
      label: "RECENT",
      bg: "bg-amber-500",
      color: "text-white",
      pulse: false,
    };
  }
  return null;
};

// Time badge component
const TimeBadge = ({ dateStr }) => {
  const badge = getRecencyBadge(dateStr);
  if (!badge) return null;

  return (
    <span
      className={cn(
        "px-1.5 py-0.5 text-[10px] font-bold rounded flex-shrink-0",
        badge.bg,
        badge.color,
        badge.pulse && "animate-pulse",
      )}
    >
      {badge.label}
    </span>
  );
};

/**
 * LogsPage - Application logs viewer with filtering and request tracking
 */
export default function LogsPage() {
  const [activeTab, setActiveTab] = useState("logs"); // 'logs' | 'requests' | 'events' | 'console'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FileText className="w-7 h-7" />
          Application Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and filter application logs, HTTP requests, events, and console
          output
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0 mb-4">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "logs"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400",
            )}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            All Logs
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "requests"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400",
            )}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            HTTP Requests
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "events"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400",
            )}
          >
            <Radio className="w-4 h-4 inline mr-2" />
            Event Monitor
          </button>
          <button
            onClick={() => setActiveTab("console")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "console"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400",
            )}
          >
            <Terminal className="w-4 h-4 inline mr-2" />
            Console
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "logs" && <LogsTab />}
        {activeTab === "requests" && <RequestsTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "console" && <ConsoleTab />}
      </div>
    </div>
  );
}

/**
 * LogsTab - All logs with filtering (two-panel layout)
 */
function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [logType, setLogType] = useState("all");
  const [service, setService] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selected log for detail panel
  const [selectedLog, setSelectedLog] = useState(null);
  const [relatedLogs, setRelatedLogs] = useState(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const client = createMcpBffClient();
      const response = await client.get("/logs/services");
      setServices(response.data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const client = createMcpBffClient();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (logType !== "all") params.append("logType", logType);
      if (service !== "all") params.append("service", service);
      if (search.length >= 2) params.append("search", search);

      const response = await client.get(`/logs?${params}`);
      const data = response.data;

      setLogs(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch logs",
      );
    } finally {
      setLoading(false);
    }
  }, [page, logType, service, search]);

  // Fetch related logs by requestId (to show request + response together)
  const fetchRelatedLogs = useCallback(async (requestId) => {
    if (!requestId) {
      setRelatedLogs(null);
      return;
    }
    setLoadingRelated(true);
    try {
      const client = createMcpBffClient();
      const response = await client.get(`/logs/requests/${requestId}`);
      setRelatedLogs(response.data);
    } catch (err) {
      console.error("Failed to fetch related logs:", err);
      setRelatedLogs(null);
    } finally {
      setLoadingRelated(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // When a log is selected, fetch related logs if it has a requestId
  useEffect(() => {
    if (selectedLog?.requestId) {
      fetchRelatedLogs(selectedLog.requestId);
    } else {
      setRelatedLogs(null);
    }
  }, [selectedLog, fetchRelatedLogs]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length === 0 || search.length >= 2) {
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-4 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, message..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        {/* Log Type Filter */}
        <select
          value={logType}
          onChange={(e) => {
            setLogType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Types</option>
          <option value="0">INFO</option>
          <option value="1">WARNING</option>
          <option value="2">ERROR</option>
        </select>

        {/* Service Filter */}
        <select
          value={service}
          onChange={(e) => {
            setService(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Services</option>
          {services.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>

        {/* Total */}
        <span className="text-sm text-gray-500">
          {total.toLocaleString()} logs
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left Panel - Logs List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-w-0">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-12 flex-1">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 flex-1">
              No logs found
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto flex-1">
                {logs.map((log) => {
                  const typeConfig = LOG_TYPES[log.logType] || LOG_TYPES[0];
                  const TypeIcon = typeConfig.icon;
                  const isSelected = selectedLog?.id === log.id;
                  const requestType = getRequestType(log);
                  const requestTypeConfig = requestType
                    ? REQUEST_TYPES[requestType] || REQUEST_TYPES.UNKNOWN
                    : null;
                  const displayTitle = getLogTitle(log);

                  return (
                    <div
                      key={log.id}
                      className={cn(
                        "px-4 py-3 cursor-pointer flex items-start gap-2 transition-colors",
                        isSelected
                          ? "bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent",
                      )}
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Log Type badge */}
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded flex-shrink-0",
                          typeConfig.bg,
                          typeConfig.color,
                        )}
                      >
                        <TypeIcon className="w-3 h-3 inline mr-1" />
                        {typeConfig.name}
                      </span>

                      {/* Request Type badge (REST/MCP/etc) */}
                      {requestTypeConfig && (
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded flex-shrink-0",
                            requestTypeConfig.bg,
                            requestTypeConfig.color,
                          )}
                        >
                          {requestTypeConfig.name}
                        </span>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 dark:text-white truncate text-sm flex-1">
                            {displayTitle}
                          </div>
                          <TimeBadge dateStr={log.date} />
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {log.logSource} • {formatDate(log.date)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Panel - Log Detail */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-w-0">
          {selectedLog ? (
            <>
              {/* Header with badges and title */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const typeConfig =
                        LOG_TYPES[selectedLog.logType] || LOG_TYPES[0];
                      const TypeIcon = typeConfig.icon;
                      const requestType = getRequestType(selectedLog);
                      const requestTypeConfig = requestType
                        ? REQUEST_TYPES[requestType] || REQUEST_TYPES.UNKNOWN
                        : null;
                      return (
                        <>
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs font-medium rounded",
                              typeConfig.bg,
                              typeConfig.color,
                            )}
                          >
                            <TypeIcon className="w-3 h-3 inline mr-1" />
                            {typeConfig.name}
                          </span>
                          {requestTypeConfig && (
                            <span
                              className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded",
                                requestTypeConfig.bg,
                                requestTypeConfig.color,
                              )}
                            >
                              {requestTypeConfig.name}
                            </span>
                          )}
                          {selectedLog.data?.method && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                              {selectedLog.data.method}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Title: URL or toolName */}
                <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {getLogTitle(selectedLog)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedLog.logSource} • {formatDate(selectedLog.date)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Loading related logs indicator */}
                {loadingRelated && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading related logs...
                  </div>
                )}

                {/* Request/Response sections if we have related logs */}
                {relatedLogs && (
                  <div className="space-y-4">
                    {/* Request */}
                    {relatedLogs.request && (
                      <div>
                        <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40">
                            REQUEST
                          </span>
                          {relatedLogs.request.data?.method && (
                            <span className="text-xs text-gray-500">
                              {relatedLogs.request.data.method}
                            </span>
                          )}
                          {relatedLogs.request.data?.url && (
                            <span className="text-xs text-gray-500 truncate">
                              {relatedLogs.request.data.url}
                            </span>
                          )}
                        </div>
                        <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-3 rounded overflow-auto whitespace-pre-wrap break-all w-full border border-green-200 dark:border-green-800">
                          {JSON.stringify(
                            relatedLogs.request.data || relatedLogs.request,
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    )}

                    {/* Response */}
                    {relatedLogs.response && (
                      <div>
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40">
                            RESPONSE
                          </span>
                        </div>
                        <pre className="text-xs bg-blue-50 dark:bg-blue-900/20 p-3 rounded overflow-auto whitespace-pre-wrap break-all w-full border border-blue-200 dark:border-blue-800">
                          {JSON.stringify(
                            relatedLogs.response.data || relatedLogs.response,
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    )}

                    {/* Errors */}
                    {relatedLogs.errors && relatedLogs.errors.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40">
                            ERRORS ({relatedLogs.errors.length})
                          </span>
                        </div>
                        {relatedLogs.errors.map((err, idx) => (
                          <pre
                            key={idx}
                            className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-auto whitespace-pre-wrap break-all w-full border border-red-200 dark:border-red-800 mb-2"
                          >
                            {JSON.stringify(err.data || err, null, 2)}
                          </pre>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* If no related logs (or this log has no requestId), show the log details directly */}
                {!relatedLogs && !loadingRelated && (
                  <>
                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Service:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {selectedLog.logSource}
                        </span>
                      </div>
                      {selectedLog.requestId && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Request ID:</span>
                          <span className="ml-2 font-mono text-xs text-gray-900 dark:text-white">
                            {selectedLog.requestId}
                          </span>
                        </div>
                      )}
                      {selectedLog.location && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-2 font-mono text-xs text-gray-900 dark:text-white">
                            {selectedLog.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Params */}
                    {selectedLog.params &&
                      Object.keys(selectedLog.params).length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Params
                          </div>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto whitespace-pre-wrap break-all w-full">
                            {JSON.stringify(selectedLog.params, null, 2)}
                          </pre>
                        </div>
                      )}

                    {/* Data */}
                    {selectedLog.data &&
                      Object.keys(selectedLog.data).length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data
                          </div>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto whitespace-pre-wrap break-all w-full">
                            {JSON.stringify(selectedLog.data, null, 2)}
                          </pre>
                        </div>
                      )}
                  </>
                )}

                {/* All logs with this requestId */}
                {relatedLogs?.all && relatedLogs.all.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      All Related Logs ({relatedLogs.all.length})
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {relatedLogs.all.map((log, idx) => {
                        const logTypeConfig =
                          LOG_TYPES[log.logType] || LOG_TYPES[0];
                        return (
                          <div
                            key={idx}
                            className="text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-xs",
                                  logTypeConfig.bg,
                                  logTypeConfig.color,
                                )}
                              >
                                {logTypeConfig.name}
                              </span>
                              <span className="text-gray-500 truncate">
                                {log.subject}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a log to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * RequestsTab - HTTP requests grouped by requestId with packaged request/response view
 */
function RequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [service, setService] = useState("all");
  const [status, setStatus] = useState("all"); // 'all' | 'success' | 'error'
  const [requestTypeFilter, setRequestTypeFilter] = useState("all"); // 'all' | 'REST' | 'MCP' | 'GRPC' | 'KAFKA'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selected request detail
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetail, setRequestDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const client = createMcpBffClient();
      const response = await client.get("/logs/services");
      setServices(response.data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const client = createMcpBffClient();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (service !== "all") params.append("service", service);
      if (status !== "all") params.append("status", status);
      if (requestTypeFilter !== "all")
        params.append("requestType", requestTypeFilter);
      if (search.length >= 2) params.append("search", search);

      const response = await client.get(`/logs/requests?${params}`);
      const data = response.data;

      setRequests(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch requests",
      );
    } finally {
      setLoading(false);
    }
  }, [page, service, status, requestTypeFilter, search]);

  const fetchRequestDetail = useCallback(async (requestId) => {
    if (!requestId) return;
    setLoadingDetail(true);
    try {
      const client = createMcpBffClient();
      const response = await client.get(`/logs/requests/${requestId}`);
      setRequestDetail(response.data);
    } catch (err) {
      console.error("Failed to fetch request detail:", err);
      setRequestDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Track previous selectedRequest to avoid unnecessary fetches
  const prevSelectedRef = useRef(null);

  useEffect(() => {
    if (selectedRequest && selectedRequest !== prevSelectedRef.current) {
      prevSelectedRef.current = selectedRequest;
      fetchRequestDetail(selectedRequest);
    } else if (!selectedRequest) {
      prevSelectedRef.current = null;
      setRequestDetail(null);
    }
  }, [selectedRequest, fetchRequestDetail]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const formatDuration = (ms) => {
    if (ms === null || ms === undefined) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Get the package data from detail response
  const pkg = requestDetail?.package;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search URL, tool, requestId..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        {/* Request Type Filter */}
        <select
          value={requestTypeFilter}
          onChange={(e) => {
            setRequestTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Types</option>
          <option value="REST">REST</option>
          <option value="MCP">MCP</option>
          <option value="GRPC">GRPC</option>
          <option value="KAFKA">KAFKA</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Has Errors</option>
        </select>

        {/* Service Filter */}
        <select
          value={service}
          onChange={(e) => {
            setService(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Services</option>
          {services.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>

        {/* Total */}
        <span className="text-sm text-gray-500">
          {total.toLocaleString()} requests
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Main Content - Two panel layout */}
      <div className="grid grid-cols-2 gap-4 w-full flex-1 min-h-0">
        {/* Requests List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-w-0">
          {loading && requests.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No requests found
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto flex-1">
                {requests.map((req) => {
                  const requestTypeConfig = req.requestType
                    ? REQUEST_TYPES[req.requestType] || REQUEST_TYPES.UNKNOWN
                    : REQUEST_TYPES.UNKNOWN;

                  return (
                    <div
                      key={req.requestId}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedRequest(req.requestId);
                      }}
                      className={cn(
                        "px-4 py-3 cursor-pointer transition-colors",
                        selectedRequest === req.requestId
                          ? "bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent",
                      )}
                    >
                      {/* Top row: badges */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded",
                            requestTypeConfig.bg,
                            requestTypeConfig.color,
                          )}
                        >
                          {req.requestType || "LOG"}
                        </span>
                        {req.displaySubtitle && req.requestType === "REST" && (
                          <span
                            className={cn(
                              "px-1.5 py-0.5 text-xs font-bold rounded",
                              req.displaySubtitle === "GET"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                : req.displaySubtitle === "POST"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                  : req.displaySubtitle === "PUT"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                                    : req.displaySubtitle === "DELETE"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                            )}
                          >
                            {req.displaySubtitle}
                          </span>
                        )}
                        {req.duration !== null && (
                          <span className="text-xs text-gray-400 ml-auto">
                            {formatDuration(req.duration)}
                          </span>
                        )}
                        {req.hasError ? (
                          <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                            {req.errorCount} error
                            {req.errorCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                            OK
                          </span>
                        )}
                      </div>
                      {/* Title */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate flex-1">
                          {req.displayTitle || "Request"}
                        </div>
                        <TimeBadge dateStr={req.timestamp} />
                      </div>
                      {/* Meta */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{req.services?.join(", ") || "-"}</span>
                        <span>•</span>
                        <span>{formatDate(req.timestamp)}</span>
                        <span>•</span>
                        <span>{req.logCount} logs</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination in list */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Request Detail Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-w-0">
          {!selectedRequest ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
              <Activity className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Select a request to view details</p>
            </div>
          ) : loadingDetail ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : pkg ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Request Type Badge */}
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded",
                        REQUEST_TYPES[pkg.requestType]?.bg ||
                          REQUEST_TYPES.UNKNOWN.bg,
                        REQUEST_TYPES[pkg.requestType]?.color ||
                          REQUEST_TYPES.UNKNOWN.color,
                      )}
                    >
                      {pkg.requestType}
                    </span>
                    {/* Method/Subtitle Badge */}
                    {pkg.displaySubtitle && pkg.requestType === "REST" && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-xs font-bold rounded",
                          pkg.displaySubtitle === "GET"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : pkg.displaySubtitle === "POST"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : pkg.displaySubtitle === "PUT"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                                : pkg.displaySubtitle === "DELETE"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                        )}
                      >
                        {pkg.displaySubtitle}
                      </span>
                    )}
                    {pkg.requestType === "MCP" && (
                      <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        Tool
                      </span>
                    )}
                    {/* Duration */}
                    {pkg.duration !== null && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(pkg.duration)}
                      </span>
                    )}
                    {/* Status */}
                    {pkg.hasError ? (
                      <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                        {pkg.errorCount} error{pkg.errorCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                        OK
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedRequest(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Title */}
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm break-all">
                  {pkg.displayTitle}
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(pkg.timestamp)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* REQUEST Section */}
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-2 border-b border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        REQUEST
                      </span>
                      {pkg.request?.method && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {pkg.request.method}
                        </span>
                      )}
                      {pkg.request?.url && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 truncate ml-1">
                          {pkg.request.url}
                        </span>
                      )}
                      {pkg.request?.toolName && (
                        <span className="text-xs text-purple-600 dark:text-purple-400">
                          {pkg.request.toolName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 max-h-64 overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap break-all text-gray-800 dark:text-gray-200">
                      {JSON.stringify(pkg.request, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* RESPONSE Section */}
                <div
                  className={cn(
                    "border rounded-lg overflow-hidden",
                    pkg.hasError
                      ? "border-red-200 dark:border-red-800"
                      : "border-green-200 dark:border-green-800",
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-2 border-b",
                      pkg.hasError
                        ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                        : "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          pkg.hasError
                            ? "text-red-700 dark:text-red-300"
                            : "text-green-700 dark:text-green-300",
                        )}
                      >
                        RESPONSE
                      </span>
                      {pkg.response?.statusCode && (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-xs font-medium rounded",
                            pkg.response.statusCode >= 400
                              ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                              : "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200",
                          )}
                        >
                          {pkg.response.statusCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 max-h-64 overflow-auto">
                    {pkg.response?.data ? (
                      <pre className="text-xs whitespace-pre-wrap break-all text-gray-800 dark:text-gray-200">
                        {JSON.stringify(pkg.response.data, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-xs text-gray-400">
                        No response data
                      </span>
                    )}
                  </div>
                </div>

                {/* ERRORS Section (if any) */}
                {pkg.errors && pkg.errors.length > 0 && (
                  <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
                    <div className="bg-red-50 dark:bg-red-900/30 px-3 py-2 border-b border-red-200 dark:border-red-800">
                      <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                        ERRORS ({pkg.errors.length})
                      </span>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 space-y-3 max-h-64 overflow-auto">
                      {pkg.errors.map((err, i) => (
                        <div key={i} className="border-l-2 border-red-400 pl-3">
                          <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                            {err.subject || "Error"}
                          </div>
                          {err.message && (
                            <div className="text-xs text-red-500 dark:text-red-400 mb-1 font-mono">
                              {err.message}
                            </div>
                          )}
                          <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded whitespace-pre-wrap break-all">
                            {JSON.stringify(err.data || err, null, 2)}
                          </pre>
                          {err.stack && (
                            <details className="mt-1">
                              <summary className="text-xs text-red-400 cursor-pointer">
                                Stack trace
                              </summary>
                              <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded mt-1 whitespace-pre-wrap break-all max-h-32 overflow-auto">
                                {err.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <span className="font-medium">Request ID:</span>
                    <span className="font-mono break-all">{pkg.requestId}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Total Logs:</span>
                    <span>{requestDetail.total}</span>
                  </div>
                </div>

                {/* Timeline (collapsed) */}
                {requestDetail.timeline &&
                  requestDetail.timeline.length > 0 && (
                    <details className="text-xs">
                      <summary className="font-medium text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                        View Timeline ({requestDetail.timeline.length} logs)
                      </summary>
                      <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                        {requestDetail.timeline.map((item, i) => {
                          const typeConfig =
                            LOG_TYPES[item.logType] || LOG_TYPES[0];
                          return (
                            <div key={i} className="flex items-start gap-2">
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded flex-shrink-0 text-[10px]",
                                  typeConfig.bg,
                                  typeConfig.color,
                                )}
                              >
                                {item.logTypeName}
                              </span>
                              <span className="text-gray-400 whitespace-nowrap flex-shrink-0">
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 truncate">
                                {item.subject}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
              <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Failed to load request details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * EventsTab - Event monitor showing EventRaised and EventReceived logs
 */
function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("all"); // 'all' | 'raised' | 'received'
  const [service, setService] = useState("all");
  const [eventIdFilter, setEventIdFilter] = useState(""); // Filter by eventId to see lifecycle
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selected event for detail panel
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchServices = useCallback(async () => {
    try {
      const client = createMcpBffClient();
      const response = await client.get("/logs/services");
      setServices(response.data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const client = createMcpBffClient();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (eventType !== "all") params.append("eventType", eventType);
      if (service !== "all") params.append("service", service);
      if (search.length >= 2) params.append("search", search);
      if (eventIdFilter) params.append("eventId", eventIdFilter);

      const response = await client.get(`/logs/events?${params}`);
      const data = response.data;

      setEvents(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch events",
      );
    } finally {
      setLoading(false);
    }
  }, [page, eventType, service, search, eventIdFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length === 0 || search.length >= 2) {
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-4 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        {/* Event Type Filter */}
        <select
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Events</option>
          <option value="raised">Raised Only</option>
          <option value="received">Received Only</option>
        </select>

        {/* Service Filter */}
        <select
          value={service}
          onChange={(e) => {
            setService(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Services</option>
          {services.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={fetchEvents}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>

        {/* Total */}
        <span className="text-sm text-gray-500">
          {total.toLocaleString()} events
        </span>
      </div>

      {/* Active EventId Filter Banner */}
      {eventIdFilter && (
        <div className="mb-4 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Radio className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 dark:text-purple-300">
              Showing event lifecycle for:
            </span>
            <code className="font-mono text-xs bg-purple-100 dark:bg-purple-800 px-2 py-0.5 rounded">
              {eventIdFilter.substring(0, 8)}...
            </code>
          </div>
          <button
            onClick={() => {
              setEventIdFilter("");
              setPage(1);
            }}
            className="text-purple-600 hover:text-purple-800 dark:text-purple-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left Panel - Events List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-w-0">
          {loading && events.length === 0 ? (
            <div className="flex items-center justify-center py-12 flex-1">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-gray-500 flex-1">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No events found</p>
              <p className="text-xs mt-1">
                Events are logged when EventRaised or EventReceived occurs
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto flex-1">
                {events.map((event) => {
                  const isRaised = event.eventType === "raised";
                  const isSelected = selectedEvent?.id === event.id;
                  const EventIcon = isRaised ? ArrowUpRight : ArrowDownLeft;

                  // Determine badge style based on event status
                  const getStatusBadge = () => {
                    const status =
                      event.eventStatus || (isRaised ? "raised" : "received");
                    switch (status) {
                      case "raised":
                        return {
                          label: "RAISED",
                          bg: "bg-emerald-100 dark:bg-emerald-900/30",
                          color: "text-emerald-700 dark:text-emerald-400",
                        };
                      case "arrived":
                        return {
                          label: "ARRIVED",
                          bg: "bg-blue-100 dark:bg-blue-900/30",
                          color: "text-blue-700 dark:text-blue-400",
                        };
                      case "processed":
                        return {
                          label: "PROCESSED",
                          bg: "bg-green-100 dark:bg-green-900/30",
                          color: "text-green-700 dark:text-green-400",
                        };
                      case "failed":
                        return {
                          label: "FAILED",
                          bg: "bg-red-100 dark:bg-red-900/30",
                          color: "text-red-700 dark:text-red-400",
                        };
                      default:
                        return {
                          label: "RECEIVED",
                          bg: "bg-blue-100 dark:bg-blue-900/30",
                          color: "text-blue-700 dark:text-blue-400",
                        };
                    }
                  };

                  const statusBadge = getStatusBadge();

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "px-4 py-3 cursor-pointer flex items-start gap-3 transition-colors",
                        isSelected
                          ? "bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent",
                      )}
                      onClick={() => setSelectedEvent(event)}
                    >
                      {/* Event Status Badge */}
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1 flex-shrink-0",
                          statusBadge.bg,
                          statusBadge.color,
                        )}
                      >
                        <EventIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Event Name as Bold Title */}
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-gray-900 dark:text-white truncate flex-1">
                            {event.eventName}
                          </div>
                          <TimeBadge dateStr={event.date} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="truncate">{event.logSource}</span>
                          <span>•</span>
                          <span>{formatDate(event.date)}</span>
                          {event.eventId && (
                            <>
                              <span>•</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEventIdFilter(event.eventId);
                                  setPage(1);
                                }}
                                className="font-mono text-purple-600 dark:text-purple-400 hover:underline"
                                title="Click to see event lifecycle"
                              >
                                {event.eventId.substring(0, 8)}...
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Panel - Event Detail */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-w-0">
          {selectedEvent ? (
            <>
              {/* Header with badges and title */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const isRaised = selectedEvent.eventType === "raised";
                      const EventIcon = isRaised ? ArrowUpRight : ArrowDownLeft;

                      // Get status badge config
                      const getStatusConfig = () => {
                        const status =
                          selectedEvent.eventStatus ||
                          (isRaised ? "raised" : "received");
                        switch (status) {
                          case "raised":
                            return {
                              label: "EVENT RAISED",
                              bg: "bg-emerald-100 dark:bg-emerald-900/30",
                              color: "text-emerald-700 dark:text-emerald-400",
                            };
                          case "arrived":
                            return {
                              label: "EVENT ARRIVED",
                              bg: "bg-blue-100 dark:bg-blue-900/30",
                              color: "text-blue-700 dark:text-blue-400",
                            };
                          case "processed":
                            return {
                              label: "EVENT PROCESSED",
                              bg: "bg-green-100 dark:bg-green-900/30",
                              color: "text-green-700 dark:text-green-400",
                            };
                          case "failed":
                            return {
                              label: "EVENT FAILED",
                              bg: "bg-red-100 dark:bg-red-900/30",
                              color: "text-red-700 dark:text-red-400",
                            };
                          default:
                            return {
                              label: "EVENT RECEIVED",
                              bg: "bg-blue-100 dark:bg-blue-900/30",
                              color: "text-blue-700 dark:text-blue-400",
                            };
                        }
                      };

                      const config = getStatusConfig();

                      return (
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1",
                            config.bg,
                            config.color,
                          )}
                        >
                          <EventIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Event Name as Bold Title */}
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {selectedEvent.eventName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedEvent.logSource} • {formatDate(selectedEvent.date)}
                </div>
              </div>

              {/* Content - Event JSON */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Event Payload */}
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Event Payload
                  </div>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto whitespace-pre-wrap break-all w-full border border-gray-200 dark:border-gray-700">
                    {JSON.stringify(selectedEvent.data, null, 2)}
                  </pre>
                </div>

                {/* Params (if any) */}
                {selectedEvent.params &&
                  Object.keys(selectedEvent.params).length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Parameters
                      </div>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto whitespace-pre-wrap break-all w-full">
                        {JSON.stringify(selectedEvent.params, null, 2)}
                      </pre>
                    </div>
                  )}

                {/* Correlation IDs */}
                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {/* Event ID - links publish and receive */}
                  {selectedEvent.eventId && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                        Event ID (tracks publish → receive lifecycle)
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-purple-600 dark:text-purple-400 break-all flex-1">
                          {selectedEvent.eventId}
                        </code>
                        <button
                          onClick={() => {
                            setEventIdFilter(selectedEvent.eventId);
                            setPage(1);
                          }}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 flex-shrink-0"
                        >
                          Trace Event
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Request ID - links event to HTTP request */}
                  {selectedEvent.requestId && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Request ID (links to originating API request)
                      </div>
                      <code className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">
                        {selectedEvent.requestId}
                      </code>
                    </div>
                  )}

                  {/* Other Meta Info */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex gap-2">
                      <span className="font-medium">Service:</span>
                      <span>{selectedEvent.logSource}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">Log ID:</span>
                      <span className="font-mono break-all">
                        {selectedEvent.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Radio className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select an event to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ConsoleTab - Real-time console output viewer with SSE streaming
 */
function ConsoleTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);

  // Filters
  const [service, setService] = useState("all");
  const [logType, setLogType] = useState("all"); // 'all' | '0' (stdout) | '2' (stderr)
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // SSE stream state
  const [streamConnected, setStreamConnected] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [liveLogsCount, setLiveLogsCount] = useState(0);
  const abortControllerRef = useRef(null);
  const logsEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Live logs buffer (separate from historical logs)
  const [liveLogs, setLiveLogs] = useState([]);
  const MAX_LIVE_LOGS = 500; // Keep last 500 live logs

  // Selected log for detail view
  const [selectedLog, setSelectedLog] = useState(null);

  // Reconnect timeout ref
  const reconnectTimeoutRef = useRef(null);
  // Track if paused (for use in stream reader)
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  // Track search (for use in stream reader)
  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // Build SSE stream URL
  const getStreamUrl = useCallback(() => {
    const client = createMcpBffClient();
    const baseUrl = client.defaults.baseURL;

    // Build query params
    const params = new URLSearchParams();
    if (service !== "all") params.append("service", service);
    if (logType !== "all") params.append("logType", logType);

    const queryString = params.toString();
    const streamUrl = `${baseUrl}/logs/console/stream${queryString ? "?" + queryString : ""}`;
    console.log("[ConsoleTab] SSE stream URL:", streamUrl);
    return streamUrl;
  }, [service, logType]);

  // Connect to SSE stream using fetch (supports Authorization header)
  const connectStream = useCallback(async () => {
    // Abort existing connection if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const url = getStreamUrl();
      // Get token from auth storage (same format as apiClient)
      let token = null;
      const storage = localStorage.getItem("lrmwufitcheck-auth-storage");
      if (storage) {
        try {
          const { state } = JSON.parse(storage);
          token = state?.accessToken;
        } catch (e) {
          console.warn("[ConsoleTab] Failed to parse auth storage");
        }
      }
      console.log(
        "[ConsoleTab] Connecting to SSE stream:",
        url,
        "hasToken:",
        !!token,
      );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stream error: ${response.status} - ${errorText}`);
      }

      setStreamConnected(true);
      setStreamError("");
      console.log("[ConsoleTab] SSE stream connected");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Process SSE stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("[ConsoleTab] SSE stream ended");
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        let currentEvent = "";
        let currentData = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            currentData = line.slice(6);
          } else if (line === "" && currentData) {
            // End of event - process it
            try {
              if (currentEvent === "connected") {
                const data = JSON.parse(currentData);
                console.log("[ConsoleTab] Received welcome:", data);
              } else if (currentEvent === "heartbeat") {
                // Heartbeat - connection is healthy
              } else if (currentEvent === "console-log") {
                if (!isPausedRef.current) {
                  const logEntry = JSON.parse(currentData);

                  // Apply client-side search filter
                  const currentSearch = searchRef.current;
                  if (
                    currentSearch &&
                    !logEntry.data?.message
                      ?.toLowerCase()
                      .includes(currentSearch.toLowerCase())
                  ) {
                    // Skip - doesn't match search
                  } else {
                    setLiveLogs((prev) => {
                      const newLogs = [
                        ...prev,
                        {
                          ...logEntry,
                          id: `live-${Date.now()}-${Math.random()}`,
                        },
                      ];
                      return newLogs.slice(-MAX_LIVE_LOGS);
                    });
                    setLiveLogsCount((c) => c + 1);
                  }
                }
              }
            } catch (err) {
              console.error(
                "[ConsoleTab] Failed to parse SSE event:",
                currentEvent,
                err,
              );
            }
            currentEvent = "";
            currentData = "";
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("[ConsoleTab] SSE stream aborted");
        return;
      }
      console.error("[ConsoleTab] SSE stream error:", err);
      setStreamError(err.message);
    } finally {
      setStreamConnected(false);
      // Reconnect after 3 seconds if not intentionally aborted
      if (
        abortControllerRef.current &&
        !abortControllerRef.current.signal.aborted
      ) {
        reconnectTimeoutRef.current = setTimeout(connectStream, 3000);
      }
    }
  }, [getStreamUrl]);

  // Disconnect SSE stream
  const disconnectStream = useCallback(() => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    // Abort fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStreamConnected(false);
    }
  }, []);

  // Fetch services for filter dropdown (from console-specific endpoint)
  const fetchServices = useCallback(async () => {
    try {
      const client = createMcpBffClient();
      const response = await client.get("/logs/console/services");
      setServices(response.data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  }, []);

  // Fetch historical console logs from dedicated console index
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const client = createMcpBffClient();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "100",
      });

      if (logType !== "all") params.append("logType", logType);
      if (service !== "all") params.append("service", service);
      if (search && search.length >= 2) params.append("search", search);

      const response = await client.get(`/logs/console?${params}`);
      const data = response.data;

      setLogs(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch console logs:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch console logs",
      );
    } finally {
      setLoading(false);
    }
  }, [page, logType, service, search]);

  // Initialize
  useEffect(() => {
    fetchServices();
    fetchLogs();
    connectStream();

    return () => {
      disconnectStream();
    };
  }, []);

  // Reconnect when service or logType filter changes (SSE uses query params)
  useEffect(() => {
    // Reconnect with new filters
    disconnectStream();
    setTimeout(connectStream, 100);
  }, [service, logType]);

  // Refetch historical logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-scroll to bottom when new live logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveLogs, autoScroll]);

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  // Clear live logs
  const clearLiveLogs = () => {
    setLiveLogs([]);
    setLiveLogsCount(0);
  };

  // Update service filter - also clears live logs since they're filtered server-side
  const updateServiceFilter = (newService) => {
    setService(newService);
    // Clear live logs when changing service filter since SSE will reconnect with new filter
    clearLiveLogs();
  };

  // Combine historical and live logs for display, applying client-side service filter
  // Note: SSE stream is filtered server-side, but historical logs need client-side filter
  const displayLogs = useMemo(() => {
    const combined = [...logs.slice().reverse(), ...liveLogs];

    // Filter by service if not 'all'
    if (service !== "all") {
      return combined.filter((log) => log.logSource === service);
    }

    return combined;
  }, [logs, liveLogs, service]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Controls Bar */}
      <div className="flex flex-wrap gap-3 items-center mb-4 flex-shrink-0">
        {/* Stream Status */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
            streamConnected
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
          )}
        >
          {streamConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Live</span>
              {!isPaused && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Disconnected</span>
            </>
          )}
        </div>

        {/* Pause/Resume */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            isPaused
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
          )}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </button>

        {/* Auto-scroll toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Auto-scroll
        </label>

        {/* Service Filter */}
        <select
          value={service}
          onChange={(e) => updateServiceFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Services</option>
          {services.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Log Type Filter */}
        <select
          value={logType}
          onChange={(e) => setLogType(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Output</option>
          <option value="0">stdout</option>
          <option value="2">stderr</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[150px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter output..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        {/* Clear */}
        <button
          onClick={clearLiveLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          title="Clear live logs"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Refresh Historical */}
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
          title="Refresh historical logs"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>

        {/* Live count */}
        <span className="text-sm text-gray-500">
          {liveLogsCount} live • {total} historical
        </span>
      </div>

      {/* Error */}
      {(error || streamError) && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
          {error || streamError}
        </div>
      )}

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Left Panel - Console Output (2/3 width) */}
        <div className="col-span-2 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden flex flex-col font-mono text-sm">
          {/* Console Header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs ml-2">
              Console Output {service !== "all" && `— ${service}`}
            </span>
          </div>

          {/* Console Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loading && displayLogs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </div>
            ) : displayLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No console output yet</p>
                <p className="text-xs mt-1">
                  Console logs will appear here in real-time
                </p>
              </div>
            ) : (
              <>
                {displayLogs.map((log) => {
                  const isError =
                    log.logType === 2 || log.data?.stream === "stderr";
                  const isSelected = selectedLog?.id === log.id;
                  const message = log.data?.message || JSON.stringify(log.data);

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={cn(
                        "flex items-start gap-2 px-2 py-1 rounded cursor-pointer transition-colors group",
                        isSelected
                          ? "bg-primary-900/50 border-l-2 border-primary-500"
                          : "hover:bg-gray-800 border-l-2 border-transparent",
                        isError && !isSelected && "bg-red-900/20",
                      )}
                    >
                      {/* Timestamp */}
                      <span className="text-gray-500 text-xs flex-shrink-0 w-24">
                        {formatTime(log.date)}
                      </span>

                      {/* Service badge */}
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded flex-shrink-0",
                          isError
                            ? "bg-red-800/50 text-red-400"
                            : "bg-gray-700 text-gray-400",
                        )}
                      >
                        {log.logSource}
                      </span>

                      {/* Stream indicator */}
                      <span
                        className={cn(
                          "text-xs flex-shrink-0",
                          isError ? "text-red-400" : "text-green-400",
                        )}
                      >
                        {isError ? "ERR" : "OUT"}
                      </span>

                      {/* Message */}
                      <span
                        className={cn(
                          "flex-1 break-all whitespace-pre-wrap",
                          isError ? "text-red-300" : "text-gray-200",
                        )}
                      >
                        {message}
                      </span>
                    </div>
                  );
                })}
                <div ref={logsEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Log Detail (1/3 width) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          {selectedLog ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded",
                        selectedLog.logType === 2 ||
                          selectedLog.data?.stream === "stderr"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                      )}
                    >
                      {selectedLog.data?.stream === "stderr"
                        ? "stderr"
                        : "stdout"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedLog.logSource}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(selectedLog.date)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Message */}
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </div>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto whitespace-pre-wrap break-all font-mono">
                    {selectedLog.data?.message || "No message"}
                  </pre>
                </div>

                {/* Location */}
                {selectedLog.location && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </div>
                    <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                      {selectedLog.location}
                    </code>
                  </div>
                )}

                {/* Full Data */}
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Data
                  </div>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedLog.data, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click a log entry to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
