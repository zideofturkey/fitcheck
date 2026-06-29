import { createServiceClient } from "./apiClient";

/**
 * Flat list of every DbBucket + RemoteBucket declared on the project's
 * services. Each entry carries everything the UI needs to render the
 * bucket, route requests at it, and know which routes to call.
 */
export const ALL_BUCKETS = [
  {
    serviceName: "auth",
    bucketName: "userAvatars",
    kind: "db",
    description: "User profile avatar images stored in the database.",
    maxFileSizeMb: 5,
    allowedMimeTypes: "image/png,image/jpeg,image/webp,image/gif",
    readAccess: "public",
    writeAccess: "authenticated",
    enableKeyAccess: true,
    ownerObjectName: "user",
    ownerProp: "userId",
    metadataResource: "userAvatarsFiles",
  },
];

/**
 * Lookup keyed by owner data-object name. Empty when no bucket on the
 * project declares an owner. Used by the service-record drawer to
 * surface a per-record file widget.
 */
export const DATA_OBJECT_BUCKETS = {
  user: [
    {
      serviceName: "auth",
      bucketName: "userAvatars",
      kind: "db",
      description: "User profile avatar images stored in the database.",
      maxFileSizeMb: 5,
      allowedMimeTypes: "image/png,image/jpeg,image/webp,image/gif",
      readAccess: "public",
      writeAccess: "authenticated",
      enableKeyAccess: true,
      ownerObjectName: "user",
      ownerProp: "userId",
      metadataResource: "userAvatarsFiles",
    },
  ],
};

/**
 * Return the buckets owned by a given data object, or an empty array.
 */
export function getBucketsForObject(objectName) {
  return DATA_OBJECT_BUCKETS[objectName] || [];
}

/**
 * Look up a bucket by service + name. Returns null if not found.
 */
export function findBucket(serviceName, bucketName) {
  return (
    ALL_BUCKETS.find(
      (b) => b.serviceName === serviceName && b.bucketName === bucketName,
    ) || null
  );
}

// ── Route helpers ───────────────────────────────────────────────────

function uploadPath(bucket) {
  return bucket.kind === "remote"
    ? `/remotebucket/${bucket.bucketName}/upload`
    : `/bucket/${bucket.bucketName}/upload`;
}

function bucketRootPath(bucket) {
  return bucket.kind === "remote"
    ? `/remotebucket/${bucket.bucketName}`
    : `/bucket/${bucket.bucketName}`;
}

function metadataListPath(bucket) {
  return `/v1/${bucket.metadataResource}`;
}

function metadataItemPath(bucket, fileId) {
  return `/v1/${bucket.metadataResource}/${fileId}`;
}

/**
 * Upload a file to a bucket via the owning service.
 *
 * @param {Object} bucket    — entry from ALL_BUCKETS.
 * @param {File}   file      — browser File / Blob to upload.
 * @param {Object} [opts]
 *   @param {string} [opts.ownerId]  — value for the owner FK (when the bucket has hasOwnerDataObject).
 *   @param {Object} [opts.metadata] — arbitrary metadata sidecar (tags, dimensions, etc.).
 *   @param {(progress:number)=>void} [opts.onProgress] — 0..100 progress callback.
 * @returns {Promise<Object>} The file record returned by the service.
 */
export async function uploadFile(bucket, file, opts = {}) {
  if (!bucket) throw new Error("uploadFile: bucket is required");
  if (!file) throw new Error("uploadFile: file is required");
  const client = createServiceClient(bucket.serviceName);
  const formData = new FormData();
  // The auth service's DbBucket multipart field is `files`; nodeJs2 generic
  // buckets accept `file` (and tolerate `files` in some templates). Send
  // `file` — the current code-generation expects it.
  formData.append("file", file);
  if (opts.ownerId && bucket.ownerProp) {
    formData.append(bucket.ownerProp, opts.ownerId);
  }
  if (opts.metadata) {
    formData.append(
      "metadata",
      typeof opts.metadata === "string"
        ? opts.metadata
        : JSON.stringify(opts.metadata),
    );
  }
  const res = await client.post(uploadPath(bucket), formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (opts.onProgress && e.total) {
        opts.onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data?.file || res.data;
}

/**
 * List the file metadata rows for a bucket. Optional `ownerId` filters
 * to files attached to a single owner record (only meaningful when the
 * bucket has an owner data object).
 *
 * @returns {Promise<{ rows: Array, rowCount: number, raw: any }>}
 */
export async function listFiles(bucket, opts = {}) {
  if (!bucket) throw new Error("listFiles: bucket is required");
  const client = createServiceClient(bucket.serviceName);
  const params = {
    pageNumber: opts.pageNumber || 1,
    pageRowCount: opts.pageRowCount || 50,
  };
  if (opts.ownerId && bucket.ownerProp) {
    params[bucket.ownerProp] = opts.ownerId;
  }
  const res = await client.get(metadataListPath(bucket), { params });
  // Generated list APIs return `{ <resource>: [...], rowCount }` — fall
  // through common shapes so the UI doesn't need to know which.
  const raw = res.data || {};
  const rows =
    raw[bucket.metadataResource] || raw.rows || raw.items || raw.data || [];
  const rowCount = raw.rowCount ?? raw.total ?? rows.length;
  return { rows, rowCount, raw };
}

/**
 * Best download URL for a file. Prefers the access-key route when the
 * bucket allows key access (public, no auth header needed) — safe for
 * use directly in <img>/<video>/<a href>. Falls back to the by-id route
 * which requires an Authorization header.
 */
export function getDownloadUrl(bucket, file) {
  if (!bucket || !file) return "";
  const base = createServiceClient(bucket.serviceName).defaults.baseURL || "";
  if (bucket.enableKeyAccess && file.accessKey) {
    return `${base}${bucketRootPath(bucket)}/download/key/${file.accessKey}`;
  }
  return `${base}${bucketRootPath(bucket)}/download/${file.id}`;
}

/**
 * Download a file as a Blob. Honors auth via the service client. Use
 * for "save as" flows where you need the bytes on the client; for
 * <img>/<video> rendering prefer `getDownloadUrl`.
 *
 * For RemoteBucket with `presigned` strategy the service returns a
 * 302; axios follows it transparently and the resolved response is
 * the file bytes.
 */
export async function downloadFile(bucket, file) {
  if (!bucket || !file)
    throw new Error("downloadFile: bucket and file are required");
  const client = createServiceClient(bucket.serviceName);
  const path =
    bucket.enableKeyAccess && file.accessKey
      ? `${bucketRootPath(bucket)}/download/key/${file.accessKey}`
      : `${bucketRootPath(bucket)}/download/${file.id}`;
  const res = await client.get(path, { responseType: "blob" });
  return res.data;
}

/**
 * Delete a file. Removes both the metadata row and the underlying
 * bytes (provider object for RemoteBucket, BYTEA column for DbBucket).
 */
export async function deleteFile(bucket, file) {
  if (!bucket || !file)
    throw new Error("deleteFile: bucket and file are required");
  const fileId = typeof file === "string" ? file : file.id;
  const client = createServiceClient(bucket.serviceName);
  // The DELETE route lives at the bucket root (not the /v1 metadata
  // route), because it has to drop the bytes as well as the row.
  await client.delete(`${bucketRootPath(bucket)}/${fileId}`);
}

/**
 * Trigger a browser download of a file by URL or fetched blob. Picks
 * the access-key URL when available, otherwise fetches the bytes via
 * the authenticated client and creates a temporary object URL.
 */
export async function downloadFileToDisk(bucket, file) {
  if (!bucket || !file) return;
  let href;
  let revokeAfter = false;
  if (
    bucket.readAccess === "public" ||
    (bucket.enableKeyAccess && file.accessKey)
  ) {
    href = getDownloadUrl(bucket, file);
  } else {
    const blob = await downloadFile(bucket, file);
    href = URL.createObjectURL(blob);
    revokeAfter = true;
  }
  const a = document.createElement("a");
  a.href = href;
  a.download = file.fileName || file.name || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (revokeAfter) {
    // Defer revocation so the browser has time to start the download.
    setTimeout(() => URL.revokeObjectURL(href), 5000);
  }
}
