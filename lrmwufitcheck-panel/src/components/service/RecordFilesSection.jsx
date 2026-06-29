import { useEffect, useState, useRef, useCallback } from "react";
import {
  Loader2,
  Upload,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  uploadFile,
  listFiles,
  deleteFile,
  downloadFileToDisk,
  getDownloadUrl,
} from "../../services/bucketApi";

/**
 * RecordFilesSection — files attached to a single record via an
 * owner-FK bucket. Renders one block per owning bucket inside the
 * RecordFormPanel's edit drawer.
 *
 * Props:
 *   bucket   — entry from ALL_BUCKETS (has kind, serviceName, ownerProp, ...)
 *   ownerId  — id of the record this drawer is editing
 *
 * Renders a header (bucket name + description), a thumbnail/list grid
 * of existing files (with per-file download + delete), and a drag-or-
 * click upload zone gated to the bucket's allowed MIME types + size cap.
 *
 * The bucket-API client handles auth + tenant headers via the service
 * client; this component just orchestrates fetch / upload / delete and
 * renders progress.
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

function FileTile({ bucket, file, onDelete, onPreview, deleting }) {
  const isImage = isImageMime(file.mimeType);
  const previewUrl = isImage ? getDownloadUrl(bucket, file) : null;
  return (
    <div className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col">
      <button
        type="button"
        className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden"
        onClick={() => onPreview(file)}
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
          {formatBytes(file.fileSize)}
        </p>
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

function UploadZone({ bucket, ownerId, disabled, onUploaded }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  const acceptAttr =
    bucket.allowedMimeTypes && bucket.allowedMimeTypes !== "*"
      ? bucket.allowedMimeTypes
      : undefined;
  const maxBytes = (bucket.maxFileSizeMb || 10) * 1024 * 1024;

  const handleFiles = useCallback(
    async (files) => {
      setError("");
      if (!files || !files.length) return;
      // Upload one file at a time so the progress bar tracks each.
      for (const file of files) {
        if (file.size > maxBytes) {
          setError(
            `"${file.name}" is ${formatBytes(file.size)}, max is ${formatBytes(maxBytes)}.`,
          );
          continue;
        }
        try {
          setProgress({ name: file.name, pct: 0 });
          const uploaded = await uploadFile(bucket, file, {
            ownerId,
            onProgress: (pct) => setProgress({ name: file.name, pct }),
          });
          toast.success(`Uploaded ${file.name}`);
          onUploaded?.(uploaded);
        } catch (e) {
          const msg =
            e.response?.data?.message ||
            e.response?.data?.error ||
            e.message ||
            "Upload failed";
          toast.error(msg);
          setError(msg);
        } finally {
          setProgress(null);
          if (inputRef.current) inputRef.current.value = "";
        }
      }
    },
    [bucket, ownerId, maxBytes, onUploaded],
  );

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || !!progress}
        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {progress ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              Uploading {progress.name} — {progress.pct}%
            </span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Click to upload</span>
            <span className="text-xs text-gray-400">
              max {bucket.maxFileSizeMb || 10} MB
              {bucket.allowedMimeTypes ? ` · ${bucket.allowedMimeTypes}` : ""}
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
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

export default function RecordFilesSection({ bucket, ownerId }) {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    setError("");
    try {
      const { rows: r, rowCount: c } = await listFiles(bucket, {
        ownerId,
        pageRowCount: 200,
      });
      setRows(r);
      setRowCount(c);
    } catch (e) {
      const msg =
        e.response?.data?.message || e.message || "Failed to load files";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [bucket, ownerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/20">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {bucket.kind === "remote" ? (
              <ImageIcon className="w-4 h-4 text-primary-500" />
            ) : (
              <FileText className="w-4 h-4 text-primary-500" />
            )}
            {bucket.bucketName}
            <span className="text-xs font-normal px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {bucket.kind === "remote" ? "remote" : "db"}
            </span>
          </h3>
          {bucket.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {bucket.description}
            </p>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {rowCount} file{rowCount === 1 ? "" : "s"}
        </span>
      </header>

      <UploadZone bucket={bucket} ownerId={ownerId} onUploaded={refresh} />

      {loading ? (
        <div className="py-6 flex justify-center text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="py-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-3 text-xs text-gray-400 text-center">No files yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
    </section>
  );
}
