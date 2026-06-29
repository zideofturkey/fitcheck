import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Database,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Link as LinkIcon,
  Code2,
  FileJson,
  Play,
  Lock,
  Unlock,
  Shield,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
} from "lucide-react";
import { createServiceClient, mcpBffClient } from "../services/apiClient";
import { cn } from "../utils/cn";

import toast from "react-hot-toast";

import RecordFormPanel from "../components/service/RecordFormPanel";

// Relation Cell Component with tooltip
function RelationCell({ value, joinedData, propertyConfig }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cellRef = useRef(null);

  // Find display name from joined data
  const getDisplayName = () => {
    if (!joinedData || typeof joinedData !== "object") {
      // No joined data, show the ID value
      return value ? String(value) : "-";
    }

    // Look for name-like properties in order of preference
    const nameProps = [
      "name",
      "fullname",
      "title",
      "displayName",
      "label",
      "description",
    ];
    for (const prop of nameProps) {
      if (joinedData[prop]) {
        return String(joinedData[prop]);
      }
    }

    // Find first property that contains 'name' in its key
    const nameKey = Object.keys(joinedData).find(
      (key) => key.toLowerCase().includes("name") && joinedData[key],
    );
    if (nameKey) {
      return String(joinedData[nameKey]);
    }

    // Fallback to ID or first string property
    if (joinedData.id) return `#${joinedData.id}`;

    const firstStringProp = Object.entries(joinedData).find(
      ([k, v]) => typeof v === "string" && v && !k.startsWith("_"),
    );
    return firstStringProp ? String(firstStringProp[1]) : String(value || "-");
  };

  const displayName = getDisplayName();
  const hasJoinedData = joinedData && typeof joinedData === "object";

  return (
    <div
      ref={cellRef}
      className="relative inline-flex items-center gap-1.5 max-w-full"
      onMouseEnter={() => hasJoinedData && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <LinkIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
      <span
        className={cn(
          "truncate",
          hasJoinedData &&
            "text-primary-600 dark:text-primary-400 cursor-help underline decoration-dotted",
        )}
        title={!hasJoinedData ? `ID: ${value}` : undefined}
      >
        {displayName}
      </span>

      {/* Tooltip with full object details */}
      {showTooltip && hasJoinedData && (
        <div className="absolute left-0 bottom-full mb-2 z-50 animate-fade-in">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg p-3 min-w-[200px] max-w-[320px]">
            <div className="font-semibold text-primary-300 mb-2 border-b border-gray-700 dark:border-gray-600 pb-1">
              {propertyConfig?.relation?.targetObject || "Related Object"}
            </div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {Object.entries(joinedData)
                .filter(([key]) => !key.startsWith("_"))
                .slice(0, 10)
                .map(([key, val]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-gray-400 flex-shrink-0">{key}:</span>
                    <span className="text-gray-100 truncate">
                      {val === null || val === undefined
                        ? "-"
                        : typeof val === "object"
                          ? JSON.stringify(val).slice(0, 50)
                          : String(val).slice(0, 50)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute left-4 bottom-0 transform translate-y-full">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900 dark:border-t-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}

// Copy Button Component
function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        copied
          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600",
        className,
      )}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

// Key-Value Grid Editor Component
// readOnly: if true, keys are readonly and no add/delete buttons
function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  readOnly = false,
}) {
  const addRow = () => {
    if (readOnly) return;
    onChange([...items, { key: "", value: "", enabled: true }]);
  };

  const updateRow = (index, field, value) => {
    // In readOnly mode, only allow value changes
    if (readOnly && field === "key") return;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const removeRow = (index) => {
    if (readOnly) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const toggleRow = (index) => {
    if (readOnly) return;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], enabled: !newItems[index].enabled };
    onChange(newItems);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
        {!readOnly && <div className="w-6"></div>}
        <div className="flex-1">{keyPlaceholder}</div>
        <div className="flex-1">{valuePlaceholder}</div>
        {!readOnly && <div className="w-8"></div>}
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-400 text-center">
            No {keyPlaceholder.toLowerCase()}s
          </div>
        )}
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 border-b border-gray-100 dark:border-gray-800",
              !item.enabled && "opacity-50",
            )}
          >
            {/* Checkbox - hidden in readOnly mode */}
            {!readOnly && (
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={() => toggleRow(index)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              />
            )}

            {/* Key input/display */}
            {readOnly ? (
              <div className="flex-1 px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded">
                :{item.key}
              </div>
            ) : (
              <input
                type="text"
                value={item.key}
                onChange={(e) => updateRow(index, "key", e.target.value)}
                placeholder={keyPlaceholder}
                className="flex-1 px-2 py-1 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-primary-500"
              />
            )}

            {/* Value input */}
            <input
              type="text"
              value={item.value}
              onChange={(e) => updateRow(index, "value", e.target.value)}
              placeholder={readOnly ? `Enter ${item.key}` : valuePlaceholder}
              className={cn(
                "flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:border-primary-500",
                readOnly
                  ? "bg-white dark:bg-gray-900 border-primary-300 dark:border-primary-600"
                  : "bg-transparent border-gray-200 dark:border-gray-700",
              )}
            />

            {/* Delete button - hidden in readOnly mode */}
            {!readOnly && (
              <button
                onClick={() => removeRow(index)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* Add row button - hidden in readOnly mode */}
        {!readOnly && (
          <button
            onClick={addRow}
            className="w-full px-2 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-left flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {keyPlaceholder.toLowerCase()}
          </button>
        )}
      </div>
    </div>
  );
}

// API Tester Component - Postman-like interface
function ApiTester({ serviceName, apiName, apiDetails }) {
  const [requestTab, setRequestTab] = useState("headers"); // 'body', 'headers', 'query', 'params'
  const [requestBody, setRequestBody] = useState("{}");
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [queryParams, setQueryParams] = useState([]);
  const [pathParams, setPathParams] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useAuth, setUseAuth] = useState(true);
  const [resetCounter, setResetCounter] = useState(0); // Trigger reinitialization
  const [aiCompleteLoading, setAiCompleteLoading] = useState(false);

  // LocalStorage key for this API's test state
  const storageKey = `api-tester-${serviceName}-${apiName}`;

  // Save state to localStorage (debounced)
  const saveStateRef = useRef(null);

  useEffect(() => {
    // Clear previous timeout
    if (saveStateRef.current) {
      clearTimeout(saveStateRef.current);
    }

    // Don't save during initial render or if no API selected
    if (!serviceName || !apiName) return;

    // Debounce saving to avoid excessive writes
    saveStateRef.current = setTimeout(() => {
      try {
        const state = {
          requestBody,
          headers,
          queryParams,
          pathParams,
          response,
          useAuth,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        console.error("[API Tester] Failed to save state:", e);
      }
    }, 500); // 500ms debounce

    return () => {
      if (saveStateRef.current) {
        clearTimeout(saveStateRef.current);
      }
    };
  }, [
    storageKey,
    requestBody,
    headers,
    queryParams,
    pathParams,
    response,
    useAuth,
  ]);

  // Load state from localStorage
  const loadStateFromStorage = useCallback(() => {
    if (!serviceName || !apiName) return null;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("[API Tester] Failed to load state:", e);
    }
    return null;
  }, [serviceName, apiName, storageKey]);

  // Clear saved state and reset to defaults
  const clearSavedState = useCallback(() => {
    if (serviceName && apiName) {
      localStorage.removeItem(storageKey);
    }
    // Trigger reinitialization by incrementing reset counter
    setResetCounter((c) => c + 1);
  }, [serviceName, apiName, storageKey]);

  // Determine which tabs to show based on API config
  const method = (apiDetails?.method || "GET").toUpperCase();
  const hasBody = method === "POST" || method === "PATCH" || method === "PUT";
  const hasPathParams = pathParams.length > 0;

  // Get auth token from localStorage - use the same key as apiClient
  const AUTH_STORAGE_KEY = "lrmwufitcheck-auth-storage";

  const getAuthToken = () => {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        const parsed = JSON.parse(authData);
        // The auth storage structure is { state: { accessToken: ... } }
        const token =
          parsed.state?.accessToken ||
          parsed.accessToken ||
          parsed.token ||
          null;
        return token;
      }
    } catch (e) {
      console.error("[API Tester] Failed to get auth token:", e);
    }
    return null;
  };

  // Check if we have a valid auth token
  const hasAuthToken = (() => {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        const parsed = JSON.parse(authData);
        return !!(
          parsed.state?.accessToken ||
          parsed.accessToken ||
          parsed.token
        );
      }
    } catch (e) {}
    return false;
  })();

  // Build request URL with path params and query params
  // Uses routePath from apiDetails which comes from mcp-bff (compiled API data)
  const buildUrl = () => {
    let path = apiDetails?.routePath || "/";
    // Replace path parameters
    pathParams.forEach((p) => {
      if (p.enabled && p.value) {
        path = path.replace(`:${p.key}`, p.value);
        path = path.replace(`{${p.key}}`, p.value);
      }
    });
    // Add query params
    const enabledQueryParams = queryParams.filter((p) => p.enabled && p.key);
    if (enabledQueryParams.length > 0) {
      const queryString = enabledQueryParams
        .map(
          (p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`,
        )
        .join("&");
      path += (path.includes("?") ? "&" : "?") + queryString;
    }
    return path;
  };

  // Initialize request body, params, and path params from API details or localStorage
  useEffect(() => {
    if (!apiDetails) return;

    const methodType = (apiDetails.method || "GET").toUpperCase();

    // Extract path parameters from route (e.g., :id or {id})
    // Uses routePath from apiDetails which comes from mcp-bff (compiled API data)
    const routePath = apiDetails?.routePath || "";
    const pathMatches = routePath.match(/:(\w+)/g) || [];
    const extractedPathParams = [];
    const seenParams = new Set();
    pathMatches.forEach((match) => {
      const paramName = match.replace(/[:{}]/g, "");
      if (!seenParams.has(paramName)) {
        seenParams.add(paramName);
        extractedPathParams.push({
          key: paramName,
          value: "",
          enabled: true,
        });
      }
    });

    // Try to load saved state from localStorage
    const savedState = loadStateFromStorage();

    if (savedState) {
      // Restore saved state
      setRequestBody(savedState.requestBody || "{}");
      setHeaders(
        savedState.headers || [
          { key: "Content-Type", value: "application/json", enabled: true },
        ],
      );
      setQueryParams(savedState.queryParams || []);
      // Merge saved path params with current path params (in case route changed)
      const mergedPathParams = extractedPathParams.map((p) => {
        const saved = (savedState.pathParams || []).find(
          (sp) => sp.key === p.key,
        );
        return saved || p;
      });
      setPathParams(mergedPathParams);
      setResponse(savedState.response || null);
      setUseAuth(savedState.useAuth !== undefined ? savedState.useAuth : true);
      setError(null);

      // Set default tab based on what's available
      if (
        methodType === "POST" ||
        methodType === "PATCH" ||
        methodType === "PUT"
      ) {
        setRequestTab("body");
      } else if (mergedPathParams.length > 0) {
        setRequestTab("params");
      } else {
        setRequestTab("query");
      }
    } else {
      // Initialize from API details (default behavior)
      setPathParams(extractedPathParams);

      // Build initial query params from API parameters
      const queryParamsList = (apiDetails.parameters || []).filter(
        (p) => p.location === "query",
      );
      setQueryParams(
        queryParamsList.map((p) => ({
          key: p.name,
          value: "",
          enabled: false,
        })),
      );

      // Build initial request body from parameters (only for POST/PATCH/PUT)
      if (
        methodType === "POST" ||
        methodType === "PATCH" ||
        methodType === "PUT"
      ) {
        const bodyParams = (apiDetails.parameters || []).filter(
          (p) =>
            p.location === "body" ||
            p.httpLocation === "body" ||
            (!p.location &&
              !p.httpLocation &&
              !["query", "path", "header"].includes(p.location)),
        );
        if (bodyParams.length > 0) {
          const body = {};
          bodyParams.forEach((p) => {
            // Use default value if provided, otherwise use type placeholder
            if (p.default !== undefined && p.default !== null) {
              body[p.name] = p.default;
            } else {
              // Generate placeholder based on type
              const typeName = (p.type || "String").toLowerCase();
              switch (typeName) {
                case "boolean":
                  body[p.name] = false;
                  break;
                case "number":
                case "integer":
                case "double":
                case "float":
                  body[p.name] = 0;
                  break;
                case "array":
                  body[p.name] = [];
                  break;
                case "object":
                  body[p.name] = {};
                  break;
                case "date":
                  body[p.name] = "<Date>";
                  break;
                case "id":
                  body[p.name] = "<ID>";
                  break;
                case "email":
                  body[p.name] = "<Email>";
                  break;
                case "url":
                  body[p.name] = "<URL>";
                  break;
                case "phone":
                  body[p.name] = "<Phone>";
                  break;
                case "text":
                  body[p.name] = "<Text>";
                  break;
                case "enum":
                  body[p.name] = "<Enum>";
                  break;
                default:
                  // For String and other types, use <Type> placeholder
                  body[p.name] = `<${p.type || "String"}>`;
              }
            }
          });
          setRequestBody(JSON.stringify(body, null, 2));
        } else {
          setRequestBody("{}");
        }
      } else {
        setRequestBody("{}");
      }

      // Reset headers to default
      setHeaders([
        { key: "Content-Type", value: "application/json", enabled: true },
      ]);

      // Reset response when API changes
      setResponse(null);
      setError(null);

      // Set default tab based on what's available
      if (
        methodType === "POST" ||
        methodType === "PATCH" ||
        methodType === "PUT"
      ) {
        setRequestTab("body");
      } else if (extractedPathParams.length > 0) {
        setRequestTab("params");
      } else {
        setRequestTab("query");
      }
    }
  }, [
    apiDetails?.name,
    serviceName,
    apiName,
    resetCounter,
    loadStateFromStorage,
  ]);

  // Send API request
  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const method = (apiDetails?.method || "GET").toUpperCase();
      const url = buildUrl();
      const token = useAuth ? getAuthToken() : null;

      // Build headers from state
      const requestHeaders = {};
      headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
          requestHeaders[h.key] = h.value;
        });
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }

      // Get service base URL - use environment variable if available, otherwise use localhost:port
      const serviceConfig = SERVICE_CONFIGS[serviceName?.toLowerCase()];
      const servicePort = serviceConfig?.port || 3000;

      // Check for environment-specific base URLs
      // Format: VITE_{SERVICENAME}_URL (e.g., VITE_BRANCHSTAFF_URL, VITE_AUTH_URL)
      const envKey = `VITE_${serviceName?.toUpperCase().replace(/-/g, "_")}_URL`;
      const envBaseUrl = import.meta.env[envKey];
      const baseUrl = envBaseUrl || `http://localhost:${servicePort}`;

      const config = {
        method,
        url: `${baseUrl}${url}`,
        headers: requestHeaders,
      };

      // Add body for non-GET requests
      if (method !== "GET" && method !== "DELETE") {
        try {
          config.data = JSON.parse(requestBody);
        } catch (e) {
          setError("Invalid JSON in request body");
          setLoading(false);
          return;
        }
      }

      const startTime = Date.now();
      const res = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
      });

      const elapsed = Date.now() - startTime;
      const contentType = res.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        elapsed,
        headers: Object.fromEntries(res.headers.entries()),
        data,
      });
    } catch (err) {
      setError(err.message || "Request failed");
      setResponse({
        status: 0,
        statusText: "Error",
        elapsed: 0,
        data: { error: err.message },
      });
    } finally {
      setLoading(false);
    }
  };

  // AI Complete - auto-fill body with realistic data
  const handleAiComplete = async () => {
    const method = (apiDetails?.method || "GET").toUpperCase();
    if (!["POST", "PATCH", "PUT"].includes(method)) return;

    setAiCompleteLoading(true);
    try {
      const token = useAuth ? getAuthToken() : null;

      // Always pass empty body to force fresh generation
      // AI Complete should always generate new values
      const currentBody = {};

      // Get user context from session storage
      const userContext = {};
      try {
        const authData = localStorage.getItem("lrmwufitcheck-auth-storage");
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed.state?.userId) {
            userContext.userId = parsed.state.userId;
          }
        }
      } catch (e) {
        // Ignore errors
      }

      const response = await mcpBffClient.post(
        "/ai-complete/body",
        {
          serviceName,
          apiName,
          currentBody,
          userContext,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 60000, // AI with tools may take longer
        },
      );

      if (response.data.success && response.data.body) {
        setRequestBody(JSON.stringify(response.data.body, null, 2));
        setRequestTab("body");
        setError(null);
      } else if (response.data.error) {
        // Show AI error in the body panel so user can see what happened
        setRequestBody(
          JSON.stringify(
            {
              _aiError: response.data.error,
              _aiResponse: response.data.aiResponse || null,
            },
            null,
            2,
          ),
        );
        setRequestTab("body");
        setError("AI Complete: " + response.data.error);
      }
    } catch (err) {
      console.error("[API Tester] AI Complete failed:", err);
      setError(
        "AI Complete failed: " +
          (err.response?.data?.message ||
            err.response?.data?.error ||
            err.message),
      );
    } finally {
      setAiCompleteLoading(false);
    }
  };

  const responseText = response?.data
    ? JSON.stringify(response.data, null, 2)
    : "";

  return (
    <div className="flex flex-col h-full">
      {/* Header with URL and Send button */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          {/* Method badge */}
          <span
            className={cn(
              "px-2 py-1 text-xs font-bold rounded",
              METHOD_COLORS[apiDetails?.method] || METHOD_COLORS.GET,
            )}
          >
            {apiDetails?.method || "GET"}
          </span>

          {/* URL display */}
          <div className="flex-1 font-mono text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-600 truncate">
            {buildUrl()}
          </div>

          {/* Auth toggle */}
          <button
            onClick={() => setUseAuth((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors",
              useAuth
                ? hasAuthToken
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
            )}
            title={
              useAuth
                ? hasAuthToken
                  ? "Auth enabled with token - click to disable"
                  : "Auth enabled but no token found - click to disable"
                : "Auth disabled - click to enable"
            }
          >
            {useAuth ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
            {useAuth ? (hasAuthToken ? "Auth" : "Auth (no token)") : "No Auth"}
          </button>

          {/* New Request button */}
          <button
            onClick={clearSavedState}
            className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs font-medium transition-colors"
            title="Clear saved state and reset to defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New
          </button>

          {/* AI Complete button - only for POST/PATCH/PUT */}
          {["POST", "PATCH", "PUT"].includes(
            apiDetails?.method?.toUpperCase(),
          ) && (
            <button
              onClick={handleAiComplete}
              disabled={aiCompleteLoading}
              className="flex items-center gap-1.5 px-2 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded text-xs font-medium transition-colors disabled:opacity-50"
              title="Auto-fill body with realistic data using AI"
            >
              {aiCompleteLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              AI Complete
            </button>
          )}

          {/* Send button */}
          <button
            onClick={sendRequest}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded font-medium text-sm transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Send
          </button>
        </div>
      </div>

      {/* Main content - Request/Response panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Request Panel - 1/2 width */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
          {/* Tab navigation */}
          <div className="flex-shrink-0 flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {/* Body tab - only for POST, PATCH, PUT */}
            {hasBody && (
              <button
                onClick={() => setRequestTab("body")}
                className={cn(
                  "px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
                  requestTab === "body"
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700",
                )}
              >
                Body
              </button>
            )}

            {/* Headers tab - always visible */}
            <button
              onClick={() => setRequestTab("headers")}
              className={cn(
                "px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
                requestTab === "headers"
                  ? "border-primary-600 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700",
              )}
            >
              Headers
              {headers.filter((h) => h.enabled && h.key).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  {headers.filter((h) => h.enabled && h.key).length}
                </span>
              )}
            </button>

            {/* Query tab - always visible */}
            <button
              onClick={() => setRequestTab("query")}
              className={cn(
                "px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
                requestTab === "query"
                  ? "border-primary-600 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700",
              )}
            >
              Query
              {queryParams.filter((p) => p.enabled && p.key).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  {queryParams.filter((p) => p.enabled && p.key).length}
                </span>
              )}
            </button>

            {/* Params tab - only if URL has path parameters */}
            {hasPathParams && (
              <button
                onClick={() => setRequestTab("params")}
                className={cn(
                  "px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
                  requestTab === "params"
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700",
                )}
              >
                Params
                {pathParams.filter((p) => p.enabled && p.value).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-200 dark:bg-green-700 rounded-full">
                    {pathParams.filter((p) => p.enabled && p.value).length}
                  </span>
                )}
              </button>
            )}

            <div className="flex-1" />
            {requestTab === "body" && (
              <CopyButton text={requestBody} className="mr-2 my-1" />
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {requestTab === "body" && hasBody && (
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-full p-3 font-mono text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
                placeholder="{}"
                spellCheck={false}
              />
            )}
            {requestTab === "headers" && (
              <KeyValueEditor
                items={headers}
                onChange={setHeaders}
                keyPlaceholder="Header"
                valuePlaceholder="Value"
              />
            )}
            {requestTab === "query" && (
              <KeyValueEditor
                items={queryParams}
                onChange={setQueryParams}
                keyPlaceholder="Parameter"
                valuePlaceholder="Value"
              />
            )}
            {requestTab === "params" && hasPathParams && (
              <KeyValueEditor
                items={pathParams}
                onChange={setPathParams}
                keyPlaceholder="Path Parameter"
                valuePlaceholder="Value"
                readOnly={true}
              />
            )}
          </div>
        </div>

        {/* Response Panel - 1/2 width */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                Response
              </span>
              {response && (
                <>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-xs font-medium rounded",
                      response.status >= 200 && response.status < 300
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : response.status >= 400
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                    )}
                  >
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-xs text-gray-500">
                    {response.elapsed}ms
                  </span>
                </>
              )}
            </div>
            {responseText && <CopyButton text={responseText} />}
          </div>
          <div className="flex-1 overflow-auto p-3 bg-gray-50 dark:bg-gray-900">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : error && !response ? (
              <div className="text-red-500 text-sm">{error}</div>
            ) : response ? (
              <pre className="font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {responseText}
              </pre>
            ) : (
              <div className="text-gray-400 text-sm text-center mt-8">
                Click Send to execute the API
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Service configurations with their data objects
const SERVICE_CONFIGS = {
  invitationcenter: {
    name: "invitationcenter",
    fullname: "invitationcenter",
    port: 3050,
    dataObjects: [
      {
        name: "inviteLink",
        modelName: "InviteLink",
        description:
          "Stores a unique invite registration token with usage rules, lifecycle state, delivery tracking, and a reference to the registered user created as a result of the invite.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "ownerUserId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "inviteCode",
            type: "String",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "invitedEmail",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "usageMode",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "usageLimit",
            type: "Integer",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "usageCount",
            type: "Integer",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "inviteState",
            type: "Enum",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "expiresAt",
            type: "Date",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lastUsedAt",
            type: "Date",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "registeredUserId",
            type: "ID",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "deliveryRequestedAt",
            type: "Date",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lastDeliveredAt",
            type: "Date",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "inviteAudit",
        modelName: "InviteAudit",
        description:
          "Append-only audit log capturing every lifecycle event on an invite link, including who acted, what happened, and optional contextual notes.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "inviteLinkId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "inviteLink",
              targetObject: "inviteLink",
              targetKey: "id",
            },
          },
          {
            name: "eventType",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "eventAt",
            type: "Date",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "actorUserId",
            type: "ID",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "eventNote",
            type: "String",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "relatedEmail",
            type: "String",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
    ],
    businessApis: [
      {
        name: "createInviteLink",
        description:
          "Creates a new invite link with a generated unique code. Restricted to admins. The invite starts in 'draft' state and must be explicitly activated before use.",
        frontendDocument:
          "Triggered from the admin invite management panel via a 'Create Invite' button. Opens a modal/slide-over form. `usageLimit` field should be shown conditionally (only when `usageMode === 'limitedUse'`). `sellerId`/`ownerUserId` is auto-populated from session — do NOT show in form. On 201: close modal, refresh list, toast 'Invite link created'. On 400: show inline validation errors.",
        crudType: "create",
        dataObjectName: "inviteLink",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/invite-links",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "invitedEmail",
            type: "String",
            required: false,
            description: "Optional intended recipient email address",
            httpLocation: "body",
          },
          {
            name: "usageMode",
            type: "Enum",
            required: true,
            description:
              "Whether the invite can be used once (singleUse) or a limited number of times (limitedUse)",
            httpLocation: "body",
          },
          {
            name: "usageLimit",
            type: "Integer",
            required: false,
            description:
              "Maximum number of allowed uses; required when usageMode=limitedUse",
            httpLocation: "body",
          },
          {
            name: "expiresAt",
            type: "Date",
            required: false,
            description: "Optional expiry date; null means no expiry",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "activateInviteLink",
        description:
          "Transitions an invite link from 'draft' to 'active' state, making it usable for registration. Only invite links in 'draft' state can be activated.",
        frontendDocument:
          "Triggered from the invite list or detail view via an 'Activate' action button (shown only when inviteState='draft'). No form input needed — just a confirmation dialog. On 200: update the status badge inline or refresh row. Toast 'Invite link activated'. On 400: toast 'Invite link is not in draft state'.",
        crudType: "update",
        dataObjectName: "inviteLink",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/invite-links/:inviteLinkId/activate",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "revokeInviteLink",
        description:
          "Revokes an invite link, preventing further use. Only invite links in 'draft' or 'active' states can be revoked. An optional reason note can be provided.",
        frontendDocument:
          "Triggered from the invite list or detail view via a 'Revoke' action button (shown when inviteState is 'draft' or 'active'). Opens a small confirmation dialog with optional 'Reason' text input. On 200: update badge to 'revoked'. Toast 'Invite link revoked'. On 400: toast with server error message.",
        crudType: "update",
        dataObjectName: "inviteLink",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/invite-links/:inviteLinkId/revoke",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "eventNote",
            type: "String",
            required: false,
            description: "Optional reason for revocation",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "deliverInviteEmail",
        description:
          "Triggers email delivery of an active invite link to its intended recipient. Sets deliveryRequestedAt and publishes a Kafka event for the notification service to handle. The invite must be in 'active' state and must have an invitedEmail set.",
        frontendDocument:
          "Triggered from the invite detail view via a 'Send Email' button (shown when inviteState='active' and invitedEmail is set). No form input. On 200: show 'Email delivery requested' toast and update `deliveryRequestedAt` display. On 400: show inline error from server.",
        crudType: "update",
        dataObjectName: "inviteLink",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/invite-links/:inviteLinkId/deliver",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "validateInviteCode",
        description:
          "Public endpoint that validates an invite code, increments its usage count, and updates its state. Used by the registration flow before creating a new user account. Raises an API event on success.",
        frontendDocument:
          "Called by the frontend registration page after the user submits their invite code. If the invite is valid, proceed to the account creation form. On 400 with 'expired': show 'This invite link has expired'. On 400 with 'limit reached': show 'This invite has already been used the maximum number of times'. On 404 (no active record found): show 'Invalid or inactive invite code'.",
        crudType: "update",
        dataObjectName: "inviteLink",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/invite-links/validate",
        loginRequired: false,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteCode",
            type: "String",
            required: true,
            description: "The unique invite token to validate",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "consumeInviteLink",
        description:
          "Marks an invite link as consumed and records the registered user ID. Called by the auth service or an admin workflow after successful user registration. Raises an API event.",
        frontendDocument:
          "This is a machine-to-machine or admin-only operation — not directly user-triggered. No dedicated UI form. In the admin audit view it appears as a 'consumed' event in the timeline. After calling this API, the invite detail should show `registeredUserId` as a linked user.",
        crudType: "update",
        dataObjectName: "inviteLink",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/invite-links/:inviteLinkId/consume",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "registeredUserId",
            type: "ID",
            required: true,
            description: "The auth user id created from this invite",
            httpLocation: "body",
          },
          {
            name: "relatedEmail",
            type: "String",
            required: false,
            description: "Registered email for audit record",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "getInviteLinkByCode",
        description:
          "Public endpoint to fetch invite link metadata by its unique code. Used by the registration page to display invite details before the user fills in their credentials.",
        frontendDocument:
          "Called automatically on the `/register?code=<inviteCode>` page load. No user action required. Display invite metadata: `invitedEmail` (pre-fill the email input), `usageMode` badge, `expiresAt` (show 'No expiry' if null). If 404: show a full-page 'Invalid invite link' error with a link to contact support.",
        crudType: "get",
        dataObjectName: "inviteLink",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/invite-links/by-code/:inviteCode",
        loginRequired: false,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteCode",
            type: "String",
            required: true,
            description:
              "This parameter will be used to select the data object that is queried",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "getInviteLink",
        description: "Admin endpoint to fetch a single invite link by its ID.",
        frontendDocument:
          "Used when navigating to the invite detail view (`/admin/invites/:inviteLinkId`). Loads the full invite record for display. Show all fields including audit trail (loaded separately via listInviteAudits filtered by inviteLinkId).",
        crudType: "get",
        dataObjectName: "inviteLink",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/invite-links/:inviteLinkId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listInviteLinks",
        description:
          "Admin endpoint to list all invite links with optional filtering by usageMode and inviteState (auto-filter parameters).",
        frontendDocument:
          "Renders the admin invite management table. Filters are exposed as query params: `?usageMode=singleUse` and/or `?inviteState=active`. Sort by `createdAt` descending (newest first). Default page size 20. Empty state: 'No invite links found — try adjusting filters or create a new invite.'",
        crudType: "list",
        dataObjectName: "inviteLink",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/invite-links",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "usageMode",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "inviteState",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "listInviteAudits",
        description:
          "Admin endpoint to list audit log entries for invite links. Filterable by inviteLinkId and eventType.",
        frontendDocument:
          "Loaded in the invite detail drawer/sub-panel. Always called with `?inviteLinkId=<id>` filter to show the audit trail for a specific invite. Displayed as a timeline (oldest first). If loading the full audit list in the admin view without a specific invite, no inviteLinkId filter is applied — admins can see all events.",
        crudType: "list",
        dataObjectName: "inviteAudit",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/invite-audits",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "eventType",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListInviteLink",
        description:
          "System API to fetch list of inviteLink records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "inviteLink",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistinvitelink",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "usageMode",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "inviteState",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListInviteAudit",
        description:
          "System API to fetch list of inviteAudit records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "inviteAudit",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistinviteaudit",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "eventType",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
    ],
  },
  nutritionlibrary: {
    name: "nutritionlibrary",
    fullname: "nutritionlibrary",
    port: 3051,
    dataObjects: [
      {
        name: "macroTarget",
        modelName: "MacroTarget",
        description:
          "Stores the authenticated user's six daily macro targets (calories, protein, carbohydrates, fat, sugar, fiber). Each user has one active target record; updating replaces the effective values.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "user",
              targetObject: "user",
              targetKey: "id",
            },
          },
          {
            name: "calorieTarget",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "proteinTarget",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "carbohydrateTarget",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "fatTarget",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "sugarTarget",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "fiberTarget",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "effectiveFrom",
            type: "Date",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "foodItem",
        modelName: "FoodItem",
        description:
          "A private, reusable food definition in the user's personal food library. Stores per-100g nutrition values. Editable at any time without affecting historical meal log snapshots.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "user",
              targetObject: "user",
              targetKey: "id",
            },
          },
          {
            name: "foodName",
            type: "String",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: true,
            relation: null,
          },
          {
            name: "caloriePer100g",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "proteinPer100g",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "carbohydratePer100g",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "fatPer100g",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "sugarPer100g",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "fiberPer100g",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "brandName",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "foodCategory",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "creationSource",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "presetMeal",
        modelName: "PresetMeal",
        description:
          "A reusable preset meal template owned by a user. Stores auto-calculated aggregate nutrition totals derived from its constituent preset lines. Mutations during meal logging must never affect this record.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "user",
              targetObject: "user",
              targetKey: "id",
            },
          },
          {
            name: "templateName",
            type: "String",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: true,
            relation: null,
          },
          {
            name: "descriptionText",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalCalories",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalProtein",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalCarbohydrates",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalFat",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalSugar",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalFiber",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "presetLine",
        modelName: "PresetLine",
        description:
          "A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "presetMealId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "presetMeal",
              targetObject: "presetMeal",
              targetKey: "id",
            },
          },
          {
            name: "foodItemId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "foodItem",
              targetObject: "foodItem",
              targetKey: "id",
            },
          },
          {
            name: "lineFoodName",
            type: "String",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: true,
            relation: null,
          },
          {
            name: "gramAmount",
            type: "Double",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lineCalories",
            type: "Double",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lineProtein",
            type: "Double",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lineCarbohydrates",
            type: "Double",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lineFat",
            type: "Double",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lineSugar",
            type: "Double",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lineFiber",
            type: "Double",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
    ],
    businessApis: [
      {
        name: "setMacroTarget",
        description:
          "Upsert-style API: soft-deletes any existing active macro target for the user before creating a fresh one.",
        frontendDocument:
          "Triggered by the Save button on the Macro Targets page. All six target fields are required. On 201, show a toast 'Macro targets updated' and reflect new values in the UI. userId is auto-populated from session — never ask the user for it. effectiveFrom is system-set.",
        crudType: "create",
        dataObjectName: "macroTarget",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/macro-targets",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "calorieTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "proteinTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "carbohydrateTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fatTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "sugarTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fiberTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "getMyMacroTarget",
        description:
          "Fetch the authenticated user's current active macro target.",
        frontendDocument:
          "Called on page load of the Macro Targets page. Returns the current active target to pre-fill the form. If response is 404, show the form empty with placeholder hint values.",
        crudType: "get",
        dataObjectName: "macroTarget",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/macro-targets/me",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [],
      },
      {
        name: "createFoodItem",
        description: "Create a food item in the user's personal food library.",
        frontendDocument:
          "Triggered from 'Add Food' form on the Food Library page, or programmatically by the AI assistant. All per-100g fields are required. brandName and foodCategory are optional. creationSource defaults to manualEntry. On 201, append to the food list and show a toast 'Food saved'. userId is auto-populated from session.",
        crudType: "create",
        dataObjectName: "foodItem",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/food-items",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "foodName",
            type: "String",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "caloriePer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "proteinPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "carbohydratePer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fatPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "sugarPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fiberPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "brandName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "foodCategory",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "creationSource",
            type: "Enum",
            required: false,
            default: "manualEntry",
            description: "",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "getFoodItem",
        description: "Fetch a single food item by id. Ownership enforced.",
        frontendDocument:
          "Called when the user opens a food item detail view or edit drawer. Returns full per-100g fields for display and editing.",
        crudType: "get",
        dataObjectName: "foodItem",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/food-items/:foodItemId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listFoodItems",
        description:
          "List the authenticated user's food items. Supports optional text search on foodName, and auto-filters on foodCategory and creationSource.",
        frontendDocument:
          "Displayed on the Food Library page as a paginated list. Filter chips for foodCategory and creationSource appear at the top. A search box filters by foodName (partial, case-insensitive). Empty state: 'Your food library is empty — add your first food'. Row shows foodName, brandName (if set), caloriePer100g, and category badge.",
        crudType: "list",
        dataObjectName: "foodItem",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/food-items",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "searchTerm",
            type: "String",
            required: false,
            description: "Optional partial match on foodName",
            httpLocation: "query",
          },
          {
            name: "foodCategory",
            type: "String",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "creationSource",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "updateFoodItem",
        description:
          "Update a food item's fields. All fields are optional (partial update). Ownership enforced.",
        frontendDocument:
          "Triggered from the edit drawer on the Food Library page. All fields are optional — only changed fields need to be sent. On 200, update the list in place and close the drawer with a toast 'Food updated'. creationSource is not editable after creation.",
        crudType: "update",
        dataObjectName: "foodItem",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/food-items/:foodItemId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "foodName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "caloriePer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "proteinPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "carbohydratePer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fatPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "sugarPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fiberPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "brandName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "foodCategory",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "deleteFoodItem",
        description: "Soft-delete a food item. Ownership enforced.",
        frontendDocument:
          "Triggered from the delete button on a food item row. Show a confirmation dialog before calling. On 200, remove the item from the list with a toast 'Food deleted'.",
        crudType: "delete",
        dataObjectName: "foodItem",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/food-items/:foodItemId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "createPresetMeal",
        description:
          "Create a preset meal header. Lines are added separately via addPresetLine. Totals initialize at 0.",
        frontendDocument:
          "Triggered from 'New Preset' button on Preset Meals page. Only templateName is required. On 201, navigate to the preset detail page to add lines. Totals will show as 0 until lines are added.",
        crudType: "create",
        dataObjectName: "presetMeal",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/preset-meals",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "templateName",
            type: "String",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "descriptionText",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "getPresetMeal",
        description: "Fetch a preset meal with its lines joined.",
        frontendDocument:
          "Called when user opens a preset detail page. Returns preset header + nested lines array. Display lines sorted by creation order. Totals at the top; lines table below.",
        crudType: "get",
        dataObjectName: "presetMeal",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/preset-meals/:presetMealId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listPresetMeals",
        description: "List the authenticated user's preset meal templates.",
        frontendDocument:
          "Displayed on the Preset Meals page as a card grid. Each card shows templateName + totalCalories. Empty state: 'No presets yet — create your first meal template'. Click navigates to preset detail.",
        crudType: "list",
        dataObjectName: "presetMeal",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/preset-meals",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [],
      },
      {
        name: "updatePresetMeal",
        description:
          "Update preset meal header fields (templateName, descriptionText). Nutrition totals are NOT updated here.",
        frontendDocument:
          "Triggered from the edit icon on a preset card. Only templateName and descriptionText can be changed. On 200, update the card in place with a toast 'Preset updated'.",
        crudType: "update",
        dataObjectName: "presetMeal",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/preset-meals/:presetMealId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "templateName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "descriptionText",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "deletePresetMeal",
        description:
          "Soft-delete a preset meal and all its lines. Ownership enforced.",
        frontendDocument:
          "Triggered from the delete button on a preset card. Show confirmation dialog. On 200, remove the card from the grid with a toast 'Preset deleted'.",
        crudType: "delete",
        dataObjectName: "presetMeal",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/preset-meals/:presetMealId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "addPresetLine",
        description:
          "Add a food item line to a preset meal. Validates preset ownership and food item ownership, calculates nutrition snapshot, creates the line, then recalculates parent preset totals.",
        frontendDocument:
          "Triggered from the 'Add Food' button on the preset detail page. User selects a food from their library and enters gram amount. On 201, append the new line to the list and update displayed totals. userId is auto-populated from session.",
        crudType: "create",
        dataObjectName: "presetLine",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/preset-meals/:presetMealId/lines",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "gramAmount",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "presetMealId",
            type: "String",
            required: true,
            description:
              "This URL path parameter scopes the create operation to a parent record (typically the parent object's id).",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listPresetLines",
        description:
          "List all lines for a preset meal. Validates preset ownership. Joins food item data.",
        frontendDocument:
          "Called when loading preset detail page lines section. Returns all active lines for the given preset. Joined food data provides the current per-100g values for display.",
        crudType: "list",
        dataObjectName: "presetLine",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/preset-meals/:presetMealId/lines",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "presetMealId",
            type: "String",
            required: true,
            description:
              "This parameter will be used to select the data objects that want to be listed",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "deletePresetLine",
        description:
          "Remove a single line from a preset, then recalculate preset totals. Validates preset ownership.",
        frontendDocument:
          "Triggered from the remove button on a preset line row. On 200, remove the line from the UI and update displayed totals.",
        crudType: "delete",
        dataObjectName: "presetLine",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/preset-meals/:presetMealId/lines/:presetLineId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "presetLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
          {
            name: "presetMealId",
            type: "String",
            required: true,
            description:
              "This parameter will be used to select the data object that want to be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "getPresetMealForLogging",
        description:
          "Dedicated read API for mealTracker and nutritionAi services. Fetches a preset with full line detail for initiating a meal log.",
        frontendDocument:
          "Not directly triggered by frontend. Called by mealTracker and nutritionAi services via inter-service calls with forwardCallerToken=true. Returns the same shape as getPresetMeal.",
        crudType: "get",
        dataObjectName: "presetMeal",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/preset-meals/:presetMealId/for-logging",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "getFoodItemForLogging",
        description:
          "Dedicated read API for mealTracker and nutritionAi. Fetches full per-100g nutrition data for a food item.",
        frontendDocument:
          "Not directly triggered by frontend. Called by mealTracker and nutritionAi via inter-service calls. Returns all per-100g fields needed for nutrition calculations.",
        crudType: "get",
        dataObjectName: "foodItem",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/food-items/:foodItemId/for-logging",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "getMyMacroTargetForLogging",
        description:
          "Dedicated read API for mealTracker (dashboard progress) and nutritionAi (context-aware guidance). Fetches the authenticated user's current macro targets.",
        frontendDocument:
          "Not directly triggered by frontend. Called by mealTracker and nutritionAi via inter-service calls with forwardCallerToken=true. Returns same shape as getMyMacroTarget.",
        crudType: "get",
        dataObjectName: "macroTarget",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/macro-targets/me/for-logging",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [],
      },
      {
        name: "_fetchListMacroTarget",
        description:
          "System API to fetch list of macroTarget records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "macroTarget",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistmacrotarget",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [],
      },
      {
        name: "_fetchListFoodItem",
        description:
          "System API to fetch list of foodItem records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "foodItem",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistfooditem",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "foodCategory",
            type: "String",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "creationSource",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListPresetMeal",
        description:
          "System API to fetch list of presetMeal records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "presetMeal",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistpresetmeal",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [],
      },
      {
        name: "_fetchListPresetLine",
        description:
          "System API to fetch list of presetLine records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "presetLine",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistpresetline",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
    ],
  },
  mealtracker: {
    name: "mealtracker",
    fullname: "mealtracker",
    port: 3052,
    dataObjects: [
      {
        name: "mealLog",
        modelName: "MealLog",
        description:
          "A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "mealDate",
            type: "Date",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "mealTime",
            type: "String",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "slotName",
            type: "String",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: true,
            relation: null,
          },
          {
            name: "logSource",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "noteText",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalCalories",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalProtein",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalCarbohydrates",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalFat",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalSugar",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalFiber",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "mealLine",
        modelName: "MealLine",
        description:
          "An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "mealLogId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "mealLog",
              targetObject: "mealLog",
              targetKey: "id",
            },
          },
          {
            name: "sourceFoodItemId",
            type: "ID",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "sourcePresetMealId",
            type: "ID",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "itemName",
            type: "String",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: true,
            relation: null,
          },
          {
            name: "consumedGrams",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "itemCalories",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "itemProtein",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "itemCarbohydrates",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "itemFat",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "itemSugar",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "itemFiber",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lineSource",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "nutritionDay",
        modelName: "NutritionDay",
        description:
          "A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "summaryDate",
            type: "Date",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "consumedCalories",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "consumedProtein",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "consumedCarbohydrates",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "consumedFat",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "consumedSugar",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "consumedFiber",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "targetCalories",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "targetProtein",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "targetCarbohydrates",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "targetFat",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "targetSugar",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "targetFiber",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "exceededMetrics",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "mealCount",
            type: "Integer",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
    ],
    businessApis: [
      {
        name: "createMealLog",
        description:
          "Creates a new meal log entry with all nutrition totals and then inserts individual meal line items via a loop action. After creation, upserts the daily nutrition snapshot.",
        frontendDocument:
          "Triggered from the meal logging form (POST on submit). userId is auto-populated from session — never ask the user. Required fields: mealDate, mealTime, slotName, logSource, totalCalories, totalProtein, totalCarbohydrates, totalFat, totalSugar, totalFiber, lines[]. On 201: redirect to meal detail or refresh daily progress widget, show toast 'Meal logged successfully'. On 400/422: show inline field errors.",
        crudType: "create",
        dataObjectName: "mealLog",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/meal-logs",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealDate",
            type: "Date",
            required: true,
            description: "Date the meal was consumed",
            httpLocation: "body",
          },
          {
            name: "mealTime",
            type: "String",
            required: true,
            description: "Local time string e.g. 13:30",
            httpLocation: "body",
          },
          {
            name: "slotName",
            type: "String",
            required: true,
            description: "Fixed or custom meal slot name",
            httpLocation: "body",
          },
          {
            name: "logSource",
            type: "Enum",
            required: true,
            description: "Source of the meal log entry",
            httpLocation: "body",
          },
          {
            name: "noteText",
            type: "String",
            required: false,
            description: "Optional user notes",
            httpLocation: "body",
          },
          {
            name: "totalCalories",
            type: "Double",
            required: true,
            description: "Meal-level calorie total",
            httpLocation: "body",
          },
          {
            name: "totalProtein",
            type: "Double",
            required: true,
            description: "Meal-level protein total",
            httpLocation: "body",
          },
          {
            name: "totalCarbohydrates",
            type: "Double",
            required: true,
            description: "Meal-level carbohydrate total",
            httpLocation: "body",
          },
          {
            name: "totalFat",
            type: "Double",
            required: true,
            description: "Meal-level fat total",
            httpLocation: "body",
          },
          {
            name: "totalSugar",
            type: "Double",
            required: true,
            description: "Meal-level sugar total",
            httpLocation: "body",
          },
          {
            name: "totalFiber",
            type: "Double",
            required: true,
            description: "Meal-level fiber total",
            httpLocation: "body",
          },
          {
            name: "lines",
            type: "Object",
            required: true,
            description: "Array of meal line objects to create",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "getMealLog",
        description:
          "Retrieves a single meal log by ID, scoped to the authenticated user.",
        frontendDocument:
          "Triggered when user taps a meal card to view detail. Shows all fields including noteText and individual mealLines (loaded via a separate listMealLines call filtered by mealLogId). On 404: show 'Meal not found' and navigate back.",
        crudType: "get",
        dataObjectName: "mealLog",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/meal-logs/:mealLogId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listMealLogs",
        description:
          "Lists meal logs for the authenticated user with optional date range filtering. mealDate and logSource are auto-filtered via isFilterParameter.",
        frontendDocument:
          "Powers the meal history page. Shows paginated list grouped by date. Filter bar at top: date range picker (fromDate/toDate), source multi-select. Auto-filters for mealDate and logSource are passed as query params. On empty state: show 'No meals logged yet' with a CTA to add a meal.",
        crudType: "list",
        dataObjectName: "mealLog",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/meal-logs",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "fromDate",
            type: "Date",
            required: false,
            description: "Optional range start for multi-day queries",
            httpLocation: "query",
          },
          {
            name: "toDate",
            type: "Date",
            required: false,
            description: "Optional range end for multi-day queries",
            httpLocation: "query",
          },
          {
            name: "mealDate",
            type: "Date",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "logSource",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "updateMealLog",
        description:
          "Updates editable fields of a meal log and recomputes the nutrition day snapshot.",
        frontendDocument:
          "Triggered from the meal edit form. All fields optional — only send changed values. On success: update the meal card in the list and refresh daily progress widget. On 404: show 'Meal not found'.",
        crudType: "update",
        dataObjectName: "mealLog",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/meal-logs/:mealLogId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "mealTime",
            type: "String",
            required: false,
            description: "Updated meal time",
            httpLocation: "body",
          },
          {
            name: "slotName",
            type: "String",
            required: false,
            description: "Updated slot name",
            httpLocation: "body",
          },
          {
            name: "noteText",
            type: "String",
            required: false,
            description: "Updated notes",
            httpLocation: "body",
          },
          {
            name: "totalCalories",
            type: "Double",
            required: false,
            description: "Recalculated calorie total",
            httpLocation: "body",
          },
          {
            name: "totalProtein",
            type: "Double",
            required: false,
            description: "Recalculated protein total",
            httpLocation: "body",
          },
          {
            name: "totalCarbohydrates",
            type: "Double",
            required: false,
            description: "Recalculated carbohydrate total",
            httpLocation: "body",
          },
          {
            name: "totalFat",
            type: "Double",
            required: false,
            description: "Recalculated fat total",
            httpLocation: "body",
          },
          {
            name: "totalSugar",
            type: "Double",
            required: false,
            description: "Recalculated sugar total",
            httpLocation: "body",
          },
          {
            name: "totalFiber",
            type: "Double",
            required: false,
            description: "Recalculated fiber total",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "deleteMealLog",
        description:
          "Deletes a meal log and its associated meal lines, then recomputes the nutrition day snapshot.",
        frontendDocument:
          "Triggered from meal card delete button (with confirmation dialog). On success: remove card from list, show toast 'Meal deleted', refresh daily progress widget. On 404: show 'Meal not found'.",
        crudType: "delete",
        dataObjectName: "mealLog",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/meal-logs/:mealLogId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "createMealLine",
        description:
          "Creates an individual meal line item and then recalculates meal-level and day-level nutrition totals.",
        frontendDocument:
          "Triggered when user adds a food item to an existing meal (inline add form on meal detail). Required: mealLogId, itemName, consumedGrams, all 6 nutrition snapshot values, lineSource. userId auto-populated from session. On 201: add row to meal line list, update meal totals display. On 403: show 'This meal does not belong to you'.",
        crudType: "create",
        dataObjectName: "mealLine",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/meal-lines",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description: "FK to parent mealLog",
            httpLocation: "body",
          },
          {
            name: "itemName",
            type: "String",
            required: true,
            description: "Food item name",
            httpLocation: "body",
          },
          {
            name: "consumedGrams",
            type: "Double",
            required: true,
            description: "Grams consumed",
            httpLocation: "body",
          },
          {
            name: "itemCalories",
            type: "Double",
            required: true,
            description: "Calories snapshot",
            httpLocation: "body",
          },
          {
            name: "itemProtein",
            type: "Double",
            required: true,
            description: "Protein snapshot",
            httpLocation: "body",
          },
          {
            name: "itemCarbohydrates",
            type: "Double",
            required: true,
            description: "Carbohydrates snapshot",
            httpLocation: "body",
          },
          {
            name: "itemFat",
            type: "Double",
            required: true,
            description: "Fat snapshot",
            httpLocation: "body",
          },
          {
            name: "itemSugar",
            type: "Double",
            required: true,
            description: "Sugar snapshot",
            httpLocation: "body",
          },
          {
            name: "itemFiber",
            type: "Double",
            required: true,
            description: "Fiber snapshot",
            httpLocation: "body",
          },
          {
            name: "lineSource",
            type: "Enum",
            required: true,
            description: "Source of the line item",
            httpLocation: "body",
          },
          {
            name: "sourceFoodItemId",
            type: "ID",
            required: false,
            description: "Optional reference to nutritionLibrary foodItem",
            httpLocation: "body",
          },
          {
            name: "sourcePresetMealId",
            type: "ID",
            required: false,
            description: "Optional reference to nutritionLibrary presetMeal",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "updateMealLine",
        description:
          "Updates nutrition snapshot values of a meal line item, then recalculates meal-level and day-level totals.",
        frontendDocument:
          "Triggered from inline edit on a meal line row. All fields optional. On success: update row values and refresh meal totals strip. On 404: show 'Item not found'.",
        crudType: "update",
        dataObjectName: "mealLine",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/meal-lines/:mealLineId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "itemName",
            type: "String",
            required: false,
            description: "Updated item name",
            httpLocation: "body",
          },
          {
            name: "consumedGrams",
            type: "Double",
            required: false,
            description: "Updated grams",
            httpLocation: "body",
          },
          {
            name: "itemCalories",
            type: "Double",
            required: false,
            description: "Updated calories",
            httpLocation: "body",
          },
          {
            name: "itemProtein",
            type: "Double",
            required: false,
            description: "Updated protein",
            httpLocation: "body",
          },
          {
            name: "itemCarbohydrates",
            type: "Double",
            required: false,
            description: "Updated carbohydrates",
            httpLocation: "body",
          },
          {
            name: "itemFat",
            type: "Double",
            required: false,
            description: "Updated fat",
            httpLocation: "body",
          },
          {
            name: "itemSugar",
            type: "Double",
            required: false,
            description: "Updated sugar",
            httpLocation: "body",
          },
          {
            name: "itemFiber",
            type: "Double",
            required: false,
            description: "Updated fiber",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "deleteMealLine",
        description:
          "Deletes a meal line item and recomputes the parent meal log and daily nutrition totals.",
        frontendDocument:
          "Triggered from delete button on a meal line row (with confirmation). On success: remove row, recalculate meal totals, refresh daily progress. On 404: show 'Item not found'.",
        crudType: "delete",
        dataObjectName: "mealLine",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/meal-lines/:mealLineId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listMealLines",
        description:
          "Lists meal lines for the authenticated user. mealLogId is an auto-filter param via isFilterParameter=true.",
        frontendDocument:
          "Used on meal detail page to load food items for a specific meal. Always called with ?mealLogId=<id>. Shows a table: itemName, consumedGrams, itemCalories, itemProtein, itemCarbohydrates, itemFat, itemSugar, itemFiber. Each row has edit and delete buttons.",
        crudType: "list",
        dataObjectName: "mealLine",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/meal-lines",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "getDailyProgress",
        description:
          "Retrieves (or initializes) the nutritionDay record for a given date, defaulting to today. Used as the primary dashboard data source.",
        frontendDocument:
          "This is the primary dashboard API. Called on page load with no params (defaults to today) or with ?targetDate=YYYY-MM-DD. Response populates the 6-macro progress panel. Show a skeleton loader while fetching. On success update all progress bars/gauges with color coding. Refresh after any meal log write operation.",
        crudType: "get",
        dataObjectName: "nutritionDay",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/nutrition-days/daily-progress",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "targetDate",
            type: "Date",
            required: false,
            description: "The day to retrieve progress for; defaults to today",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "getNutritionDay",
        description:
          "Retrieves a single nutritionDay record by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used when navigating to a specific past day's nutrition detail. Standard get by ID. On 404: show 'No data for this date'.",
        crudType: "get",
        dataObjectName: "nutritionDay",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/nutrition-days/:nutritionDayId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "nutritionDayId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listNutritionDays",
        description:
          "Lists nutritionDay records for the authenticated user with optional date range filtering.",
        frontendDocument:
          "Used by analytics pages to fetch the raw daily data. Always scoped to session.userId. Pass fromDate/toDate for range queries. summaryDate is an auto-filter from isFilterParameter=true. Returns sorted by summaryDate descending.",
        crudType: "list",
        dataObjectName: "nutritionDay",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/nutrition-days",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "fromDate",
            type: "Date",
            required: false,
            description: "Range start",
            httpLocation: "query",
          },
          {
            name: "toDate",
            type: "Date",
            required: false,
            description: "Range end",
            httpLocation: "query",
          },
          {
            name: "summaryDate",
            type: "Date",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "getWeeklyAnalytics",
        description:
          "Returns the last 7 days of nutritionDay records plus computed analytics (averages, goal hit rates, calorie trend) via LIB.buildWeeklyAnalytics.",
        frontendDocument:
          "Triggered on the Weekly Analytics page load. Shows: a 7-day calorie trend line chart, a per-macro average bar chart, and a goal-hit-rate table (% of days each macro stayed within target). weeklyAnalytics context value is written to the response for the chart data. Loading state: skeleton chart cards.",
        crudType: "list",
        dataObjectName: "nutritionDay",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/analytics/weekly",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [],
      },
      {
        name: "getMonthlyAnalytics",
        description:
          "Returns the last 30 days of nutritionDay records plus computed analytics (averages, goal hit rates, multi-macro trends) via LIB.buildMonthlyAnalytics.",
        frontendDocument:
          "Triggered on the Monthly Analytics page load. Shows: 6 trend line charts (one per macro), per-macro average and goal-hit-rate summary cards. monthlyAnalytics context value is written to the response. Loading state: skeleton chart panel.",
        crudType: "list",
        dataObjectName: "nutritionDay",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/analytics/monthly",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [],
      },
      {
        name: "triggerDailyReminderCheck",
        description:
          "Admin-only scheduled endpoint that finds users with no meals today and emits a Kafka reminder event for each.",
        frontendDocument:
          "Internal scheduled endpoint — not surfaced in any user-facing UI. Called by external cron at ~20:00 Turkish time. No user interaction.",
        crudType: "update",
        dataObjectName: "nutritionDay",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/scheduled/daily-reminder-check",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [],
      },
      {
        name: "triggerDailySummary",
        description:
          "Admin-only scheduled endpoint that finds users with meals today and emits a Kafka daily summary event for each.",
        frontendDocument:
          "Internal scheduled endpoint — not surfaced in any user-facing UI. Called by external cron at ~23:59 Turkish time. No user interaction.",
        crudType: "update",
        dataObjectName: "nutritionDay",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/scheduled/daily-summary",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [],
      },
      {
        name: "_fetchListMealLog",
        description:
          "System API to fetch list of mealLog records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "mealLog",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistmeallog",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "mealDate",
            type: "Date",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "logSource",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListMealLine",
        description:
          "System API to fetch list of mealLine records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "mealLine",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistmealline",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListNutritionDay",
        description:
          "System API to fetch list of nutritionDay records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "nutritionDay",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistnutritionday",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "summaryDate",
            type: "Date",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
    ],
  },
  nutritionai: {
    name: "nutritionai",
    fullname: "nutritionai",
    port: 3053,
    dataObjects: [
      {
        name: "aiSession",
        modelName: "AiSession",
        description:
          "Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "sessionType",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "inputText",
            type: "Text",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "detectedLanguage",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "sessionState",
            type: "Enum",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "confidenceScore",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "finalResponseText",
            type: "Text",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "aiCandidateMeal",
        modelName: "AiCandidateMeal",
        description:
          "Stores the structured meal proposal produced by AI parsing of a user's natural-language input — holds proposed slot, date, nutrition totals, warning flags, and a confirmation status before the meal is committed to mealTracker.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "aiSessionId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "session",
              targetObject: "aiSession",
              targetKey: "id",
            },
          },
          {
            name: "proposedMealDate",
            type: "Date",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "proposedMealTime",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "proposedSlotName",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "candidateSource",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "warningText",
            type: "Text",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "confirmationRequired",
            type: "Boolean",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "isConfirmed",
            type: "Boolean",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "isCommitted",
            type: "Boolean",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalCalories",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalProtein",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalCarbohydrates",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalFat",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalSugar",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "totalFiber",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "committedMealLogId",
            type: "ID",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "aiCandidateLine",
        modelName: "AiCandidateLine",
        description:
          "Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user's choice to save the food to their library.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "aiCandidateMealId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "candidateMeal",
              targetObject: "aiCandidateMeal",
              targetKey: "id",
            },
          },
          {
            name: "detectedFoodName",
            type: "String",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: true,
            relation: null,
          },
          {
            name: "estimatedGrams",
            type: "Double",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "estimatedCalories",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "estimatedProtein",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "estimatedCarbohydrates",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "estimatedFat",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "estimatedSugar",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "estimatedFiber",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "quantityConfidence",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "nutritionReference",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "saveAsFood",
            type: "Boolean",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "aiGuidanceNote",
        modelName: "AiGuidanceNote",
        description:
          "Persists the structured outcome of a nutrition guidance Q&A interaction — stores question classification, time range context, the summarized answer, rationale, referenced metrics, and any caution text, linked to the parent aiSession.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "userId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "aiSessionId",
            type: "ID",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: {
              joinName: "session",
              targetObject: "aiSession",
              targetKey: "id",
            },
          },
          {
            name: "questionType",
            type: "String",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "contextRange",
            type: "String",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "answerSummary",
            type: "Text",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "rationaleText",
            type: "Text",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "referencedMetricKeys",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "cautionText",
            type: "Text",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
    ],
    businessApis: [
      {
        name: "parseMeal",
        description:
          "Accepts a natural-language Turkish meal description, creates an aiSession record, invokes the AI parsing library function, and creates the resulting aiCandidateMeal and aiCandidateLine records.",
        frontendDocument:
          'Triggered from the AI chat input box on the meal log page. Show a loading spinner labeled "AI analiz ediyor..." while the request is in flight (can take 3–8 seconds). On 201, navigate to the candidate meal confirmation page (`/ai-candidate-meals/:candidateMealId`). If `confirmationRequired=true`, show the warning banner prominently before showing the food line table. On error, show a Turkish-language toast using `finalResponseText` from the response.',
        crudType: "create",
        dataObjectName: "aiSession",
        isDefaultApi: false,
        method: "POST",
        routePath: "/v1/ai-sessions/parse-meal",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inputText",
            type: "Text",
            required: true,
            description: "Raw Turkish meal description from the user",
            httpLocation: "body",
          },
          {
            name: "proposedMealDate",
            type: "Date",
            required: false,
            description: "Optional date hint from user",
            httpLocation: "body",
          },
          {
            name: "proposedMealTime",
            type: "String",
            required: false,
            description: "Optional time hint from user",
            httpLocation: "body",
          },
          {
            name: "proposedSlotName",
            type: "String",
            required: false,
            description: "Optional meal slot override",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "confirmCandidateMeal",
        description:
          "Confirms a candidate meal after user review — applies optional line adjustments, recalculates totals, writes meal log and lines to mealTracker, saves foods to nutritionLibrary where requested, and marks the candidate as committed.",
        frontendDocument:
          "Triggered by the 'Onayla' button on the candidate meal confirmation page. Disable the button while in flight. On success (200), show toast \"Öğün başarıyla kaydedildi!\" and navigate to the daily meal log page. If `lineAdjustments` are passed, the UI should pre-populate them from user edits in the confirmation table before submitting. On error, display the error message inline without navigating away.",
        crudType: "update",
        dataObjectName: "aiCandidateMeal",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/ai-candidate-meals/:aiCandidateMealId/confirm",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "aiCandidateMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "proposedMealDate",
            type: "Date",
            required: false,
            description: "User may override the proposed date",
            httpLocation: "body",
          },
          {
            name: "proposedMealTime",
            type: "String",
            required: false,
            description: "User may override the proposed time",
            httpLocation: "body",
          },
          {
            name: "proposedSlotName",
            type: "String",
            required: false,
            description: "User may override the meal slot",
            httpLocation: "body",
          },
          {
            name: "lineAdjustments",
            type: "Object",
            required: false,
            description: "Array of per-line gram/saveAsFood overrides",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "askNutritionQuestion",
        description:
          "Creates an aiSession for nutrition guidance, fetches macro targets and meal context from sibling services, invokes the AI guidance library function, and persists the structured guidance note.",
        frontendDocument:
          "Triggered from the AI Q&A chat widget on the nutrition dashboard. Show a loading spinner labeled \"Yanıt hazırlanıyor...\" while the request is in flight (can take 3–8 seconds). On 201, render the guidance response card inline in the chat widget showing `finalResponseText` from the session and the full `aiGuidanceNote` details. The context range selector (today/week/month) should be a toggle above the text input; default is 'today'.",
        crudType: "create",
        dataObjectName: "aiSession",
        isDefaultApi: false,
        method: "POST",
        routePath: "/v1/ai-sessions/ask",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inputText",
            type: "Text",
            required: true,
            description: "Natural-language nutrition question in Turkish",
            httpLocation: "body",
          },
          {
            name: "contextRange",
            type: "String",
            required: false,
            description: "Time scope for context: today, week, month",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "getAiSession",
        description:
          "Retrieves a single AI session by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used on the session detail page. Display session metadata at the top (type badge, state badge, creation time). Below, render either the candidate meal card (if `sessionType=mealParsing`) or the guidance note card (if `sessionType=nutritionGuidance`). These are loaded separately via their respective GET endpoints using the session id as a filter.",
        crudType: "get",
        dataObjectName: "aiSession",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/ai-sessions/:aiSessionId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "aiSessionId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listAiSessions",
        description:
          "Lists all AI sessions for the authenticated user, ordered by most recent first.",
        frontendDocument:
          "Displayed on the AI session history page as a paginated list. Each row shows: `sessionType` badge, `sessionState` status chip, a preview of `inputText` (truncated to 80 chars), and `createdAt` as relative time. Default sort: newest first. Support filter chips by `sessionType` and `sessionState` using the auto-filter parameters. Clicking a row opens the session detail page.",
        crudType: "list",
        dataObjectName: "aiSession",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/ai-sessions",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "sessionType",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "sessionState",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "getAiCandidateMeal",
        description:
          "Retrieves a single candidate meal by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used on the candidate meal confirmation page. Load this first to show meal slot/date info and totals. Then load the candidate lines via the list endpoint filtered by `aiCandidateMealId`. If `isCommitted=true`, show the committed state with a link to the meal log.",
        crudType: "get",
        dataObjectName: "aiCandidateMeal",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/ai-candidate-meals/:aiCandidateMealId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "aiCandidateMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listAiCandidateMeals",
        description: "Lists candidate meals for the authenticated user.",
        frontendDocument:
          "Used when showing the user's AI parsing history. Each row shows: proposed meal slot, proposed date, total calories, confirmation state (isConfirmed/isCommitted chips). Support auto-filters by `isConfirmed`, `isCommitted`, `aiSessionId`.",
        crudType: "list",
        dataObjectName: "aiCandidateMeal",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/ai-candidate-meals",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "aiSessionId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "isConfirmed",
            type: "Boolean",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "isCommitted",
            type: "Boolean",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "updateAiCandidateLine",
        description:
          "Updates a single candidate food line — allows the user to adjust gram amounts, toggle save-as-food, or rename the detected food. Recalculates nutrition values proportionally when grams change.",
        frontendDocument:
          "Triggered by inline editing in the confirmation table. Debounce gram input changes by 500ms before firing. After a successful 200, update the line row in the table with the new nutrition values from the response and refresh the meal totals card client-side. Show a brief inline checkmark on success.",
        crudType: "update",
        dataObjectName: "aiCandidateLine",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/ai-candidate-lines/:aiCandidateLineId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "aiCandidateLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "estimatedGrams",
            type: "Double",
            required: false,
            description: "Updated gram amount",
            httpLocation: "body",
          },
          {
            name: "saveAsFood",
            type: "Boolean",
            required: false,
            description: "Toggle save-to-library intent",
            httpLocation: "body",
          },
          {
            name: "detectedFoodName",
            type: "String",
            required: false,
            description: "User may rename the detected food",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "rejectCandidateMeal",
        description:
          "Rejects a candidate meal, marking it as not confirmed and updating the parent session state to failed.",
        frontendDocument:
          "Triggered by the 'Reddet' button on the candidate meal confirmation page. On success, show toast \"Öğün reddedildi\" and navigate back to the meal log page.",
        crudType: "update",
        dataObjectName: "aiCandidateMeal",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/ai-candidate-meals/:aiCandidateMealId/reject",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "aiCandidateMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "getAiGuidanceNote",
        description:
          "Retrieves a single AI guidance note by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used on the session detail page for guidance sessions. Show the guidance card with answerSummary prominently, rationaleText in collapsible accordion, cautionText as amber callout.",
        crudType: "get",
        dataObjectName: "aiGuidanceNote",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/ai-guidance-notes/:aiGuidanceNoteId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "aiGuidanceNoteId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listAiGuidanceNotes",
        description: "Lists all AI guidance notes for the authenticated user.",
        frontendDocument:
          "Displayed in the guidance history section. Each row shows: question type badge, context range label, creation time, and a truncated preview of answerSummary. Support auto-filters by `questionType` and `contextRange`.",
        crudType: "list",
        dataObjectName: "aiGuidanceNote",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/ai-guidance-notes",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "questionType",
            type: "String",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "contextRange",
            type: "String",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListAiSession",
        description:
          "System API to fetch list of aiSession records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "aiSession",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistaisession",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "sessionType",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "sessionState",
            type: "Enum",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListAiCandidateMeal",
        description:
          "System API to fetch list of aiCandidateMeal records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "aiCandidateMeal",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistaicandidatemeal",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "aiSessionId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "isConfirmed",
            type: "Boolean",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "isCommitted",
            type: "Boolean",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListAiCandidateLine",
        description:
          "System API to fetch list of aiCandidateLine records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "aiCandidateLine",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistaicandidateline",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "aiCandidateMealId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListAiGuidanceNote",
        description:
          "System API to fetch list of aiGuidanceNote records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "aiGuidanceNote",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistaiguidancenote",
        loginRequired: true,
        checkRoles: ["superAdmin", "admin"],
        ownershipCheck: false,
        parameters: [
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "questionType",
            type: "String",
            required: false,
            description: "",
            httpLocation: "query",
          },
          {
            name: "contextRange",
            type: "String",
            required: false,
            description: "",
            httpLocation: "query",
          },
        ],
      },
    ],
  },
  agenthub: {
    name: "agenthub",
    fullname: "agenthub",
    port: 3006,
    dataObjects: [
      {
        name: "sys_agentOverride",
        modelName: "Sys_agentOverride",
        description:
          "Runtime overrides for design-time agents. Null fields use the design default.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "agentName",
            type: "String",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "provider",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "model",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "systemPrompt",
            type: "Text",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "temperature",
            type: "Double",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "maxTokens",
            type: "Integer",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "responseFormat",
            type: "String",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "selectedTools",
            type: "Object",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "guardrails",
            type: "Object",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "enabled",
            type: "Boolean",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "updatedBy",
            type: "ID",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "sys_agentExecution",
        modelName: "Sys_agentExecution",
        description:
          "Agent execution log. Records each agent invocation with input, output, and performance metrics.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "agentName",
            type: "String",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "agentType",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "source",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "userId",
            type: "ID",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "input",
            type: "Object",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "output",
            type: "Object",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "toolCalls",
            type: "Integer",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "tokenUsage",
            type: "Object",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "durationMs",
            type: "Integer",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "status",
            type: "Enum",
            isRequired: true,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "error",
            type: "Text",
            isRequired: false,
            allowUpdate: false,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
      {
        name: "sys_toolCatalog",
        modelName: "Sys_toolCatalog",
        description:
          "Cached tool catalog discovered from project services. Refreshed periodically.",
        geoField: null,
        geoFilterName: null,
        geoFilterActive: false,
        isStripeOrder: false,
        amountProperty: null,
        currencyProperty: null,
        currencyStaticValue: null,
        properties: [
          {
            name: "toolName",
            type: "String",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "serviceName",
            type: "String",
            isRequired: true,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "description",
            type: "Text",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "parameters",
            type: "Object",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
          {
            name: "lastRefreshed",
            type: "Date",
            isRequired: false,
            allowUpdate: true,
            isSecret: false,
            defaultName: false,
            relation: null,
          },
        ],
      },
    ],
    businessApis: [
      {
        name: "getAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "get",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/agentoverride/:sys_agentOverrideId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_agentOverrideId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listAgentOverrides",
        description: "",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/agentoverrides",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [],
      },
      {
        name: "createAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "create",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/agentoverride",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "agentName",
            type: "String",
            required: true,
            description: "Design-time agent name this override applies to.",
            httpLocation: "body",
          },
          {
            name: "provider",
            type: "String",
            required: false,
            description: "Override AI provider (e.g., openai, anthropic).",
            httpLocation: "body",
          },
          {
            name: "model",
            type: "String",
            required: false,
            description: "Override model name.",
            httpLocation: "body",
          },
          {
            name: "systemPrompt",
            type: "Text",
            required: false,
            description: "Override system prompt.",
            httpLocation: "body",
          },
          {
            name: "temperature",
            type: "Double",
            required: false,
            description: "Override temperature (0-2).",
            httpLocation: "body",
          },
          {
            name: "maxTokens",
            type: "Integer",
            required: false,
            description: "Override max tokens.",
            httpLocation: "body",
          },
          {
            name: "responseFormat",
            type: "String",
            required: false,
            description: "Override response format (text/json).",
            httpLocation: "body",
          },
          {
            name: "selectedTools",
            type: "Object",
            required: false,
            description:
              "Array of tool names from the catalog that this agent can use.",
            httpLocation: "body",
          },
          {
            name: "guardrails",
            type: "Object",
            required: false,
            description:
              "Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.",
            httpLocation: "body",
          },
          {
            name: "enabled",
            type: "Boolean",
            required: false,
            description:
              "Optional caller override; defaults to true when omitted.",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "updateAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "update",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/agentoverride/:sys_agentOverrideId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_agentOverrideId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "provider",
            type: "String",
            required: false,
            description: "Override AI provider (e.g., openai, anthropic).",
            httpLocation: "body",
          },
          {
            name: "model",
            type: "String",
            required: false,
            description: "Override model name.",
            httpLocation: "body",
          },
          {
            name: "systemPrompt",
            type: "Text",
            required: false,
            description: "Override system prompt.",
            httpLocation: "body",
          },
          {
            name: "temperature",
            type: "Double",
            required: false,
            description: "Override temperature (0-2).",
            httpLocation: "body",
          },
          {
            name: "maxTokens",
            type: "Integer",
            required: false,
            description: "Override max tokens.",
            httpLocation: "body",
          },
          {
            name: "responseFormat",
            type: "String",
            required: false,
            description: "Override response format (text/json).",
            httpLocation: "body",
          },
          {
            name: "selectedTools",
            type: "Object",
            required: false,
            description:
              "Array of tool names from the catalog that this agent can use.",
            httpLocation: "body",
          },
          {
            name: "guardrails",
            type: "Object",
            required: false,
            description:
              "Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.",
            httpLocation: "body",
          },
          {
            name: "enabled",
            type: "Boolean",
            required: false,
            description: "Update the enabled flag.",
            httpLocation: "body",
          },
        ],
      },
      {
        name: "deleteAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "delete",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/agentoverride/:sys_agentOverrideId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_agentOverrideId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listToolCatalog",
        description: "",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "sys_toolCatalog",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/toolcatalog",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "serviceName",
            type: "String",
            required: false,
            description: "Source service name.",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "getToolCatalogEntry",
        description: "",
        frontendDocument: "",
        crudType: "get",
        dataObjectName: "sys_toolCatalog",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/toolcatalogentry/:sys_toolCatalogId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_toolCatalogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "listAgentExecutions",
        description: "",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "sys_agentExecution",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/agentexecutions",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "agentName",
            type: "String",
            required: false,
            description: "Agent that was executed.",
            httpLocation: "query",
          },
          {
            name: "agentType",
            type: "Enum",
            required: false,
            description: "Whether this was a design-time or dynamic agent.",
            httpLocation: "query",
          },
          {
            name: "source",
            type: "Enum",
            required: false,
            description: "How the agent was triggered.",
            httpLocation: "query",
          },
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "User who triggered the execution.",
            httpLocation: "query",
          },
          {
            name: "status",
            type: "Enum",
            required: false,
            description: "Execution status.",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "getAgentExecution",
        description: "",
        frontendDocument: "",
        crudType: "get",
        dataObjectName: "sys_agentExecution",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/agentexecution/:sys_agentExecutionId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_agentExecutionId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
      {
        name: "_fetchListSys_agentOverride",
        description:
          "System API to fetch list of sys_agentOverride records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistsys_agentoverride",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [],
      },
      {
        name: "_fetchListSys_agentExecution",
        description:
          "System API to fetch list of sys_agentExecution records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "sys_agentExecution",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistsys_agentexecution",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "agentName",
            type: "String",
            required: false,
            description: "Agent that was executed.",
            httpLocation: "query",
          },
          {
            name: "agentType",
            type: "Enum",
            required: false,
            description: "Whether this was a design-time or dynamic agent.",
            httpLocation: "query",
          },
          {
            name: "source",
            type: "Enum",
            required: false,
            description: "How the agent was triggered.",
            httpLocation: "query",
          },
          {
            name: "userId",
            type: "ID",
            required: false,
            description: "User who triggered the execution.",
            httpLocation: "query",
          },
          {
            name: "status",
            type: "Enum",
            required: false,
            description: "Execution status.",
            httpLocation: "query",
          },
        ],
      },
      {
        name: "_fetchListSys_toolCatalog",
        description:
          "System API to fetch list of sys_toolCatalog records for frontend application. Auto-generated, not visible in design.",
        frontendDocument: "",
        crudType: "list",
        dataObjectName: "sys_toolCatalog",
        isDefaultApi: false,
        method: "GET",
        routePath: "/v1/_fetchlistsys_toolcatalog",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "serviceName",
            type: "String",
            required: false,
            description: "Source service name.",
            httpLocation: "query",
          },
        ],
      },
    ],
  },
};

// Method badge colors
const METHOD_COLORS = {
  GET: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PATCH:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PUT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

/**
 * ServicePage - Generic page for browsing service data and testing APIs
 * Shows data objects as chips and displays selected object's data in a grid
 * Also provides API documentation and testing interface
 */
export default function ServicePage() {
  const { serviceName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get service config
  const serviceConfig = SERVICE_CONFIGS[serviceName?.toLowerCase()];
  const dataObjects = serviceConfig?.dataObjects || [];
  const businessApis = serviceConfig?.businessApis || [];

  // Page view state (data or api)
  const [pageView, setPageView] = useState(searchParams.get("view") || "data");

  // API page state
  const [selectedApi, setSelectedApi] = useState(null);
  const [selectedApiDetails, setSelectedApiDetails] = useState(null);
  const [loadingApiDetails, setLoadingApiDetails] = useState(false);
  const [apiSearchKeyword, setApiSearchKeyword] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});

  // Fetch detailed API docs from mcp-bff when API is selected
  // This fetches both JSON metadata and pre-rendered HTML documentation
  const [apiHtml, setApiHtml] = useState(null);
  const [apiDetailTab, setApiDetailTab] = useState("summary"); // 'summary' or 'fullspec'

  useEffect(() => {
    if (!selectedApi || !serviceName) {
      setSelectedApiDetails(null);
      setApiHtml(null);
      return;
    }

    // Clear previous details immediately
    setSelectedApiDetails(null);
    setApiHtml(null);

    const fetchApiDetails = async () => {
      setLoadingApiDetails(true);
      try {
        // First fetch JSON metadata
        const metaResponse = await mcpBffClient.get(
          `/docs/services/${serviceName}/apis/${selectedApi.name}`,
        );
        setSelectedApiDetails(metaResponse.data);

        // If HTML is available, fetch it (pre-rendered with syntax highlighting)
        if (metaResponse.data?.hasHtml) {
          try {
            const htmlResponse = await mcpBffClient.get(
              `/docs/services/${serviceName}/apis/${selectedApi.name}/html`,
            );
            setApiHtml(htmlResponse.data?.html || null);
          } catch (htmlErr) {
            // HTML fetch failed, that's ok
            setApiHtml(null);
          }
        }
      } catch (err) {
        // 404 is expected if mcp-bff hasn't been regenerated yet
        // Silently ignore other errors as well
        setSelectedApiDetails(null);
        setApiHtml(null);
      } finally {
        setLoadingApiDetails(false);
      }
    };

    fetchApiDetails();
  }, [selectedApi?.name, serviceName]);

  // Data page state
  const [selectedObject, setSelectedObject] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Update URL when page view changes
  const handlePageViewChange = (view) => {
    setPageView(view);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", view);
    setSearchParams(newParams);
  };

  // Group APIs by data object
  const groupedApis = businessApis.reduce((groups, api) => {
    const group = api.dataObjectName || "Other";
    if (!groups[group]) groups[group] = [];
    groups[group].push(api);
    return groups;
  }, {});

  // Filter APIs by search keyword
  const filteredGroupedApis =
    apiSearchKeyword.length >= 2
      ? Object.entries(groupedApis).reduce((result, [group, apis]) => {
          const filtered = apis.filter(
            (api) =>
              api.name.toLowerCase().includes(apiSearchKeyword.toLowerCase()) ||
              api.description
                ?.toLowerCase()
                .includes(apiSearchKeyword.toLowerCase()) ||
              api.routePath
                .toLowerCase()
                .includes(apiSearchKeyword.toLowerCase()),
          );
          if (filtered.length > 0) result[group] = filtered;
          return result;
        }, {})
      : groupedApis;

  // Initialize expanded groups
  useEffect(() => {
    const initial = {};
    Object.keys(groupedApis).forEach((group) => {
      initial[group] = true; // Start expanded
    });
    setExpandedGroups(initial);
  }, [serviceName]);

  // Select first API when switching to API view
  useEffect(() => {
    if (pageView === "api" && !selectedApi && businessApis.length > 0) {
      setSelectedApi(businessApis[0]);
    }
  }, [pageView, businessApis]);

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageRowCount, setPageRowCount] = useState(25);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search
  const [searchKeyword, setSearchKeyword] = useState("");

  // Create / Edit form panel state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Track previous service to detect changes
  const prevServiceRef = useRef(serviceName);

  // Get current data object config
  const currentObjectConfig = dataObjects.find(
    (obj) => obj.name === selectedObject,
  );

  // ── Default APIs for the currently selected object ─────────────
  const DEFAULT_APIS = {
    "invitationcenter:inviteLink": {
      create: {
        name: "createInviteLink",
        description:
          "Creates a new invite link with a generated unique code. Restricted to admins. The invite starts in 'draft' state and must be explicitly activated before use.",
        frontendDocument:
          "Triggered from the admin invite management panel via a 'Create Invite' button. Opens a modal/slide-over form. `usageLimit` field should be shown conditionally (only when `usageMode === 'limitedUse'`). `sellerId`/`ownerUserId` is auto-populated from session — do NOT show in form. On 201: close modal, refresh list, toast 'Invite link created'. On 400: show inline validation errors.",
        crudType: "create",
        dataObjectName: "inviteLink",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/invite-links",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "invitedEmail",
            type: "String",
            required: false,
            description: "Optional intended recipient email address",
            httpLocation: "body",
          },
          {
            name: "usageMode",
            type: "Enum",
            required: true,
            description:
              "Whether the invite can be used once (singleUse) or a limited number of times (limitedUse)",
            httpLocation: "body",
          },
          {
            name: "usageLimit",
            type: "Integer",
            required: false,
            description:
              "Maximum number of allowed uses; required when usageMode=limitedUse",
            httpLocation: "body",
          },
          {
            name: "expiresAt",
            type: "Date",
            required: false,
            description: "Optional expiry date; null means no expiry",
            httpLocation: "body",
          },
        ],
      },
      update: {
        name: "activateInviteLink",
        description:
          "Transitions an invite link from 'draft' to 'active' state, making it usable for registration. Only invite links in 'draft' state can be activated.",
        frontendDocument:
          "Triggered from the invite list or detail view via an 'Activate' action button (shown only when inviteState='draft'). No form input needed — just a confirmation dialog. On 200: update the status badge inline or refresh row. Toast 'Invite link activated'. On 400: toast 'Invite link is not in draft state'.",
        crudType: "update",
        dataObjectName: "inviteLink",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/invite-links/:inviteLinkId/activate",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
        ],
      },
      delete: null,
      get: {
        name: "getInviteLink",
        description: "Admin endpoint to fetch a single invite link by its ID.",
        frontendDocument:
          "Used when navigating to the invite detail view (`/admin/invites/:inviteLinkId`). Loads the full invite record for display. Show all fields including audit trail (loaded separately via listInviteAudits filtered by inviteLinkId).",
        crudType: "get",
        dataObjectName: "inviteLink",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/invite-links/:inviteLinkId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inviteLinkId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "invitationcenter:inviteAudit": {
      create: null,
      update: null,
      delete: null,
      get: null,
    },
    "nutritionlibrary:macroTarget": {
      create: {
        name: "setMacroTarget",
        description:
          "Upsert-style API: soft-deletes any existing active macro target for the user before creating a fresh one.",
        frontendDocument:
          "Triggered by the Save button on the Macro Targets page. All six target fields are required. On 201, show a toast 'Macro targets updated' and reflect new values in the UI. userId is auto-populated from session — never ask the user for it. effectiveFrom is system-set.",
        crudType: "create",
        dataObjectName: "macroTarget",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/macro-targets",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "calorieTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "proteinTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "carbohydrateTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fatTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "sugarTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fiberTarget",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      update: null,
      delete: null,
      get: {
        name: "getMyMacroTarget",
        description:
          "Fetch the authenticated user's current active macro target.",
        frontendDocument:
          "Called on page load of the Macro Targets page. Returns the current active target to pre-fill the form. If response is 404, show the form empty with placeholder hint values.",
        crudType: "get",
        dataObjectName: "macroTarget",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/macro-targets/me",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [],
      },
    },
    "nutritionlibrary:foodItem": {
      create: {
        name: "createFoodItem",
        description: "Create a food item in the user's personal food library.",
        frontendDocument:
          "Triggered from 'Add Food' form on the Food Library page, or programmatically by the AI assistant. All per-100g fields are required. brandName and foodCategory are optional. creationSource defaults to manualEntry. On 201, append to the food list and show a toast 'Food saved'. userId is auto-populated from session.",
        crudType: "create",
        dataObjectName: "foodItem",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/food-items",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "foodName",
            type: "String",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "caloriePer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "proteinPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "carbohydratePer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fatPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "sugarPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fiberPer100g",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "brandName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "foodCategory",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "creationSource",
            type: "Enum",
            required: false,
            default: "manualEntry",
            description: "",
            httpLocation: "body",
          },
        ],
      },
      update: {
        name: "updateFoodItem",
        description:
          "Update a food item's fields. All fields are optional (partial update). Ownership enforced.",
        frontendDocument:
          "Triggered from the edit drawer on the Food Library page. All fields are optional — only changed fields need to be sent. On 200, update the list in place and close the drawer with a toast 'Food updated'. creationSource is not editable after creation.",
        crudType: "update",
        dataObjectName: "foodItem",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/food-items/:foodItemId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "foodName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "caloriePer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "proteinPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "carbohydratePer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fatPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "sugarPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "fiberPer100g",
            type: "Double",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "brandName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "foodCategory",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      delete: {
        name: "deleteFoodItem",
        description: "Soft-delete a food item. Ownership enforced.",
        frontendDocument:
          "Triggered from the delete button on a food item row. Show a confirmation dialog before calling. On 200, remove the item from the list with a toast 'Food deleted'.",
        crudType: "delete",
        dataObjectName: "foodItem",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/food-items/:foodItemId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      get: {
        name: "getFoodItem",
        description: "Fetch a single food item by id. Ownership enforced.",
        frontendDocument:
          "Called when the user opens a food item detail view or edit drawer. Returns full per-100g fields for display and editing.",
        crudType: "get",
        dataObjectName: "foodItem",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/food-items/:foodItemId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "nutritionlibrary:presetMeal": {
      create: {
        name: "createPresetMeal",
        description:
          "Create a preset meal header. Lines are added separately via addPresetLine. Totals initialize at 0.",
        frontendDocument:
          "Triggered from 'New Preset' button on Preset Meals page. Only templateName is required. On 201, navigate to the preset detail page to add lines. Totals will show as 0 until lines are added.",
        crudType: "create",
        dataObjectName: "presetMeal",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/preset-meals",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "templateName",
            type: "String",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "descriptionText",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      update: {
        name: "updatePresetMeal",
        description:
          "Update preset meal header fields (templateName, descriptionText). Nutrition totals are NOT updated here.",
        frontendDocument:
          "Triggered from the edit icon on a preset card. Only templateName and descriptionText can be changed. On 200, update the card in place with a toast 'Preset updated'.",
        crudType: "update",
        dataObjectName: "presetMeal",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/preset-meals/:presetMealId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "templateName",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
          {
            name: "descriptionText",
            type: "String",
            required: false,
            description: "",
            httpLocation: "body",
          },
        ],
      },
      delete: {
        name: "deletePresetMeal",
        description:
          "Soft-delete a preset meal and all its lines. Ownership enforced.",
        frontendDocument:
          "Triggered from the delete button on a preset card. Show confirmation dialog. On 200, remove the card from the grid with a toast 'Preset deleted'.",
        crudType: "delete",
        dataObjectName: "presetMeal",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/preset-meals/:presetMealId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      get: {
        name: "getPresetMeal",
        description: "Fetch a preset meal with its lines joined.",
        frontendDocument:
          "Called when user opens a preset detail page. Returns preset header + nested lines array. Display lines sorted by creation order. Totals at the top; lines table below.",
        crudType: "get",
        dataObjectName: "presetMeal",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/preset-meals/:presetMealId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "presetMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "nutritionlibrary:presetLine": {
      create: {
        name: "addPresetLine",
        description:
          "Add a food item line to a preset meal. Validates preset ownership and food item ownership, calculates nutrition snapshot, creates the line, then recalculates parent preset totals.",
        frontendDocument:
          "Triggered from the 'Add Food' button on the preset detail page. User selects a food from their library and enters gram amount. On 201, append the new line to the list and update displayed totals. userId is auto-populated from session.",
        crudType: "create",
        dataObjectName: "presetLine",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/preset-meals/:presetMealId/lines",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "foodItemId",
            type: "ID",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "gramAmount",
            type: "Double",
            required: true,
            description: "",
            httpLocation: "body",
          },
          {
            name: "presetMealId",
            type: "String",
            required: true,
            description:
              "This URL path parameter scopes the create operation to a parent record (typically the parent object's id).",
            httpLocation: "urlpath",
          },
        ],
      },
      update: null,
      delete: {
        name: "deletePresetLine",
        description:
          "Remove a single line from a preset, then recalculate preset totals. Validates preset ownership.",
        frontendDocument:
          "Triggered from the remove button on a preset line row. On 200, remove the line from the UI and update displayed totals.",
        crudType: "delete",
        dataObjectName: "presetLine",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/preset-meals/:presetMealId/lines/:presetLineId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "presetLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
          {
            name: "presetMealId",
            type: "String",
            required: true,
            description:
              "This parameter will be used to select the data object that want to be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      get: null,
    },
    "mealtracker:mealLog": {
      create: {
        name: "createMealLog",
        description:
          "Creates a new meal log entry with all nutrition totals and then inserts individual meal line items via a loop action. After creation, upserts the daily nutrition snapshot.",
        frontendDocument:
          "Triggered from the meal logging form (POST on submit). userId is auto-populated from session — never ask the user. Required fields: mealDate, mealTime, slotName, logSource, totalCalories, totalProtein, totalCarbohydrates, totalFat, totalSugar, totalFiber, lines[]. On 201: redirect to meal detail or refresh daily progress widget, show toast 'Meal logged successfully'. On 400/422: show inline field errors.",
        crudType: "create",
        dataObjectName: "mealLog",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/meal-logs",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealDate",
            type: "Date",
            required: true,
            description: "Date the meal was consumed",
            httpLocation: "body",
          },
          {
            name: "mealTime",
            type: "String",
            required: true,
            description: "Local time string e.g. 13:30",
            httpLocation: "body",
          },
          {
            name: "slotName",
            type: "String",
            required: true,
            description: "Fixed or custom meal slot name",
            httpLocation: "body",
          },
          {
            name: "logSource",
            type: "Enum",
            required: true,
            description: "Source of the meal log entry",
            httpLocation: "body",
          },
          {
            name: "noteText",
            type: "String",
            required: false,
            description: "Optional user notes",
            httpLocation: "body",
          },
          {
            name: "totalCalories",
            type: "Double",
            required: true,
            description: "Meal-level calorie total",
            httpLocation: "body",
          },
          {
            name: "totalProtein",
            type: "Double",
            required: true,
            description: "Meal-level protein total",
            httpLocation: "body",
          },
          {
            name: "totalCarbohydrates",
            type: "Double",
            required: true,
            description: "Meal-level carbohydrate total",
            httpLocation: "body",
          },
          {
            name: "totalFat",
            type: "Double",
            required: true,
            description: "Meal-level fat total",
            httpLocation: "body",
          },
          {
            name: "totalSugar",
            type: "Double",
            required: true,
            description: "Meal-level sugar total",
            httpLocation: "body",
          },
          {
            name: "totalFiber",
            type: "Double",
            required: true,
            description: "Meal-level fiber total",
            httpLocation: "body",
          },
          {
            name: "lines",
            type: "Object",
            required: true,
            description: "Array of meal line objects to create",
            httpLocation: "body",
          },
        ],
      },
      update: {
        name: "updateMealLog",
        description:
          "Updates editable fields of a meal log and recomputes the nutrition day snapshot.",
        frontendDocument:
          "Triggered from the meal edit form. All fields optional — only send changed values. On success: update the meal card in the list and refresh daily progress widget. On 404: show 'Meal not found'.",
        crudType: "update",
        dataObjectName: "mealLog",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/meal-logs/:mealLogId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "mealTime",
            type: "String",
            required: false,
            description: "Updated meal time",
            httpLocation: "body",
          },
          {
            name: "slotName",
            type: "String",
            required: false,
            description: "Updated slot name",
            httpLocation: "body",
          },
          {
            name: "noteText",
            type: "String",
            required: false,
            description: "Updated notes",
            httpLocation: "body",
          },
          {
            name: "totalCalories",
            type: "Double",
            required: false,
            description: "Recalculated calorie total",
            httpLocation: "body",
          },
          {
            name: "totalProtein",
            type: "Double",
            required: false,
            description: "Recalculated protein total",
            httpLocation: "body",
          },
          {
            name: "totalCarbohydrates",
            type: "Double",
            required: false,
            description: "Recalculated carbohydrate total",
            httpLocation: "body",
          },
          {
            name: "totalFat",
            type: "Double",
            required: false,
            description: "Recalculated fat total",
            httpLocation: "body",
          },
          {
            name: "totalSugar",
            type: "Double",
            required: false,
            description: "Recalculated sugar total",
            httpLocation: "body",
          },
          {
            name: "totalFiber",
            type: "Double",
            required: false,
            description: "Recalculated fiber total",
            httpLocation: "body",
          },
        ],
      },
      delete: {
        name: "deleteMealLog",
        description:
          "Deletes a meal log and its associated meal lines, then recomputes the nutrition day snapshot.",
        frontendDocument:
          "Triggered from meal card delete button (with confirmation dialog). On success: remove card from list, show toast 'Meal deleted', refresh daily progress widget. On 404: show 'Meal not found'.",
        crudType: "delete",
        dataObjectName: "mealLog",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/meal-logs/:mealLogId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      get: {
        name: "getMealLog",
        description:
          "Retrieves a single meal log by ID, scoped to the authenticated user.",
        frontendDocument:
          "Triggered when user taps a meal card to view detail. Shows all fields including noteText and individual mealLines (loaded via a separate listMealLines call filtered by mealLogId). On 404: show 'Meal not found' and navigate back.",
        crudType: "get",
        dataObjectName: "mealLog",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/meal-logs/:mealLogId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "mealtracker:mealLine": {
      create: {
        name: "createMealLine",
        description:
          "Creates an individual meal line item and then recalculates meal-level and day-level nutrition totals.",
        frontendDocument:
          "Triggered when user adds a food item to an existing meal (inline add form on meal detail). Required: mealLogId, itemName, consumedGrams, all 6 nutrition snapshot values, lineSource. userId auto-populated from session. On 201: add row to meal line list, update meal totals display. On 403: show 'This meal does not belong to you'.",
        crudType: "create",
        dataObjectName: "mealLine",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/meal-lines",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLogId",
            type: "ID",
            required: true,
            description: "FK to parent mealLog",
            httpLocation: "body",
          },
          {
            name: "itemName",
            type: "String",
            required: true,
            description: "Food item name",
            httpLocation: "body",
          },
          {
            name: "consumedGrams",
            type: "Double",
            required: true,
            description: "Grams consumed",
            httpLocation: "body",
          },
          {
            name: "itemCalories",
            type: "Double",
            required: true,
            description: "Calories snapshot",
            httpLocation: "body",
          },
          {
            name: "itemProtein",
            type: "Double",
            required: true,
            description: "Protein snapshot",
            httpLocation: "body",
          },
          {
            name: "itemCarbohydrates",
            type: "Double",
            required: true,
            description: "Carbohydrates snapshot",
            httpLocation: "body",
          },
          {
            name: "itemFat",
            type: "Double",
            required: true,
            description: "Fat snapshot",
            httpLocation: "body",
          },
          {
            name: "itemSugar",
            type: "Double",
            required: true,
            description: "Sugar snapshot",
            httpLocation: "body",
          },
          {
            name: "itemFiber",
            type: "Double",
            required: true,
            description: "Fiber snapshot",
            httpLocation: "body",
          },
          {
            name: "lineSource",
            type: "Enum",
            required: true,
            description: "Source of the line item",
            httpLocation: "body",
          },
          {
            name: "sourceFoodItemId",
            type: "ID",
            required: false,
            description: "Optional reference to nutritionLibrary foodItem",
            httpLocation: "body",
          },
          {
            name: "sourcePresetMealId",
            type: "ID",
            required: false,
            description: "Optional reference to nutritionLibrary presetMeal",
            httpLocation: "body",
          },
        ],
      },
      update: {
        name: "updateMealLine",
        description:
          "Updates nutrition snapshot values of a meal line item, then recalculates meal-level and day-level totals.",
        frontendDocument:
          "Triggered from inline edit on a meal line row. All fields optional. On success: update row values and refresh meal totals strip. On 404: show 'Item not found'.",
        crudType: "update",
        dataObjectName: "mealLine",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/meal-lines/:mealLineId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "itemName",
            type: "String",
            required: false,
            description: "Updated item name",
            httpLocation: "body",
          },
          {
            name: "consumedGrams",
            type: "Double",
            required: false,
            description: "Updated grams",
            httpLocation: "body",
          },
          {
            name: "itemCalories",
            type: "Double",
            required: false,
            description: "Updated calories",
            httpLocation: "body",
          },
          {
            name: "itemProtein",
            type: "Double",
            required: false,
            description: "Updated protein",
            httpLocation: "body",
          },
          {
            name: "itemCarbohydrates",
            type: "Double",
            required: false,
            description: "Updated carbohydrates",
            httpLocation: "body",
          },
          {
            name: "itemFat",
            type: "Double",
            required: false,
            description: "Updated fat",
            httpLocation: "body",
          },
          {
            name: "itemSugar",
            type: "Double",
            required: false,
            description: "Updated sugar",
            httpLocation: "body",
          },
          {
            name: "itemFiber",
            type: "Double",
            required: false,
            description: "Updated fiber",
            httpLocation: "body",
          },
        ],
      },
      delete: {
        name: "deleteMealLine",
        description:
          "Deletes a meal line item and recomputes the parent meal log and daily nutrition totals.",
        frontendDocument:
          "Triggered from delete button on a meal line row (with confirmation). On success: remove row, recalculate meal totals, refresh daily progress. On 404: show 'Item not found'.",
        crudType: "delete",
        dataObjectName: "mealLine",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/meal-lines/:mealLineId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "mealLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      get: null,
    },
    "mealtracker:nutritionDay": {
      create: null,
      update: {
        name: "triggerDailyReminderCheck",
        description:
          "Admin-only scheduled endpoint that finds users with no meals today and emits a Kafka reminder event for each.",
        frontendDocument:
          "Internal scheduled endpoint — not surfaced in any user-facing UI. Called by external cron at ~20:00 Turkish time. No user interaction.",
        crudType: "update",
        dataObjectName: "nutritionDay",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/scheduled/daily-reminder-check",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [],
      },
      delete: null,
      get: {
        name: "getNutritionDay",
        description:
          "Retrieves a single nutritionDay record by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used when navigating to a specific past day's nutrition detail. Standard get by ID. On 404: show 'No data for this date'.",
        crudType: "get",
        dataObjectName: "nutritionDay",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/nutrition-days/:nutritionDayId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "nutritionDayId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "nutritionai:aiSession": {
      create: {
        name: "parseMeal",
        description:
          "Accepts a natural-language Turkish meal description, creates an aiSession record, invokes the AI parsing library function, and creates the resulting aiCandidateMeal and aiCandidateLine records.",
        frontendDocument:
          'Triggered from the AI chat input box on the meal log page. Show a loading spinner labeled "AI analiz ediyor..." while the request is in flight (can take 3–8 seconds). On 201, navigate to the candidate meal confirmation page (`/ai-candidate-meals/:candidateMealId`). If `confirmationRequired=true`, show the warning banner prominently before showing the food line table. On error, show a Turkish-language toast using `finalResponseText` from the response.',
        crudType: "create",
        dataObjectName: "aiSession",
        isDefaultApi: false,
        method: "POST",
        routePath: "/v1/ai-sessions/parse-meal",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "inputText",
            type: "Text",
            required: true,
            description: "Raw Turkish meal description from the user",
            httpLocation: "body",
          },
          {
            name: "proposedMealDate",
            type: "Date",
            required: false,
            description: "Optional date hint from user",
            httpLocation: "body",
          },
          {
            name: "proposedMealTime",
            type: "String",
            required: false,
            description: "Optional time hint from user",
            httpLocation: "body",
          },
          {
            name: "proposedSlotName",
            type: "String",
            required: false,
            description: "Optional meal slot override",
            httpLocation: "body",
          },
        ],
      },
      update: null,
      delete: null,
      get: {
        name: "getAiSession",
        description:
          "Retrieves a single AI session by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used on the session detail page. Display session metadata at the top (type badge, state badge, creation time). Below, render either the candidate meal card (if `sessionType=mealParsing`) or the guidance note card (if `sessionType=nutritionGuidance`). These are loaded separately via their respective GET endpoints using the session id as a filter.",
        crudType: "get",
        dataObjectName: "aiSession",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/ai-sessions/:aiSessionId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "aiSessionId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "nutritionai:aiCandidateMeal": {
      create: null,
      update: {
        name: "confirmCandidateMeal",
        description:
          "Confirms a candidate meal after user review — applies optional line adjustments, recalculates totals, writes meal log and lines to mealTracker, saves foods to nutritionLibrary where requested, and marks the candidate as committed.",
        frontendDocument:
          "Triggered by the 'Onayla' button on the candidate meal confirmation page. Disable the button while in flight. On success (200), show toast \"Öğün başarıyla kaydedildi!\" and navigate to the daily meal log page. If `lineAdjustments` are passed, the UI should pre-populate them from user edits in the confirmation table before submitting. On error, display the error message inline without navigating away.",
        crudType: "update",
        dataObjectName: "aiCandidateMeal",
        isDefaultApi: false,
        method: "PATCH",
        routePath: "/v1/ai-candidate-meals/:aiCandidateMealId/confirm",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: true,
        parameters: [
          {
            name: "aiCandidateMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "proposedMealDate",
            type: "Date",
            required: false,
            description: "User may override the proposed date",
            httpLocation: "body",
          },
          {
            name: "proposedMealTime",
            type: "String",
            required: false,
            description: "User may override the proposed time",
            httpLocation: "body",
          },
          {
            name: "proposedSlotName",
            type: "String",
            required: false,
            description: "User may override the meal slot",
            httpLocation: "body",
          },
          {
            name: "lineAdjustments",
            type: "Object",
            required: false,
            description: "Array of per-line gram/saveAsFood overrides",
            httpLocation: "body",
          },
        ],
      },
      delete: null,
      get: {
        name: "getAiCandidateMeal",
        description:
          "Retrieves a single candidate meal by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used on the candidate meal confirmation page. Load this first to show meal slot/date info and totals. Then load the candidate lines via the list endpoint filtered by `aiCandidateMealId`. If `isCommitted=true`, show the committed state with a link to the meal log.",
        crudType: "get",
        dataObjectName: "aiCandidateMeal",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/ai-candidate-meals/:aiCandidateMealId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "aiCandidateMealId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "nutritionai:aiCandidateLine": {
      create: null,
      update: {
        name: "updateAiCandidateLine",
        description:
          "Updates a single candidate food line — allows the user to adjust gram amounts, toggle save-as-food, or rename the detected food. Recalculates nutrition values proportionally when grams change.",
        frontendDocument:
          "Triggered by inline editing in the confirmation table. Debounce gram input changes by 500ms before firing. After a successful 200, update the line row in the table with the new nutrition values from the response and refresh the meal totals card client-side. Show a brief inline checkmark on success.",
        crudType: "update",
        dataObjectName: "aiCandidateLine",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/ai-candidate-lines/:aiCandidateLineId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "aiCandidateLineId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "estimatedGrams",
            type: "Double",
            required: false,
            description: "Updated gram amount",
            httpLocation: "body",
          },
          {
            name: "saveAsFood",
            type: "Boolean",
            required: false,
            description: "Toggle save-to-library intent",
            httpLocation: "body",
          },
          {
            name: "detectedFoodName",
            type: "String",
            required: false,
            description: "User may rename the detected food",
            httpLocation: "body",
          },
        ],
      },
      delete: null,
      get: null,
    },
    "nutritionai:aiGuidanceNote": {
      create: null,
      update: null,
      delete: null,
      get: {
        name: "getAiGuidanceNote",
        description:
          "Retrieves a single AI guidance note by ID, scoped to the authenticated user.",
        frontendDocument:
          "Used on the session detail page for guidance sessions. Show the guidance card with answerSummary prominently, rationaleText in collapsible accordion, cautionText as amber callout.",
        crudType: "get",
        dataObjectName: "aiGuidanceNote",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/ai-guidance-notes/:aiGuidanceNoteId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "aiGuidanceNoteId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "agenthub:sys_agentOverride": {
      create: {
        name: "createAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "create",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: true,
        method: "POST",
        routePath: "/v1/agentoverride",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "agentName",
            type: "String",
            required: true,
            description: "Design-time agent name this override applies to.",
            httpLocation: "body",
          },
          {
            name: "provider",
            type: "String",
            required: false,
            description: "Override AI provider (e.g., openai, anthropic).",
            httpLocation: "body",
          },
          {
            name: "model",
            type: "String",
            required: false,
            description: "Override model name.",
            httpLocation: "body",
          },
          {
            name: "systemPrompt",
            type: "Text",
            required: false,
            description: "Override system prompt.",
            httpLocation: "body",
          },
          {
            name: "temperature",
            type: "Double",
            required: false,
            description: "Override temperature (0-2).",
            httpLocation: "body",
          },
          {
            name: "maxTokens",
            type: "Integer",
            required: false,
            description: "Override max tokens.",
            httpLocation: "body",
          },
          {
            name: "responseFormat",
            type: "String",
            required: false,
            description: "Override response format (text/json).",
            httpLocation: "body",
          },
          {
            name: "selectedTools",
            type: "Object",
            required: false,
            description:
              "Array of tool names from the catalog that this agent can use.",
            httpLocation: "body",
          },
          {
            name: "guardrails",
            type: "Object",
            required: false,
            description:
              "Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.",
            httpLocation: "body",
          },
          {
            name: "enabled",
            type: "Boolean",
            required: false,
            description:
              "Optional caller override; defaults to true when omitted.",
            httpLocation: "body",
          },
        ],
      },
      update: {
        name: "updateAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "update",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: true,
        method: "PATCH",
        routePath: "/v1/agentoverride/:sys_agentOverrideId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_agentOverrideId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be updated",
            httpLocation: "urlpath",
          },
          {
            name: "provider",
            type: "String",
            required: false,
            description: "Override AI provider (e.g., openai, anthropic).",
            httpLocation: "body",
          },
          {
            name: "model",
            type: "String",
            required: false,
            description: "Override model name.",
            httpLocation: "body",
          },
          {
            name: "systemPrompt",
            type: "Text",
            required: false,
            description: "Override system prompt.",
            httpLocation: "body",
          },
          {
            name: "temperature",
            type: "Double",
            required: false,
            description: "Override temperature (0-2).",
            httpLocation: "body",
          },
          {
            name: "maxTokens",
            type: "Integer",
            required: false,
            description: "Override max tokens.",
            httpLocation: "body",
          },
          {
            name: "responseFormat",
            type: "String",
            required: false,
            description: "Override response format (text/json).",
            httpLocation: "body",
          },
          {
            name: "selectedTools",
            type: "Object",
            required: false,
            description:
              "Array of tool names from the catalog that this agent can use.",
            httpLocation: "body",
          },
          {
            name: "guardrails",
            type: "Object",
            required: false,
            description:
              "Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.",
            httpLocation: "body",
          },
          {
            name: "enabled",
            type: "Boolean",
            required: false,
            description: "Update the enabled flag.",
            httpLocation: "body",
          },
        ],
      },
      delete: {
        name: "deleteAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "delete",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: true,
        method: "DELETE",
        routePath: "/v1/agentoverride/:sys_agentOverrideId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_agentOverrideId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to select the required data object that will be deleted",
            httpLocation: "urlpath",
          },
        ],
      },
      get: {
        name: "getAgentOverride",
        description: "",
        frontendDocument: "",
        crudType: "get",
        dataObjectName: "sys_agentOverride",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/agentoverride/:sys_agentOverrideId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_agentOverrideId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "agenthub:sys_agentExecution": {
      create: null,
      update: null,
      delete: null,
      get: {
        name: "getAgentExecution",
        description: "",
        frontendDocument: "",
        crudType: "get",
        dataObjectName: "sys_agentExecution",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/agentexecution/:sys_agentExecutionId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_agentExecutionId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
    "agenthub:sys_toolCatalog": {
      create: null,
      update: null,
      delete: null,
      get: {
        name: "getToolCatalogEntry",
        description: "",
        frontendDocument: "",
        crudType: "get",
        dataObjectName: "sys_toolCatalog",
        isDefaultApi: true,
        method: "GET",
        routePath: "/v1/toolcatalogentry/:sys_toolCatalogId",
        loginRequired: true,
        checkRoles: [],
        ownershipCheck: false,
        parameters: [
          {
            name: "sys_toolCatalogId",
            type: "ID",
            required: true,
            description:
              "This id paremeter is used to query the required data object.",
            httpLocation: "urlpath",
          },
        ],
      },
    },
  };
  const currentDefaults =
    DEFAULT_APIS[`${serviceName}:${selectedObject}`] || {};
  const hasCreate = !!currentDefaults.create;
  const hasUpdate = !!currentDefaults.update;
  const hasDelete = !!currentDefaults.delete;

  // ── Form handlers ─────────────────────────────────────────────
  const openCreateForm = () => {
    setFormMode("create");
    setEditingRecord(null);
    setFormOpen(true);
  };
  const openEditForm = (row) => {
    setFormMode("edit");
    setEditingRecord(row);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingRecord(null);
  };
  const handleFormSuccess = () => {
    // Refresh the data grid after create/edit
    setRefreshKey((k) => k + 1);
  };

  // ── Delete handler ────────────────────────────────────────────
  const handleDelete = async (recordId) => {
    if (!currentDefaults.delete) return;
    setDeleting(true);
    try {
      const client = createServiceClient(serviceName);
      let deletePath = currentDefaults.delete.routePath || "/";
      const idParam = `:${selectedObject}Id`;
      if (deletePath.includes(idParam)) {
        deletePath = deletePath.replace(idParam, recordId);
      } else if (!deletePath.includes(recordId)) {
        deletePath = deletePath.replace(/\/?$/, `/${recordId}`);
      }
      await client.delete(deletePath);
      toast.success(`${currentObjectConfig?.modelName || "Record"} deleted`);
      setDeleteConfirmId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Delete failed";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Update URL and localStorage when object changes (user click)
  const handleObjectChange = (objectName) => {
    if (objectName === selectedObject) return;

    setSelectedObject(objectName);
    setSearchParams({ object: objectName });
    setPageNumber(1);
    setSearchKeyword("");
    setError("");
    setData([]);

    setFormOpen(false);
    setEditingRecord(null);
    setDeleteConfirmId(null);

    // Persist selection in localStorage
    if (serviceName) {
      localStorage.setItem(`service-${serviceName}-selectedObject`, objectName);
    }
  };

  // Handle service changes and initial selection in ONE effect
  useEffect(() => {
    if (!serviceName || dataObjects.length === 0) return;

    const serviceChanged = prevServiceRef.current !== serviceName;
    prevServiceRef.current = serviceName;

    // Check if current selection is valid for this service
    const currentSelectionValid =
      selectedObject && dataObjects.some((obj) => obj.name === selectedObject);

    // If service changed or no valid selection, determine the right object
    if (serviceChanged || !currentSelectionValid) {
      // Clear old data when service changes
      if (serviceChanged) {
        setData([]);
        setError("");
        setPageNumber(1);
        setSearchKeyword("");
      }

      // Determine initial selection: URL param > localStorage > first item
      const urlObject = searchParams.get("object");
      const storageKey = `service-${serviceName}-selectedObject`;
      const savedObject = localStorage.getItem(storageKey);

      let initialObject = "";

      if (urlObject && dataObjects.some((obj) => obj.name === urlObject)) {
        initialObject = urlObject;
      } else if (
        savedObject &&
        dataObjects.some((obj) => obj.name === savedObject)
      ) {
        initialObject = savedObject;
      } else {
        initialObject = dataObjects[0]?.name || "";
      }

      if (initialObject && initialObject !== selectedObject) {
        setSelectedObject(initialObject);
        // Update URL to reflect selection
        setSearchParams({ object: initialObject }, { replace: true });
        // Save to localStorage
        localStorage.setItem(storageKey, initialObject);
      }
    }
  }, [serviceName, dataObjects, selectedObject, searchParams]);

  // Load data when selection or pagination changes
  useEffect(() => {
    if (!selectedObject || !serviceName) return;

    // Verify selectedObject belongs to current service before fetching
    const isValidSelection = dataObjects.some(
      (obj) => obj.name === selectedObject,
    );
    if (!isValidSelection) return;

    const loadDataForSelection = async () => {
      setLoading(true);
      setError("");

      try {
        const client = createServiceClient(serviceName);

        const params = {
          pageNumber,
          pageRowCount,
        };

        if (searchKeyword.length >= 3) {
          params.keyword = searchKeyword;
        }

        const objectNameLower = selectedObject.toLowerCase();
        const response = await client.get(`/v1/_fetchlist${objectNameLower}`, {
          params,
        });

        const responseData = response.data;

        // Try to find items in the response using multiple strategies:
        // 1. Use dataName from response (e.g., "categories")
        // 2. Try proper pluralization (category -> categories, not categorys)
        // 3. Try simple plural (add 's')
        // 4. Try singular name
        // 5. Fallback to data/items
        const dataName = responseData.dataName;
        const singularLower = selectedObject.toLowerCase();

        // Better pluralization for common patterns
        const getPluralName = (name) => {
          const lower = name.toLowerCase();
          if (
            lower.endsWith("y") &&
            !["ay", "ey", "oy", "uy"].some((v) => lower.endsWith(v))
          ) {
            return lower.slice(0, -1) + "ies"; // category -> categories
          }
          if (
            lower.endsWith("s") ||
            lower.endsWith("x") ||
            lower.endsWith("ch") ||
            lower.endsWith("sh")
          ) {
            return lower + "es"; // bus -> buses
          }
          return lower + "s"; // item -> items
        };

        const pluralName = getPluralName(selectedObject);
        const items =
          responseData[dataName] ||
          responseData[pluralName] ||
          responseData[singularLower] ||
          responseData[selectedObject] ||
          responseData.data ||
          responseData.items ||
          [];

        const itemsArray = Array.isArray(items) ? items : [];
        setData(itemsArray);

        // Handle pagination info from various response formats
        if (responseData.paging) {
          setTotalRows(responseData.paging.totalRowCount || 0);
          setTotalPages(responseData.paging.pageCount || 1);
        } else if (responseData.rowCount !== undefined) {
          // API returns rowCount at root level
          setTotalRows(responseData.rowCount);
          setTotalPages(Math.ceil(responseData.rowCount / pageRowCount) || 1);
        } else if (responseData.totalCount !== undefined) {
          setTotalRows(responseData.totalCount);
          setTotalPages(Math.ceil(responseData.totalCount / pageRowCount) || 1);
        } else {
          setTotalRows(itemsArray.length);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load data",
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadDataForSelection();
  }, [
    selectedObject,
    serviceName,
    dataObjects,
    pageNumber,
    pageRowCount,
    refreshKey,
  ]);

  // Debounced search
  useEffect(() => {
    if (!selectedObject || !serviceName) return;

    if (searchKeyword.length >= 3) {
      const timer = setTimeout(() => {
        setPageNumber(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchKeyword]);

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Build a map of property configs for quick lookup
  const propertyConfigMap = {};
  if (currentObjectConfig?.properties) {
    for (const prop of currentObjectConfig.properties) {
      propertyConfigMap[prop.name] = prop;
    }
  }

  // Get display columns from data or config
  const getColumns = () => {
    const configProperties = currentObjectConfig?.properties || [];

    if (data.length > 0) {
      // Get columns from actual data, but enrich with property config
      const firstItem = data[0];
      const dataKeys = Object.keys(firstItem)
        .filter((key) => {
          // Filter out internal fields and joined objects (those are used for display, not as columns)
          if (key.startsWith("_") || key === "createdAt" || key === "updatedAt")
            return false;
          // Check if this key is a joined object (relation target) - skip it as column
          const prop = configProperties.find(
            (p) => p.relation?.joinName === key,
          );
          if (prop) return false; // This is joined data, not a column
          return true;
        })
        .slice(0, 7); // Limit to 7 columns for display

      // Return as column configs
      return dataKeys.map((key) => ({
        name: key,
        ...propertyConfigMap[key],
      }));
    }

    // Fall back to config - skip properties that are just relations without ID suffix
    if (configProperties.length > 0) {
      return configProperties
        .filter((p) => p.name !== "id")
        .slice(0, 7)
        .map((p) => ({
          name: p.name,
          ...p,
        }));
    }

    return [{ name: "id" }, { name: "name" }];
  };

  const columns = getColumns();

  // Format cell value for display (for non-relation columns)
  const formatCellValue = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") {
      // Detect GeoJSON Point objects and display nicely
      if (
        value.type === "Point" &&
        Array.isArray(value.coordinates) &&
        value.coordinates.length >= 2
      ) {
        const [lon, lat] = value.coordinates;
        return (
          <span
            className="font-mono text-xs"
            title={`lon: ${lon}, lat: ${lat}`}
          >
            {lat.toFixed(5)}, {lon.toFixed(5)}
          </span>
        );
      }
      const json = JSON.stringify(value);
      return json.length > 50 ? json.slice(0, 50) + "..." : json;
    }
    if (typeof value === "string" && value.length > 50)
      return value.slice(0, 50) + "...";
    return String(value);
  };

  // Get the joined data for a relation column
  const getJoinedData = (row, colConfig) => {
    if (!colConfig?.relation) return null;
    const joinName = colConfig.relation.joinName;
    return row[joinName] || null;
  };

  if (!serviceConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 dark:text-gray-400">
        <Database className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Service Not Found</h2>
        <p>
          The service "{serviceName}" does not exist or has no data objects.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Page Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Database className="w-7 h-7" />
            {serviceConfig.fullname}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {pageView === "data"
              ? `Browse and manage data in the ${serviceConfig.name} service`
              : `API documentation and testing for ${serviceConfig.name} service`}
          </p>
        </div>

        {/* Page View Tabs */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => handlePageViewChange("data")}
            className={cn(
              "px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors",
              pageView === "data"
                ? "bg-primary-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
            )}
          >
            <Database className="w-4 h-4" />
            Data
          </button>
          <button
            onClick={() => handlePageViewChange("api")}
            className={cn(
              "px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors border-l border-gray-200 dark:border-gray-700",
              pageView === "api"
                ? "bg-primary-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
            )}
          >
            <Code2 className="w-4 h-4" />
            API
          </button>
        </div>
      </div>

      {/* API Page View */}
      {pageView === "api" && (
        <div className="flex gap-4 h-[calc(100vh-180px)]">
          {/* Left Panel - API List (fixed width, fills height, internal scroll) */}
          <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={apiSearchKeyword}
                  onChange={(e) => setApiSearchKeyword(e.target.value)}
                  placeholder="Search APIs..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* API List */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(filteredGroupedApis).length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No APIs found
                </div>
              ) : (
                Object.entries(filteredGroupedApis).map(([group, apis]) => (
                  <div
                    key={group}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group)}
                      className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="capitalize">{group}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {apis.length}
                        </span>
                        {expandedGroups[group] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {/* API Items */}
                    {expandedGroups[group] && (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {apis.map((api) => (
                          <button
                            key={api.name}
                            onClick={() => setSelectedApi(api)}
                            className={cn(
                              "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                              selectedApi?.name === api.name &&
                                "bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-600",
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 text-xs font-mono font-semibold rounded",
                                  METHOD_COLORS[api.method],
                                )}
                              >
                                {api.method}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {api.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                                {api.routePath}
                              </code>
                              {api.loginRequired ? (
                                <Lock className="w-3 h-3 text-gray-400" />
                              ) : (
                                <Unlock className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* API Count Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500">
              {businessApis.length} API{businessApis.length !== 1 ? "s" : ""}{" "}
              total
            </div>
          </div>

          {/* Right Panel - API Details (Full Panel with Tabs) */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            {selectedApi ? (
              <>
                {/* API Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={cn(
                            "px-2 py-1 text-sm font-mono font-semibold rounded",
                            METHOD_COLORS[selectedApi.method],
                          )}
                        >
                          {selectedApi.method}
                        </span>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedApi.name}
                        </h2>
                        {loadingApiDetails && (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                      <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {selectedApi.routePath}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedApi.loginRequired && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          <Lock className="w-3 h-3" />
                          Auth Required
                        </div>
                      )}
                      {selectedApi.checkRoles?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                          <Shield className="w-3 h-3" />
                          {selectedApi.checkRoles.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedApi.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {selectedApi.description}
                    </p>
                  )}
                </div>

                {/* Tab Navigation */}
                <div className="px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setApiDetailTab("summary")}
                      className={cn(
                        "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2",
                        apiDetailTab === "summary"
                          ? "border-primary-600 text-primary-600 dark:text-primary-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                      )}
                    >
                      <Play className="w-4 h-4" />
                      Test
                    </button>
                    <button
                      onClick={() => setApiDetailTab("fullspec")}
                      className={cn(
                        "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2",
                        apiDetailTab === "fullspec"
                          ? "border-primary-600 text-primary-600 dark:text-primary-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                        !apiHtml && "opacity-50 cursor-not-allowed",
                      )}
                      disabled={!apiHtml}
                    >
                      <FileJson className="w-4 h-4" />
                      Full Specification
                      {!apiHtml && (
                        <span className="text-xs text-gray-400">
                          (Regenerate to enable)
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  {apiDetailTab === "summary" ? (
                    /* Test Tab - Custom API Tester */
                    <div className="flex-1 overflow-hidden">
                      <ApiTester
                        serviceName={serviceName}
                        apiName={selectedApi.name}
                        apiDetails={selectedApiDetails}
                      />
                    </div>
                  ) : (
                    /* Full Specification Tab (scrollable) - Pre-rendered HTML with syntax highlighting */
                    <div className="flex-1 overflow-y-auto p-6 api-doc-content prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-table:text-sm">
                      {apiHtml ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: apiHtml,
                          }}
                        />
                      ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <FileJson className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Full specification not available.</p>
                          <p className="text-sm mt-2">
                            Regenerate the project to enable detailed API
                            documentation.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an API from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Page View */}
      {pageView === "data" && (
        <>
          {/* Data Object Chips */}
          <div className="flex flex-wrap gap-2">
            {dataObjects.map((obj) => (
              <button
                key={obj.name}
                onClick={() => handleObjectChange(obj.name)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  selectedObject === obj.name
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
                )}
              >
                {obj.modelName}
              </button>
            ))}
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search (min 3 characters)..."
                className="input-field pl-10 pr-10"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pageRowCount}
                onChange={(e) => {
                  setPageRowCount(Number(e.target.value));
                  setPageNumber(1);
                }}
                className="input-field py-2 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>

              {hasCreate && (
                <button
                  onClick={openCreateForm}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Add {currentObjectConfig?.modelName || "Item"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && selectedObject && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
              {error}
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Data Grid + Map Split Layout */}

          {/* Grid Panel */}

          <div className="w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.name}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-1">
                            {col.relation && (
                              <LinkIcon className="w-3 h-3 opacity-50" />
                            )}
                            {col.name}
                          </div>
                        </th>
                      ))}

                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading && data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="px-6 py-12 text-center"
                        >
                          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                        </td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          No data found
                        </td>
                      </tr>
                    ) : (
                      data.map((row, index) => (
                        <tr
                          key={row.id || index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          {columns.map((col) => (
                            <td
                              key={col.name}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                            >
                              {col.relation ? (
                                <RelationCell
                                  value={row[col.name]}
                                  joinedData={getJoinedData(row, col)}
                                  propertyConfig={col}
                                />
                              ) : (
                                formatCellValue(row[col.name])
                              )}
                            </td>
                          ))}

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-primary-600"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {hasUpdate && (
                                <button
                                  onClick={() => openEditForm(row)}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-primary-600"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              {hasDelete &&
                                (deleteConfirmId === row.id ? (
                                  <span className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() => handleDelete(row.id)}
                                      disabled={deleting}
                                      className="px-2 py-0.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
                                    >
                                      {deleting ? "..." : "Yes"}
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                    >
                                      No
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(row.id)}
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-500 hover:text-red-600"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(pageNumber - 1) * pageRowCount + 1} to{" "}
                    {Math.min(pageNumber * pageRowCount, totalRows)} of{" "}
                    {totalRows} items
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber === 1 || loading}
                      className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPageNumber(Math.min(totalPages, pageNumber + 1))
                      }
                      disabled={pageNumber === totalPages || loading}
                      className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create / Edit Form Panel */}
      <RecordFormPanel
        isOpen={formOpen}
        onClose={closeForm}
        mode={formMode}
        objectConfig={currentObjectConfig}
        apiConfig={
          formMode === "create"
            ? currentDefaults.create
            : currentDefaults.update
        }
        record={editingRecord}
        serviceName={serviceName}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
