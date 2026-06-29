import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Wifi,
  WifiOff,
  Search,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Globe,
  Shield,
  Server,
  Loader2,
} from "lucide-react";
import { createMcpBffClient } from "../services/apiClient";
import { cn } from "../utils/cn";

const MCP_SEARCH_FILTER = "MCP-";
const MAX_LIVE_LOGS = 300;

const TAG_STYLES = {
  "MCP-Connect": {
    icon: Globe,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  "MCP-Auth": {
    icon: Shield,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  "MCP-Server": {
    icon: Server,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
};

function parseTag(message) {
  if (!message) return null;
  const match = message.match(/^\[(MCP-\w+)\]/);
  return match ? match[1] : null;
}

function getOutcomeStyle(log) {
  const msg = log.data?.message || log.message || "";
  const level = log.data?.level || log.level;
  if (
    level === "error" ||
    msg.includes("Rejected") ||
    msg.includes("failed") ||
    msg.includes("Error")
  ) {
    return {
      label: "FAIL",
      color: "text-red-700 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    };
  }
  if (level === "warn" || msg.includes("warn") || msg.includes("Bad ")) {
    return {
      label: "WARN",
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    };
  }
  if (
    msg.includes("success") ||
    msg.includes("authenticated") ||
    msg.includes("initialized") ||
    msg.includes("ready") ||
    msg.includes("created")
  ) {
    return {
      label: "OK",
      color: "text-green-700 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    };
  }
  return {
    label: "INFO",
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
  };
}

function formatTime(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  } catch {
    return dateStr;
  }
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
}

function LogRow({ log, isExpanded, onToggle }) {
  const msg =
    log.data?.message || log.message || JSON.stringify(log.data || log);
  const tag = parseTag(msg);
  const tagStyle = tag ? TAG_STYLES[tag] : null;
  const TagIcon = tagStyle?.icon || Globe;
  const outcome = getOutcomeStyle(log);
  const timestamp = log.data?.timestamp || log.timestamp || log["@timestamp"];
  const meta = log.data || {};

  return (
    <div className="border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
      <div
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer text-sm"
        onClick={onToggle}
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        )}

        <span className="text-xs text-gray-400 font-mono w-20 flex-shrink-0">
          {formatTime(timestamp)}
        </span>

        {tag && (
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0",
              tagStyle?.bg,
              tagStyle?.color,
            )}
          >
            {tag.replace("MCP-", "")}
          </span>
        )}

        <span
          className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0",
            outcome.bg,
            outcome.color,
          )}
        >
          {outcome.label}
        </span>

        <span className="text-gray-700 dark:text-gray-300 truncate flex-1 font-mono text-xs">
          {msg.replace(/^\[MCP-\w+\]\s*/, "")}
        </span>

        {meta.ip && (
          <span className="text-[10px] text-gray-400 flex-shrink-0 font-mono">
            {meta.ip}
          </span>
        )}

        {meta.statusCode && (
          <span
            className={cn(
              "text-[10px] font-mono flex-shrink-0",
              meta.statusCode < 400
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {meta.statusCode}
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="px-10 pb-3 text-xs space-y-1.5">
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 font-mono whitespace-pre-wrap text-gray-600 dark:text-gray-400 overflow-x-auto max-h-64 overflow-y-auto">
            {JSON.stringify(log.data || log, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function McpLogsPage() {
  // Historical state
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Live stream state
  const [liveLogs, setLiveLogs] = useState([]);
  const [liveCount, setLiveCount] = useState(0);
  const [streamConnected, setStreamConnected] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const abortRef = useRef(null);
  const reconnectRef = useRef(null);
  const logsEndRef = useRef(null);
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // UI state
  const [activeTab, setActiveTab] = useState("live");
  const [expandedId, setExpandedId] = useState(null);
  const [outcomeFilter, setOutcomeFilter] = useState("all");

  // ---- SSE stream ----
  const getStreamUrl = useCallback(() => {
    const client = createMcpBffClient();
    const base = client.defaults.baseURL;
    const params = new URLSearchParams({
      service: "mcpbff",
      search: MCP_SEARCH_FILTER,
    });
    return `${base}/logs/console/stream?${params}`;
  }, []);

  const connectStream = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const url = getStreamUrl();
      let token = null;
      const storage = localStorage.getItem("lrmwufitcheck-auth-storage");
      if (storage) {
        try {
          token = JSON.parse(storage)?.state?.accessToken;
        } catch {}
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: ac.signal,
      });

      if (!res.ok) throw new Error(`Stream error: ${res.status}`);
      setStreamConnected(true);
      setStreamError("");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let evt = "",
          data = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) evt = line.slice(7).trim();
          else if (line.startsWith("data: ")) data = line.slice(6);
          else if (line === "" && data) {
            try {
              if (evt === "console-log" && !isPausedRef.current) {
                const entry = JSON.parse(data);
                const currentSearch = searchRef.current;
                const msg = entry.data?.message || "";
                if (
                  !currentSearch ||
                  msg.toLowerCase().includes(currentSearch.toLowerCase())
                ) {
                  setLiveLogs((prev) =>
                    [
                      ...prev,
                      { ...entry, id: `live-${Date.now()}-${Math.random()}` },
                    ].slice(-MAX_LIVE_LOGS),
                  );
                  setLiveCount((c) => c + 1);
                }
              }
            } catch {}
            evt = "";
            data = "";
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setStreamError(err.message);
    } finally {
      setStreamConnected(false);
      if (abortRef.current && !abortRef.current.signal.aborted) {
        reconnectRef.current = setTimeout(connectStream, 3000);
      }
    }
  }, [getStreamUrl]);

  const disconnectStream = useCallback(() => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setStreamConnected(false);
    }
  }, []);

  // ---- Historical logs ----
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const client = createMcpBffClient();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "100",
        service: "mcpbff",
        search: MCP_SEARCH_FILTER,
      });
      if (search && search.length >= 2)
        params.set("search", `${MCP_SEARCH_FILTER}${search}`);
      const { data } = await client.get(`/logs/console?${params}`);
      setLogs(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch logs",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // ---- Lifecycle ----
  useEffect(() => {
    fetchLogs();
    connectStream();
    return () => disconnectStream();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveLogs, autoScroll]);

  // ---- Derived data ----
  const filterByOutcome = (items) => {
    if (outcomeFilter === "all") return items;
    return items.filter((log) => {
      const o = getOutcomeStyle(log);
      if (outcomeFilter === "ok") return o.label === "OK";
      if (outcomeFilter === "fail")
        return o.label === "FAIL" || o.label === "WARN";
      return true;
    });
  };

  const displayLive = useMemo(
    () => filterByOutcome(liveLogs),
    [liveLogs, outcomeFilter],
  );
  const displayHistory = useMemo(
    () => filterByOutcome(logs),
    [logs, outcomeFilter],
  );

  const stats = useMemo(() => {
    const all = [...liveLogs, ...logs];
    let ok = 0,
      fail = 0,
      warn = 0;
    for (const l of all) {
      const o = getOutcomeStyle(l);
      if (o.label === "OK") ok++;
      else if (o.label === "FAIL") fail++;
      else if (o.label === "WARN") warn++;
    }
    return { ok, fail, warn, total: all.length };
  }, [liveLogs, logs]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              MCP Connection Logs
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              External tool connections, authentication, and session lifecycle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
              {stats.ok} OK
            </span>
            <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">
              {stats.fail} Fail
            </span>
            <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
              {stats.warn} Warn
            </span>
          </div>

          {/* Stream indicator */}
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full",
              streamConnected
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500",
            )}
          >
            {streamConnected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {streamConnected ? "Live" : "Disconnected"}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {/* Tabs */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
          {[
            { id: "live", label: `Live (${liveCount})` },
            { id: "history", label: `History (${total})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                activeTab === tab.id
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Outcome filter */}
        <select
          value={outcomeFilter}
          onChange={(e) => setOutcomeFilter(e.target.value)}
          className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <option value="all">All outcomes</option>
          <option value="ok">Success only</option>
          <option value="fail">Failures only</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter logs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {activeTab === "live" && (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? (
                  <Play className="w-3.5 h-3.5" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => {
                  setLiveLogs([]);
                  setLiveCount(0);
                }}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Clear live logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {activeTab === "history" && (
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", loading && "animate-spin")}
              />
            </button>
          )}
        </div>
      </div>

      {/* Stream error */}
      {streamError && (
        <div className="px-6 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Stream error: {streamError}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "live" ? (
          displayLive.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-2">
              <Wifi className="w-8 h-8" />
              <p className="text-sm">Waiting for MCP connection events...</p>
              <p className="text-xs">
                Connect an external tool (Cursor, Claude Desktop, Lovable) to
                see live logs
              </p>
            </div>
          ) : (
            <>
              {displayLive.map((log) => (
                <LogRow
                  key={log.id || log._id}
                  log={log}
                  isExpanded={expandedId === (log.id || log._id)}
                  onToggle={() =>
                    setExpandedId(
                      expandedId === (log.id || log._id)
                        ? null
                        : log.id || log._id,
                    )
                  }
                />
              ))}
              <div ref={logsEndRef} />
            </>
          )
        ) : (
          <>
            {loading && logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading logs...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500 gap-2 text-sm">
                <XCircle className="w-5 h-5" />
                {error}
              </div>
            ) : displayHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <Clock className="w-8 h-8" />
                <p className="text-sm">No MCP connection logs found</p>
              </div>
            ) : (
              displayHistory.map((log, i) => (
                <LogRow
                  key={log._id || log.id || i}
                  log={log}
                  isExpanded={expandedId === (log._id || log.id || i)}
                  onToggle={() =>
                    setExpandedId(
                      expandedId === (log._id || log.id || i)
                        ? null
                        : log._id || log.id || i,
                    )
                  }
                />
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
