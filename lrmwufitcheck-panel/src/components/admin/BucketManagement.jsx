import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Loader2,
  Upload,
  Download,
  Trash2,
  Database,
  Cloud,
  FileText,
  Search,
  AlertCircle,
  X,
  ChevronRight,
  Terminal,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ALL_BUCKETS,
  uploadFile,
  listFiles,
  deleteFile,
  downloadFileToDisk,
  getDownloadUrl,
} from "../../services/bucketApi";
import BucketEndpointTester from "./BucketEndpointTester";

/**
 * BucketManagement — admin tab listing every DbBucket + RemoteBucket
 * on the project and letting admins browse / upload / download /
 * delete files for any of them.
 *
 * The bucket list itself comes from `ALL_BUCKETS` (build-time, no
 * runtime discovery). File listing + bytes flow through the bucket-API
 * helper which authenticates via the owning service's regular access
 * token.
 *
 * UX: two-pane layout — bucket list on the left (with kind chips +
 * search), file grid on the right with an "Upload" action at the top.
 * Selecting a bucket loads its files via the metadata list API; the
 * grid supports preview (images) + download + delete per file.
 */

function isImageMime(mime) {
  return typeof mime === "string" && mime.startsWith("image/");
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function BucketRow({ bucket, selected, onSelect }) {
  const Icon = bucket.kind === "remote" ? Cloud : Database;
  return (
    <button
      type="button"
      onClick={() => onSelect(bucket)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        selected
          ? "bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800"
          : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent"
      }`}
    >
      <div
        className={`p-1.5 rounded ${bucket.kind === "remote" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {bucket.bucketName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {bucket.serviceName} · {bucket.kind}
        </p>
      </div>
      {selected && <ChevronRight className="w-4 h-4 text-primary-500" />}
    </button>
  );
}

function FileTile({ bucket, file, onDelete, onPreview, deleting }) {
  const isImage = isImageMime(file.mimeType);
  const previewUrl = isImage ? getDownloadUrl(bucket, file) : null;
  return (
    <div className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={() => onPreview(file)}
        className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden"
        title={file.fileName}
      >
        {previewUrl ? (
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img
            src={previewUrl}
            alt={file.fileName || "file"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <FileText className="w-10 h-10 text-gray-400" />
        )}
      </button>
      <div className="p-2 text-xs">
        <p
          className="truncate text-gray-900 dark:text-white"
          title={file.fileName}
        >
          {file.fileName || "(no name)"}
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          {formatBytes(file.fileSize)} · {file.mimeType || "unknown"}
        </p>
        {file[bucket.ownerProp] && (
          <p
            className="text-gray-400 dark:text-gray-500 truncate"
            title={file[bucket.ownerProp]}
          >
            owner: {String(file[bucket.ownerProp]).slice(0, 8)}…
          </p>
        )}
      </div>
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() =>
            downloadFileToDisk(bucket, file).catch((e) =>
              toast.error(e.message || "Download failed"),
            )
          }
          className="p-1.5 rounded bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 shadow"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(file)}
          disabled={deleting}
          className="p-1.5 rounded bg-white/90 dark:bg-gray-900/90 hover:bg-red-500 hover:text-white text-gray-700 dark:text-gray-200 shadow disabled:opacity-50"
          title="Delete"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

function PreviewModal({ bucket, file, onClose }) {
  if (!file) return null;
  const url = getDownloadUrl(bucket, file);
  const isImage = isImageMime(file.mimeType);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <div
        className="max-w-5xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage ? (
          <img
            src={url}
            alt={file.fileName}
            className="max-w-full max-h-[80vh] object-contain rounded"
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-900 dark:text-white font-medium">
              {file.fileName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatBytes(file.fileSize)} · {file.mimeType || "unknown"}
            </p>
            <button
              type="button"
              onClick={() => downloadFileToDisk(bucket, file)}
              className="mt-4 btn-primary text-sm inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BucketFilesPanel({ bucket }) {
  const inputRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(null);
  const [ownerFilter, setOwnerFilter] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { rows: r, rowCount: c } = await listFiles(bucket, {
        ownerId: ownerFilter || undefined,
        pageRowCount: 200,
      });
      setRows(r);
      setRowCount(c);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Failed to load files",
      );
    } finally {
      setLoading(false);
    }
  }, [bucket, ownerFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleFiles = useCallback(
    async (files) => {
      if (!files || !files.length) return;
      const maxBytes = (bucket.maxFileSizeMb || 10) * 1024 * 1024;
      for (const file of files) {
        if (file.size > maxBytes) {
          toast.error(
            `${file.name} is ${formatBytes(file.size)}, max ${formatBytes(maxBytes)}`,
          );
          continue;
        }
        try {
          setProgress({ name: file.name, pct: 0 });
          await uploadFile(bucket, file, {
            ownerId: ownerFilter || undefined,
            onProgress: (pct) => setProgress({ name: file.name, pct }),
          });
          toast.success(`Uploaded ${file.name}`);
        } catch (e) {
          toast.error(
            e.response?.data?.message || e.message || "Upload failed",
          );
        } finally {
          setProgress(null);
        }
      }
      if (inputRef.current) inputRef.current.value = "";
      refresh();
    },
    [bucket, ownerFilter, refresh],
  );

  const handleDelete = useCallback(
    async (file) => {
      if (!window.confirm(`Delete "${file.fileName || file.id}"?`)) return;
      setDeletingId(file.id);
      try {
        await deleteFile(bucket, file);
        toast.success("File deleted");
        refresh();
      } catch (e) {
        toast.error(e.response?.data?.message || e.message || "Delete failed");
      } finally {
        setDeletingId(null);
      }
    },
    [bucket, refresh],
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {bucket.kind === "remote" ? (
              <Cloud className="w-5 h-5 text-blue-500" />
            ) : (
              <Database className="w-5 h-5 text-emerald-500" />
            )}
            {bucket.bucketName}
            <span className="text-xs font-normal px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {bucket.kind}
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <span className="font-mono">{bucket.serviceName}</span>
            {bucket.description && <> · {bucket.description}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={!!progress}
            className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            {progress ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress.name} — {progress.pct}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={
              bucket.allowedMimeTypes && bucket.allowedMimeTypes !== "*"
                ? bucket.allowedMimeTypes
                : undefined
            }
            className="hidden"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          />
        </div>
      </div>

      {/* Metadata strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1.5">
          <p className="text-gray-500 dark:text-gray-400">Read</p>
          <p className="text-gray-900 dark:text-white font-medium">
            {bucket.readAccess}
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1.5">
          <p className="text-gray-500 dark:text-gray-400">Write</p>
          <p className="text-gray-900 dark:text-white font-medium">
            {bucket.writeAccess}
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1.5">
          <p className="text-gray-500 dark:text-gray-400">Max size</p>
          <p className="text-gray-900 dark:text-white font-medium">
            {bucket.maxFileSizeMb} MB
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1.5">
          <p className="text-gray-500 dark:text-gray-400">Owner</p>
          <p className="text-gray-900 dark:text-white font-medium truncate">
            {bucket.ownerObjectName || "—"}
          </p>
        </div>
      </div>

      {/* Owner filter (only when bucket has an owner FK) */}
      {bucket.ownerProp && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Filter by {bucket.ownerProp}:
          </label>
          <input
            type="text"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            placeholder={`paste a ${bucket.ownerObjectName} id`}
            className="form-input text-xs flex-1 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {ownerFilter && (
            <button
              type="button"
              onClick={() => setOwnerFilter("")}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              clear
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {rowCount} file{rowCount === 1 ? "" : "s"}
        {ownerFilter ? " for this owner" : ""}
      </p>

      {/* Files */}
      {loading ? (
        <div className="py-12 flex justify-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="py-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">
          No files in this bucket.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {rows.map((file) => (
            <FileTile
              key={file.id}
              bucket={bucket}
              file={file}
              onDelete={handleDelete}
              onPreview={setPreview}
              deleting={deletingId === file.id}
            />
          ))}
        </div>
      )}

      <PreviewModal
        bucket={bucket}
        file={preview}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}

export default function BucketManagement() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(ALL_BUCKETS[0] || null);
  // 'files' = day-to-day browser (existing); 'endpoints' = raw API tester
  // for the bucket-layer routes (upload / list / download / delete). The
  // tester surface is most useful for RemoteBuckets — for DbBuckets it
  // renders an explanatory empty-state.
  const [view, setView] = useState("files");

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_BUCKETS;
    const q = search.toLowerCase();
    return ALL_BUCKETS.filter(
      (b) =>
        b.bucketName.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        (b.description || "").toLowerCase().includes(q) ||
        (b.ownerObjectName || "").toLowerCase().includes(q),
    );
  }, [search]);

  if (ALL_BUCKETS.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <Database className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No file buckets declared on this project.</p>
        <p className="text-xs mt-1">
          Add a{" "}
          <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
            DbBucket
          </code>{" "}
          or{" "}
          <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
            RemoteBucket
          </code>{" "}
          to a service to manage files here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[18rem_1fr] gap-6">
      {/* Left: bucket list */}
      <aside className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buckets…"
            className="form-input w-full pl-9 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
        <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No matches.
            </p>
          ) : (
            filtered.map((bucket) => (
              <BucketRow
                key={`${bucket.serviceName}:${bucket.bucketName}`}
                bucket={bucket}
                selected={
                  selected &&
                  selected.serviceName === bucket.serviceName &&
                  selected.bucketName === bucket.bucketName
                }
                onSelect={setSelected}
              />
            ))
          )}
        </div>
      </aside>

      {/* Right: tabbed view — files browser or endpoint tester */}
      <section>
        {selected ? (
          <>
            <div className="flex items-center gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setView("files")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px inline-flex items-center gap-1.5 ${
                  view === "files"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                Files
              </button>
              <button
                type="button"
                onClick={() => setView("endpoints")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px inline-flex items-center gap-1.5 ${
                  view === "endpoints"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                title={
                  selected.kind === "remote"
                    ? "Test the bucket-layer routes (upload / list / download / delete)"
                    : "Endpoint tester is only available for RemoteBuckets"
                }
              >
                <Terminal className="w-4 h-4" />
                Endpoints
                {selected.kind !== "remote" && (
                  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    remote only
                  </span>
                )}
              </button>
            </div>

            {view === "files" ? (
              <BucketFilesPanel
                key={`${selected.serviceName}:${selected.bucketName}`}
                bucket={selected}
              />
            ) : (
              <BucketEndpointTester
                key={`${selected.serviceName}:${selected.bucketName}:ep`}
                bucket={selected}
              />
            )}
          </>
        ) : (
          <p className="py-12 text-center text-sm text-gray-400">
            Select a bucket to see its files.
          </p>
        )}
      </section>
    </div>
  );
}
