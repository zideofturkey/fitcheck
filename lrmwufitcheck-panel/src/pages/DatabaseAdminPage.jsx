import { useState, useEffect, useCallback } from "react";
import { createServiceClient, getServiceUrl } from "../services/apiClient";
import { useAuthStore } from "../stores/authStore";
import {
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Eye,
  Code,
  Trash2,
  RotateCcw,
  Loader2,
  Shield,
  Zap,
} from "lucide-react";

const toArr = (v) =>
  Array.isArray(v)
    ? v
    : typeof v === "string" && v.startsWith("{") && v.endsWith("}")
      ? v
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : v
        ? [v]
        : [];

const SERVICE_CONFIGS = [
  {
    name: "auth",
    fullname: "auth",
    codename: "auth",
    dbType: "postgresql",
    objects: [
      { objectName: "user", modelName: "User" },
      { objectName: "userAvatarsFile", modelName: "UserAvatarsFile" },
    ],
  },
  {
    name: "invitationCenter",
    fullname: "invitationCenter",
    codename: "invitationcenter",
    dbType: "postgresql",
    objects: [
      { objectName: "inviteLink", modelName: "InviteLink" },
      { objectName: "inviteAudit", modelName: "InviteAudit" },
    ],
  },
  {
    name: "nutritionLibrary",
    fullname: "nutritionLibrary",
    codename: "nutritionlibrary",
    dbType: "postgresql",
    objects: [
      { objectName: "macroTarget", modelName: "MacroTarget" },
      { objectName: "foodItem", modelName: "FoodItem" },
      { objectName: "presetMeal", modelName: "PresetMeal" },
      { objectName: "presetLine", modelName: "PresetLine" },
    ],
  },
  {
    name: "mealTracker",
    fullname: "mealTracker",
    codename: "mealtracker",
    dbType: "postgresql",
    objects: [
      { objectName: "mealLog", modelName: "MealLog" },
      { objectName: "mealLine", modelName: "MealLine" },
      { objectName: "nutritionDay", modelName: "NutritionDay" },
    ],
  },
  {
    name: "nutritionAi",
    fullname: "nutritionAi",
    codename: "nutritionai",
    dbType: "postgresql",
    objects: [
      { objectName: "aiSession", modelName: "AiSession" },
      { objectName: "aiCandidateMeal", modelName: "AiCandidateMeal" },
      { objectName: "aiCandidateLine", modelName: "AiCandidateLine" },
      { objectName: "aiGuidanceNote", modelName: "AiGuidanceNote" },
    ],
  },
  {
    name: "agentHub",
    fullname: "agentHub",
    codename: "agenthub",
    dbType: "postgresql",
    objects: [
      { objectName: "sys_agentOverride", modelName: "Sys_agentOverride" },
      { objectName: "sys_agentExecution", modelName: "Sys_agentExecution" },
      { objectName: "sys_toolCatalog", modelName: "Sys_toolCatalog" },
    ],
  },
];

function StatusBadge({ status }) {
  if (status === "in_sync")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="w-3 h-3" /> In Sync
      </span>
    );
  if (status === "out_of_sync")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        <AlertTriangle className="w-3 h-3" /> Out of Sync
      </span>
    );
  if (status === "no_table")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="w-3 h-3" /> Missing Table
      </span>
    );
  if (status === "loading")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
        <Loader2 className="w-3 h-3 animate-spin" /> Checking...
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
      Unknown
    </span>
  );
}

function SchemaViewer({ title, schema, type }) {
  const [expanded, setExpanded] = useState(true);
  if (!schema)
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">
        No schema data available
      </div>
    );

  if (type === "model") {
    const cols = schema.columns || {};
    const indexes = schema.indexes || [];
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <span>
            {title} ({Object.keys(cols).length} columns, {indexes.length}{" "}
            indexes)
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expanded && (
          <div className="p-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-2 pr-3">Column</th>
                  <th className="pb-2 pr-3">Type</th>
                  <th className="pb-2 pr-3">Nullable</th>
                  <th className="pb-2">Default</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cols).map(([name, def]) => (
                  <tr
                    key={name}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-1.5 pr-3 font-mono text-gray-800 dark:text-gray-200">
                      {name}
                      {def.primaryKey && (
                        <span className="ml-1 text-yellow-500">PK</span>
                      )}
                    </td>
                    <td className="py-1.5 pr-3 text-blue-600 dark:text-blue-400 font-mono">
                      {typeof def.type === "string"
                        ? def.type
                        : def.type?.toString?.() || "unknown"}
                    </td>
                    <td className="py-1.5 pr-3">
                      {def.allowNull !== false ? (
                        <span className="text-green-600">yes</span>
                      ) : (
                        <span className="text-red-500">no</span>
                      )}
                    </td>
                    <td className="py-1.5 text-gray-500 dark:text-gray-400 font-mono">
                      {def.defaultValue != null
                        ? String(def.defaultValue)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {indexes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Indexes
                </p>
                {indexes.map((idx, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono text-gray-600 dark:text-gray-400 py-0.5"
                  >
                    {idx.unique && (
                      <span className="text-yellow-600 mr-1">UNIQUE</span>
                    )}
                    {idx.using && (
                      <span className="text-purple-600 mr-1">{idx.using}</span>
                    )}
                    [{toArr(idx.fields).join(", ")}]
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // DB schema view
  const columns = schema.columns || [];
  const indexes = schema.indexes || [];
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>
          {title} ({columns.length} columns, {indexes.length} indexes)
        </span>
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      {expanded && (
        <div className="p-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="pb-2 pr-3">Column</th>
                <th className="pb-2 pr-3">Type</th>
                <th className="pb-2 pr-3">Nullable</th>
                <th className="pb-2">Default</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => (
                <tr
                  key={col.name}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-1.5 pr-3 font-mono text-gray-800 dark:text-gray-200">
                    {col.name}
                  </td>
                  <td className="py-1.5 pr-3 text-blue-600 dark:text-blue-400 font-mono">
                    {col.udtName || col.dataType}
                  </td>
                  <td className="py-1.5 pr-3">
                    {col.nullable ? (
                      <span className="text-green-600">yes</span>
                    ) : (
                      <span className="text-red-500">no</span>
                    )}
                  </td>
                  <td className="py-1.5 text-gray-500 dark:text-gray-400 font-mono text-[10px]">
                    {col.defaultValue || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {indexes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Indexes
              </p>
              {indexes.map((idx, i) => (
                <div
                  key={i}
                  className="text-xs font-mono text-gray-600 dark:text-gray-400 py-0.5"
                >
                  {idx.unique && (
                    <span className="text-yellow-600 mr-1">UNIQUE</span>
                  )}
                  {idx.primary && (
                    <span className="text-green-600 mr-1">PRIMARY</span>
                  )}
                  <span className="text-purple-600 mr-1">{idx.type}</span>
                  {idx.name}: [{toArr(idx.columns).join(", ")}]
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompareView({ diff }) {
  if (!diff) return null;
  if (diff.inSync) {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 text-sm">
        <CheckCircle className="w-5 h-5" /> Schemas are in sync. No differences
        found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-700 dark:text-yellow-400 text-sm">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span>
          {diff.summary?.totalDifferences || 0} difference(s) found between
          model and database
        </span>
      </div>
      {(diff.addedColumns || []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
            Missing in Database (in model, not in DB)
          </p>
          {diff.addedColumns.map((col, i) => (
            <div
              key={i}
              className="text-xs font-mono py-1 px-2 bg-yellow-50 dark:bg-yellow-900/10 rounded text-yellow-800 dark:text-yellow-300"
            >
              + {col.name}:{" "}
              {typeof col.modelDefinition?.type === "string"
                ? col.modelDefinition.type
                : "unknown"}
            </div>
          ))}
        </div>
      )}
      {(diff.removedColumns || []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            Extra in Database (in DB, not in model)
          </p>
          {diff.removedColumns.map((col, i) => (
            <div
              key={i}
              className="text-xs font-mono py-1 px-2 bg-blue-50 dark:bg-blue-900/10 rounded text-blue-800 dark:text-blue-300"
            >
              - {col.name}
            </div>
          ))}
        </div>
      )}
      {(diff.modifiedColumns || []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
            Type/Constraint Mismatches
          </p>
          {diff.modifiedColumns.map((col, i) => (
            <div
              key={i}
              className="text-xs py-1 px-2 bg-red-50 dark:bg-red-900/10 rounded text-red-800 dark:text-red-300"
            >
              <span className="font-mono font-semibold">{col.name}</span>:{" "}
              {col.changes.map((c, j) => (
                <span key={j}>{c.message}</span>
              ))}
            </div>
          ))}
        </div>
      )}
      {(diff.indexDifferences || []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            Index Differences
          </p>
          {diff.indexDifferences.map((idx, i) => (
            <div
              key={i}
              className="text-xs font-mono py-1 px-2 bg-purple-50 dark:bg-purple-900/10 rounded text-purple-800 dark:text-purple-300"
            >
              {idx.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MigrationPreview({ migration, onExecute, executing }) {
  const [showDown, setShowDown] = useState(false);
  if (!migration) return null;

  const hasStrategies = (migration.strategies || []).length > 0;
  const hasBackups = (migration.backupTables || []).length > 0;
  const hasDangerousSteps = (migration.steps || []).some(
    (s) => s.risk === "dangerous",
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Generated Migration
        </p>
        <button
          onClick={() => onExecute(migration.code)}
          disabled={executing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {executing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Play className="w-3 h-3" />
          )}
          Apply Migration
        </button>
      </div>

      {/* Strategy Summary */}
      {hasStrategies && (
        <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-3 bg-purple-50 dark:bg-purple-900/10">
          <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">
            Auto-Selected Strategies
          </p>
          <div className="space-y-1.5">
            {migration.strategies.map((s, i) => (
              <div key={i} className="text-xs flex items-start gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${s.risk === "critical" ? "bg-red-100 text-red-700" : s.risk === "high" ? "bg-orange-100 text-orange-700" : s.risk === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                >
                  {s.risk}
                </span>
                <div>
                  <span className="font-mono text-purple-800 dark:text-purple-300">
                    {s.field}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {" "}
                    — {s.label}:{" "}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {s.strategyName}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-[10px] ml-1">
                    ({s.autoReason})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backup Tables */}
      {hasBackups && (
        <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-xs text-blue-700 dark:text-blue-400">
          <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium">Data backups will be created: </span>
            {migration.backupTables.map((t, i) => (
              <span key={i} className="font-mono">
                {i > 0 && ", "}
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {(migration.warnings || []).length > 0 && (
        <div className="space-y-1">
          {migration.warnings.map((w, i) => (
            <div
              key={i}
              className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-1"
            >
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> {w}
            </div>
          ))}
        </div>
      )}

      {/* Steps */}
      <div className="text-xs space-y-1">
        <p className="font-medium text-gray-600 dark:text-gray-400 mb-1">
          Migration Steps ({migration.steps?.length || 0})
        </p>
        {(migration.steps || []).map((step, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <span className="text-gray-400 dark:text-gray-500 w-4 text-right">
              {i + 1}.
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${step.phase === "backup" ? "bg-blue-100 text-blue-700" : step.risk === "dangerous" ? "bg-red-100 text-red-700" : step.risk === "moderate" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
            >
              {step.phase === "backup"
                ? "backup"
                : step.phase === "pre_fix"
                  ? "pre-fix"
                  : step.risk}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {step.description}
            </span>
          </div>
        ))}
      </div>

      {/* Migration Code */}
      <div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Migration SQL
        </p>
        <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto max-h-80 font-mono">
          {migration.code}
        </pre>
      </div>

      {/* Rollback Code */}
      {migration.downCode && migration.downCode !== "-- No rollback steps" && (
        <div>
          <button
            onClick={() => setShowDown(!showDown)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
          >
            {showDown ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            Rollback SQL (down migration)
          </button>
          {showDown && (
            <pre className="mt-1 bg-gray-900 text-orange-400 text-xs p-4 rounded-lg overflow-x-auto max-h-60 font-mono">
              {migration.downCode}
            </pre>
          )}
        </div>
      )}

      {hasDangerousSteps && (
        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg text-xs text-red-700 dark:text-red-400">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            This migration contains dangerous steps. Data backups have been
            included. Review the SQL carefully before applying.
          </span>
        </div>
      )}
    </div>
  );
}

function ConfirmationInput({
  label,
  expectedValue,
  onConfirm,
  buttonLabel,
  buttonColor = "red",
  loading,
}) {
  const [value, setValue] = useState("");
  const isMatch = value === expectedValue;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
        Type:{" "}
        <span className="text-red-600 dark:text-red-400 font-semibold">
          {expectedValue}
        </span>
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type confirmation text..."
          className="flex-1 text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <button
          onClick={() => {
            onConfirm();
            setValue("");
          }}
          disabled={!isMatch || loading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg disabled:opacity-50 ${buttonColor === "red" ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"}`}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export default function DatabaseAdminPage() {
  const { user } = useAuthStore();
  const roleId = Array.isArray(user?.roleId) ? user.roleId[0] : user?.roleId;
  const canAccess = ["superAdmin", "admin", "saasAdmin"].includes(roleId);

  const [selectedService, setSelectedService] = useState("");
  const [selectedObject, setSelectedObject] = useState("");
  const [activeTab, setActiveTab] = useState("compare");

  // Data states
  const [dbStatus, setDbStatus] = useState(null);
  const [modelSchema, setModelSchema] = useState(null);
  const [dbSchema, setDbSchema] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [migrationData, setMigrationData] = useState(null);
  const [objectStatuses, setObjectStatuses] = useState({});

  // Loading/action states
  const [loading, setLoading] = useState({});
  const [actionResult, setActionResult] = useState(null);

  // Service health tracking
  const [serviceHealth, setServiceHealth] = useState({});
  const [healthChecked, setHealthChecked] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const status = {};
      await Promise.all(
        SERVICE_CONFIGS.map(async (svc) => {
          try {
            const url = getServiceUrl(svc.codename);
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${url}/health`, {
              method: "GET",

              signal: controller.signal,
            });
            clearTimeout(tid);
            status[svc.codename] = res.ok;
          } catch {
            status[svc.codename] = false;
          }
        }),
      );
      setServiceHealth(status);
      setHealthChecked(true);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!healthChecked) return;
    if (selectedService && serviceHealth[selectedService] !== false) return;
    const firstHealthy = SERVICE_CONFIGS.find(
      (s) => serviceHealth[s.codename] !== false,
    );
    if (firstHealthy) setSelectedService(firstHealthy.codename);
    else setSelectedService("");
  }, [healthChecked, serviceHealth]);

  const serviceConfig = SERVICE_CONFIGS.find(
    (s) => s.codename === selectedService,
  );
  const client = selectedService ? createServiceClient(selectedService) : null;

  const setLoadingKey = (key, val) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  const fetchDbStatus = useCallback(async () => {
    if (!client) return;
    setLoadingKey("dbStatus", true);
    try {
      const { data } = await client.get("/v1/_dbadmin/database/status");
      setDbStatus(data);
    } catch (err) {
      setDbStatus({
        error: err.response?.data?.error || err.message,
        connected: false,
      });
    }
    setLoadingKey("dbStatus", false);
  }, [selectedService]);

  const fetchObjectStatuses = useCallback(async () => {
    if (!client || !serviceConfig) return;
    const statuses = {};
    for (const obj of serviceConfig.objects) {
      statuses[obj.objectName] = "loading";
    }
    setObjectStatuses(statuses);

    for (const obj of serviceConfig.objects) {
      try {
        const { data } = await client.get(
          `/v1/_dbadmin/objects/${obj.objectName}/compare`,
        );
        statuses[obj.objectName] =
          data.tableExists === false
            ? "no_table"
            : data.inSync
              ? "in_sync"
              : "out_of_sync";
      } catch {
        statuses[obj.objectName] = "error";
      }
      setObjectStatuses({ ...statuses });
    }
  }, [selectedService]);

  const fetchModelSchema = useCallback(
    async (objectName) => {
      if (!client) return;
      setLoadingKey("modelSchema", true);
      try {
        const { data } = await client.get(
          `/v1/_dbadmin/objects/${objectName}/model-schema`,
        );
        setModelSchema(data.schema);
      } catch (err) {
        setModelSchema(null);
      }
      setLoadingKey("modelSchema", false);
    },
    [selectedService],
  );

  const fetchDbSchema = useCallback(
    async (objectName) => {
      if (!client) return;
      setLoadingKey("dbSchema", true);
      try {
        const { data } = await client.get(
          `/v1/_dbadmin/objects/${objectName}/db-schema`,
        );
        setDbSchema(data.schema);
      } catch (err) {
        setDbSchema(null);
      }
      setLoadingKey("dbSchema", false);
    },
    [selectedService],
  );

  const fetchCompare = useCallback(
    async (objectName) => {
      if (!client) return;
      setLoadingKey("compare", true);
      try {
        const { data } = await client.get(
          `/v1/_dbadmin/objects/${objectName}/compare`,
        );
        setCompareResult(data);
      } catch (err) {
        setCompareResult({ error: err.message });
      }
      setLoadingKey("compare", false);
    },
    [selectedService],
  );

  // Actions
  const doSync = async (objectName) => {
    setLoadingKey("sync", true);
    setActionResult(null);
    try {
      const { data } = await client.post(
        `/v1/_dbadmin/objects/${objectName}/sync`,
      );
      setActionResult({ type: "success", message: data.message });
      fetchCompare(objectName);
      fetchObjectStatuses();
    } catch (err) {
      setActionResult({
        type: "error",
        message: err.response?.data?.error || err.message,
      });
    }
    setLoadingKey("sync", false);
  };

  const doSyncForce = async (objectName) => {
    setLoadingKey("syncForce", true);
    setActionResult(null);
    try {
      const { data } = await client.post(
        `/v1/_dbadmin/objects/${objectName}/sync-force`,
        { confirmation: `DROP TABLE ${objectName}` },
      );
      setActionResult({ type: "success", message: data.message });
      fetchCompare(objectName);
      fetchObjectStatuses();
    } catch (err) {
      setActionResult({
        type: "error",
        message: err.response?.data?.error || err.message,
      });
    }
    setLoadingKey("syncForce", false);
  };

  const doGenerateMigration = async (objectName) => {
    setLoadingKey("migration", true);
    setMigrationData(null);
    try {
      const { data } = await client.post(
        `/v1/_dbadmin/objects/${objectName}/migration/generate`,
      );
      setMigrationData(data);
    } catch (err) {
      setActionResult({
        type: "error",
        message: err.response?.data?.error || err.message,
      });
    }
    setLoadingKey("migration", false);
  };

  const doExecuteMigration = async (migrationCode) => {
    setLoadingKey("executeMigration", true);
    setActionResult(null);
    try {
      const { data } = await client.post(
        `/v1/_dbadmin/objects/${selectedObject}/migration/execute`,
        { migrationCode },
      );
      if (data.status === "success") {
        setActionResult({
          type: "success",
          message: "Migration executed successfully",
        });
        setMigrationData(null);
        fetchCompare(selectedObject);
        fetchObjectStatuses();
      } else {
        setActionResult({
          type: "error",
          message: data.error || "Migration failed",
        });
      }
    } catch (err) {
      setActionResult({
        type: "error",
        message: err.response?.data?.error || err.message,
      });
    }
    setLoadingKey("executeMigration", false);
  };

  const doDropRecreate = async (objectName) => {
    setLoadingKey("dropRecreate", true);
    setActionResult(null);
    try {
      const { data } = await client.post(
        `/v1/_dbadmin/objects/${objectName}/drop-recreate`,
        { confirmation: `DROP AND RECREATE ${objectName}` },
      );
      setActionResult({ type: "success", message: data.message });
      fetchCompare(objectName);
      fetchObjectStatuses();
    } catch (err) {
      setActionResult({
        type: "error",
        message: err.response?.data?.error || err.message,
      });
    }
    setLoadingKey("dropRecreate", false);
  };

  const doResetDatabase = async () => {
    setLoadingKey("resetDb", true);
    setActionResult(null);
    try {
      const { data } = await client.post("/v1/_dbadmin/database/reset", {
        confirmation: "RESET DATABASE",
      });
      setActionResult({ type: "success", message: data.message });
      fetchDbStatus();
      fetchObjectStatuses();
    } catch (err) {
      setActionResult({
        type: "error",
        message: err.response?.data?.error || err.message,
      });
    }
    setLoadingKey("resetDb", false);
  };

  useEffect(() => {
    if (selectedService) {
      fetchDbStatus();
      fetchObjectStatuses();
      setSelectedObject("");
      setModelSchema(null);
      setDbSchema(null);
      setCompareResult(null);
      setMigrationData(null);
      setActionResult(null);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedObject) {
      fetchModelSchema(selectedObject);
      fetchDbSchema(selectedObject);
      fetchCompare(selectedObject);
      setMigrationData(null);
      setActionResult(null);
    }
  }, [selectedObject]);

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Access Denied
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Database administration requires superAdmin, admin, or saasAdmin
            role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-7 h-7 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Database Administration
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Inspect schemas, compare models, and manage database tables
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchDbStatus();
            fetchObjectStatuses();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading.dbStatus ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </button>
      </div>

      {/* Service Selector */}
      <div className="flex gap-2 mb-4">
        {SERVICE_CONFIGS.map((svc) => {
          const isHealthy = healthChecked
            ? serviceHealth[svc.codename] !== false
            : true;
          return (
            <button
              key={svc.codename}
              onClick={() => isHealthy && setSelectedService(svc.codename)}
              disabled={!isHealthy}
              title={
                !isHealthy ? `${svc.fullname} service is not responding` : ""
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isHealthy
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                  : selectedService === svc.codename
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {svc.fullname}
              {healthChecked && !isHealthy && (
                <span className="ml-1.5 text-[10px] text-red-400">
                  (offline)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* DB Status Bar */}
      {dbStatus && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-3 ${dbStatus.connected ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}
        >
          {dbStatus.connected ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="font-medium">{dbStatus.database}</span>
          {dbStatus.connected && (
            <span className="text-xs">
              ({dbStatus.tableCount} tables, {dbStatus.size})
            </span>
          )}
          {dbStatus.error && <span>{dbStatus.error}</span>}
        </div>
      )}

      {/* Object Chips */}
      {serviceConfig && (
        <div className="flex flex-wrap gap-2 mb-6">
          {serviceConfig.objects.map((obj) => (
            <button
              key={obj.objectName}
              onClick={() => setSelectedObject(obj.objectName)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedObject === obj.objectName
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {obj.objectName}
              <StatusBadge status={objectStatuses[obj.objectName]} />
            </button>
          ))}
        </div>
      )}

      {/* Action Result Toast */}
      {actionResult && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${actionResult.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}
        >
          {actionResult.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {actionResult.message}
          <button
            onClick={() => setActionResult(null)}
            className="ml-auto text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content - only when an object is selected */}
      {selectedObject && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: "compare", label: "Compare", icon: Eye },
              { id: "schema", label: "Schemas", icon: Code },
              { id: "actions", label: "Actions", icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Compare Tab */}
          {activeTab === "compare" && (
            <div>
              {loading.compare ? (
                <div className="flex items-center gap-2 p-8 justify-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" /> Comparing
                  schemas...
                </div>
              ) : (
                <CompareView diff={compareResult} />
              )}
            </div>
          )}

          {/* Schema Tab */}
          {activeTab === "schema" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                {loading.modelSchema ? (
                  <div className="flex items-center gap-2 p-8 justify-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading model
                    schema...
                  </div>
                ) : (
                  <SchemaViewer
                    title="Data Model Schema"
                    schema={modelSchema}
                    type="model"
                  />
                )}
              </div>
              <div>
                {loading.dbSchema ? (
                  <div className="flex items-center gap-2 p-8 justify-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading DB
                    schema...
                  </div>
                ) : (
                  <SchemaViewer
                    title="Database Table Schema"
                    schema={dbSchema}
                    type="db"
                  />
                )}
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === "actions" && (
            <div className="space-y-6">
              {/* Safe Sync */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Safe Sync (Alter)
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sync table with model using ALTER. Adds missing columns,
                      adjusts types where possible. No data loss.
                    </p>
                  </div>
                  <button
                    onClick={() => doSync(selectedObject)}
                    disabled={loading.sync}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading.sync ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}{" "}
                    Sync
                  </button>
                </div>
              </div>

              {/* Smart Sync (Migration) */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Smart Sync (Migration)
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Generate migration SQL from schema diff. Review the code
                      before applying.
                    </p>
                  </div>
                  <button
                    onClick={() => doGenerateMigration(selectedObject)}
                    disabled={loading.migration}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading.migration ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Code className="w-4 h-4" />
                    )}{" "}
                    Generate Migration
                  </button>
                </div>
                {migrationData?.status === "in_sync" && (
                  <div className="mt-3 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Schemas are already in
                    sync.
                  </div>
                )}
                {migrationData?.status === "migration_generated" && (
                  <div className="mt-4">
                    <MigrationPreview
                      migration={migrationData.migration}
                      onExecute={doExecuteMigration}
                      executing={loading.executeMigration}
                    />
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              <div className="border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm font-bold text-red-700 dark:text-red-400">
                    Danger Zone
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Force Sync */}
                  <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                      Force Sync Table
                    </h4>
                    <p className="text-xs text-red-600 dark:text-red-500 mb-2">
                      Drops and recreates the table. ALL DATA IN THIS TABLE WILL
                      BE LOST.
                    </p>
                    <ConfirmationInput
                      label="Type the confirmation to proceed:"
                      expectedValue={`DROP TABLE ${selectedObject}`}
                      onConfirm={() => doSyncForce(selectedObject)}
                      buttonLabel="Force Sync"
                      loading={loading.syncForce}
                    />
                  </div>

                  {/* Drop & Recreate */}
                  <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                      Drop & Recreate Table
                    </h4>
                    <p className="text-xs text-red-600 dark:text-red-500 mb-2">
                      Drops the table with CASCADE and recreates it from the
                      model. ALL DATA AND DEPENDENT OBJECTS WILL BE LOST.
                    </p>
                    <ConfirmationInput
                      label="Type the confirmation to proceed:"
                      expectedValue={`DROP AND RECREATE ${selectedObject}`}
                      onConfirm={() => doDropRecreate(selectedObject)}
                      buttonLabel="Drop & Recreate"
                      loading={loading.dropRecreate}
                    />
                  </div>

                  {/* Reset Database */}
                  <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-300 dark:border-red-700">
                    <h4 className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">
                      Reset Entire Database
                    </h4>
                    <p className="text-xs text-red-600 dark:text-red-500 mb-2">
                      Drops the entire service database, creates a new empty
                      database, and runs sequelize sync. ALL DATA FOR ALL TABLES
                      WILL BE PERMANENTLY DELETED. The service must be restarted
                      after this operation.
                    </p>
                    <ConfirmationInput
                      label="Type the confirmation to proceed:"
                      expectedValue="RESET DATABASE"
                      onConfirm={doResetDatabase}
                      buttonLabel="Reset Database"
                      loading={loading.resetDb}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state when no object selected */}
      {!selectedObject && serviceConfig && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
          <Database className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">Select a data object to inspect</p>
          <p className="text-sm mt-1">
            Click one of the object chips above to view its schema and status
          </p>
        </div>
      )}
    </div>
  );
}
