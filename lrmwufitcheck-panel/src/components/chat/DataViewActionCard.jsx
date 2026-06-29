import { useCallback, useEffect, useMemo, useState } from "react";
import { Grid3X3, Image, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { createServiceClient } from "../../services/apiClient";
import { useChatStore } from "../../stores/chatStore";

const COMMON_IMAGE_FIELDS = [
  "image",
  "imageUrl",
  "thumbnail",
  "thumbnailUrl",
  "photo",
  "photoUrl",
];

function pickArrayPayload(payload, preferredField) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  if (preferredField && Array.isArray(payload[preferredField])) {
    return payload[preferredField];
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value;
  }

  return [];
}

function formatCellValue(value, format) {
  if (value == null) return "-";
  if (format === "boolean") return value ? "Yes" : "No";
  if (format === "number") {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString() : String(value);
  }
  if (format === "currency") {
    const n = Number(value);
    return Number.isFinite(n)
      ? n.toLocaleString(undefined, { style: "currency", currency: "USD" })
      : String(value);
  }
  if (format === "date" || format === "datetime") {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return format === "date" ? d.toLocaleDateString() : d.toLocaleString();
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function DataViewActionCard({ action }) {
  const {
    viewType = "grid",
    title = "Data View",
    serviceName,
    routePath,
    httpMethod = "GET",
    queryParams = {},
    columns = [],
    dataField,
    imageField,
    titleField,
    subtitleField,
    geoField,
  } = action || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const { setBrowserView } = useChatStore();

  const fetchData = useCallback(async () => {
    if (!serviceName || !routePath) {
      setError("Missing serviceName or routePath in action payload.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = createServiceClient(serviceName);
      const method = String(httpMethod || "GET").toLowerCase();
      const response = await client.request({
        method,
        url: routePath,
        params: method === "get" ? queryParams : undefined,
        data: method !== "get" ? queryParams : undefined,
      });
      const payload = response?.data;
      const list = pickArrayPayload(payload, dataField);
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to fetch data",
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [serviceName, routePath, httpMethod, queryParams, dataField]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const gridColumns = useMemo(() => {
    if (Array.isArray(columns) && columns.length > 0) {
      return columns.filter((c) => c?.field);
    }
    const firstRow = rows[0] || {};
    return Object.keys(firstRow)
      .filter((k) => !k.startsWith("_"))
      .slice(0, 8)
      .map((field) => ({ field, label: field }));
  }, [columns, rows]);

  const resolvedImageField = useMemo(() => {
    if (imageField) return imageField;
    const firstRow = rows[0] || {};
    return (
      COMMON_IMAGE_FIELDS.find((key) => typeof firstRow[key] === "string") ||
      null
    );
  }, [imageField, rows]);

  const body = (
    <div className="px-4 py-3">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
          No rows returned.
        </div>
      ) : viewType === "map" ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/40">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">
            Map view is prepared
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Open in visual browser to see map + bottom grid. Geo field:{" "}
            <code>{geoField || "location"}</code>
          </div>
        </div>
      ) : viewType === "gallery" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.slice(0, 24).map((row, idx) => {
            const imageSrc = resolvedImageField
              ? row?.[resolvedImageField]
              : null;
            const cardTitle = titleField
              ? row?.[titleField]
              : row?.name || row?.title || row?.id || `Item ${idx + 1}`;
            const cardSubtitle = subtitleField
              ? row?.[subtitleField]
              : row?.description || null;
            return (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
              >
                {typeof imageSrc === "string" && imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={String(cardTitle || `item-${idx}`)}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-800" />
                )}
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {String(cardTitle)}
                  </div>
                  {cardSubtitle != null && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {String(cardSubtitle)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {gridColumns.map((col) => (
                  <th
                    key={col.field}
                    className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {col.label || col.field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  {gridColumns.map((col) => (
                    <td
                      key={col.field}
                      className="py-2 pr-4 text-gray-900 dark:text-gray-100 align-top"
                    >
                      {formatCellValue(row?.[col.field], col.format)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="my-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-white dark:from-sky-900/20 dark:to-gray-800 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-sky-100 dark:border-sky-800/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            {viewType === "gallery" ? (
              <Image className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            ) : (
              <Grid3X3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {serviceName} · {httpMethod.toUpperCase()} {routePath}
            </div>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (viewType === "map") {
              setBrowserView({
                type: "map",
                title,
                rows,
                geoField: geoField || "location",
                titleField: titleField || "name",
              });
            } else {
              setBrowserView({
                type: "dataView",
                title,
                action,
              });
            }
          }}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Open in visual browser"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
      </div>
      {body}
    </div>
  );
}
