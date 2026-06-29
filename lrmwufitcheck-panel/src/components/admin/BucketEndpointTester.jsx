import { useMemo, useRef, useState } from "react";
import {
  Loader2,
  Send,
  Copy,
  Check,
  AlertCircle,
  Upload as UploadIcon,
  List as ListIcon,
  Download as DownloadIcon,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { createServiceClient } from "../../services/apiClient";

/**
 * BucketEndpointTester — raw-API tester for a single bucket.
 *
 * Shows each bucket-layer endpoint (upload / list / download / delete)
 * with the full URL, method, expected payload shape, a copy-as-curl
 * button, and a "Send" button that fires the real request through the
 * same auth-attached service client the rest of the UI uses. The
 * response inspector below each endpoint surfaces status, headers,
 * timing, and body so the admin can confirm the route behaves
 * end-to-end without hand-rolling curl commands.
 *
 * Files / uploads / downloads from the regular "Files" view tab still
 * work — this view is for verifying the contracts, not replacing the
 * day-to-day file browser.
 */

function methodColor(method) {
  switch (method) {
    case "POST":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "GET":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    case "DELETE":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  }
}

function getAuthToken() {
  try {
    const keyMatch = Object.keys(localStorage).find((k) =>
      k.endsWith("-auth-storage"),
    );
    if (!keyMatch) return null;
    const raw = localStorage.getItem(keyMatch);
    if (!raw) return null;
    const { state } = JSON.parse(raw);
    return state?.accessToken || null;
  } catch {
    return null;
  }
}

function buildCurl({
  method,
  url,
  headers = {},
  body = null,
  formParts = null,
}) {
  const lines = [`curl -X ${method} '${url}'`];
  for (const [k, v] of Object.entries(headers)) {
    if (v == null || v === "") continue;
    lines.push(`  -H '${k}: ${String(v).replace(/'/g, "'\\''")}'`);
  }
  if (formParts) {
    for (const part of formParts) {
      if (part.kind === "file") {
        lines.push(`  -F '${part.name}=@${part.filename || "PATH/TO/FILE"}'`);
      } else if (part.kind === "text" && part.value) {
        lines.push(
          `  -F '${part.name}=${String(part.value).replace(/'/g, "'\\''")}'`,
        );
      }
    }
  } else if (body && method !== "GET") {
    const json = typeof body === "string" ? body : JSON.stringify(body);
    lines.push(`  -d '${json.replace(/'/g, "'\\''")}'`);
  }
  return lines.join(" \\\n");
}

function CopyButton({ getText, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch (e) {
          toast.error("Clipboard write failed");
        }
      }}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function ResponsePanel({ response }) {
  if (!response) return null;
  const isError = response.status >= 400 || response.error;
  const headersObj = response.headers || {};
  const bodyDisplay = useMemo(() => {
    if (response.error) return String(response.error);
    const body = response.body;
    if (body == null) return "(empty)";
    if (typeof body === "string") return body.slice(0, 4000);
    try {
      const json = JSON.stringify(body, null, 2);
      return json.length > 4000 ? `${json.slice(0, 4000)}\n…(truncated)` : json;
    } catch {
      return String(body);
    }
  }, [response]);

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-0.5 rounded font-mono font-semibold ${isError ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"}`}
        >
          {response.error ? "NETWORK ERROR" : response.status}
        </span>
        {response.statusText && (
          <span className="text-gray-500 dark:text-gray-400">
            {response.statusText}
          </span>
        )}
        {typeof response.elapsedMs === "number" && (
          <span className="text-gray-500 dark:text-gray-400">
            · {response.elapsedMs} ms
          </span>
        )}
        {response.finalUrl && response.finalUrl !== response.requestUrl && (
          <span
            className="text-gray-500 dark:text-gray-400 truncate"
            title={response.finalUrl}
          >
            · redirected to <code>{response.finalUrl}</code>
          </span>
        )}
      </div>
      {Object.keys(headersObj).length > 0 && (
        <details className="text-gray-600 dark:text-gray-300">
          <summary className="cursor-pointer text-gray-500 dark:text-gray-400">
            Response headers
          </summary>
          <pre className="mt-1 p-2 rounded bg-gray-50 dark:bg-gray-900 overflow-x-auto text-[10px] leading-snug">
            {Object.entries(headersObj)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n")}
          </pre>
        </details>
      )}
      <details className="text-gray-600 dark:text-gray-300" open>
        <summary className="cursor-pointer text-gray-500 dark:text-gray-400">
          Body
        </summary>
        <pre className="mt-1 p-2 rounded bg-gray-50 dark:bg-gray-900 overflow-x-auto whitespace-pre-wrap break-all text-[11px] leading-snug">
          {bodyDisplay}
        </pre>
      </details>
    </div>
  );
}

function pickFileNameFromHeaders(headers) {
  const cd =
    headers &&
    (headers["content-disposition"] || headers["Content-Disposition"]);
  if (!cd) return null;
  const m = /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(cd);
  return m ? decodeURIComponent(m[1]) : null;
}

function EndpointCard({
  title,
  method,
  icon,
  description,
  bucket,
  path,
  authRequired,
  formParts,
  queryShape,
  customControls,
  runner,
  downloadable,
}) {
  const client = useMemo(
    () => createServiceClient(bucket.serviceName),
    [bucket.serviceName],
  );
  const baseUrl = client.defaults.baseURL || "";
  const fullUrl = `${baseUrl}${path}`;

  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState(null);

  const send = async () => {
    setBusy(true);
    setResponse(null);
    const started = Date.now();
    try {
      const out = await runner();
      const elapsed = Date.now() - started;
      setResponse({
        status: out.status,
        statusText: out.statusText || "",
        headers: out.headers || {},
        body: out.body,
        finalUrl: out.finalUrl,
        requestUrl: fullUrl,
        elapsedMs: elapsed,
      });
    } catch (err) {
      const elapsed = Date.now() - started;
      const resp = err.response;
      if (resp) {
        setResponse({
          status: resp.status,
          statusText: resp.statusText || "",
          headers: resp.headers || {},
          body: resp.data,
          requestUrl: fullUrl,
          elapsedMs: elapsed,
        });
      } else {
        setResponse({
          error: err.message || "request failed",
          elapsedMs: elapsed,
          requestUrl: fullUrl,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const headersForCurl = {
    ...(authRequired ? { Authorization: "Bearer <ACCESS_TOKEN>" } : {}),
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded bg-gray-100 dark:bg-gray-700">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${methodColor(method)}`}
            >
              {method}
            </span>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {authRequired ? (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                auth
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                public
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <code className="text-[11px] text-gray-700 dark:text-gray-200 font-mono break-all">
              {fullUrl}
            </code>
            <CopyButton getText={() => fullUrl} label="URL" />
            <CopyButton
              getText={() =>
                buildCurl({
                  method,
                  url: fullUrl,
                  headers: headersForCurl,
                  formParts,
                })
              }
              label="curl"
            />
          </div>
        </div>
      </div>

      {customControls}

      {formParts && formParts.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-500 dark:text-gray-400">
            Request shape (multipart/form-data)
          </summary>
          <ul className="mt-1 pl-4 list-disc text-gray-600 dark:text-gray-300 space-y-0.5">
            {formParts.map((p) => (
              <li key={p.name}>
                <code>{p.name}</code> —{" "}
                {p.note || (p.kind === "file" ? "file" : "text")}
              </li>
            ))}
          </ul>
        </details>
      )}
      {queryShape && (
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-500 dark:text-gray-400">
            Query / path parameters
          </summary>
          <ul className="mt-1 pl-4 list-disc text-gray-600 dark:text-gray-300 space-y-0.5">
            {queryShape.map((q) => (
              <li key={q.name}>
                <code>{q.name}</code> — {q.note}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={send}
          disabled={busy}
          className="btn-primary text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          {busy ? "Sending…" : "Send request"}
        </button>
        {downloadable &&
          response &&
          !response.error &&
          response.status < 400 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (body is binary — saved to disk if browser allowed)
            </span>
          )}
      </div>

      <ResponsePanel response={response} />
    </div>
  );
}

export default function BucketEndpointTester({ bucket }) {
  if (!bucket) return null;
  if (bucket.kind !== "remote") {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          The endpoint tester is only available for{" "}
          <strong>RemoteBucket</strong> assets (S3 / GCS / R2 / MinIO). The
          selected bucket is a{" "}
          <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
            DbBucket
          </code>{" "}
          — its binary content lives in PostgreSQL via the standard data-object
          CRUD API, so there are no separate bucket-layer routes to test. Use
          the Files view for upload / download / delete.
        </div>
      </div>
    );
  }

  const client = useMemo(
    () => createServiceClient(bucket.serviceName),
    [bucket.serviceName],
  );
  const baseUrl = client.defaults.baseURL || "";
  const basePath = `/remotebucket/${bucket.bucketName}`;

  // Per-endpoint local state
  const fileInputRef = useRef(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [ownerIdInput, setOwnerIdInput] = useState("");
  const [fileIdInput, setFileIdInput] = useState("");
  const [accessKeyInput, setAccessKeyInput] = useState("");

  // POST /remotebucket/<name>/upload
  const uploadCard = (
    <EndpointCard
      title="Upload file"
      method="POST"
      icon={<UploadIcon className="w-4 h-4 text-emerald-600" />}
      description="multipart/form-data. Returns the persisted file metadata row (id, storageKey, accessKey, fileSize, etc.). Subsequent download/delete calls reference the returned id."
      bucket={bucket}
      path={`${basePath}/upload`}
      authRequired
      formParts={[
        {
          name: "file",
          kind: "file",
          note: "the binary file (required)",
          filename: uploadFile?.name,
        },
        ...(bucket.ownerProp
          ? [
              {
                name: bucket.ownerProp,
                kind: "text",
                note: `owner FK to ${bucket.ownerObjectName || "parent"} (optional)`,
                value: ownerIdInput,
              },
            ]
          : []),
      ]}
      customControls={
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={
                bucket.allowedMimeTypes && bucket.allowedMimeTypes !== "*"
                  ? bucket.allowedMimeTypes
                  : undefined
              }
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-gray-700 dark:text-gray-200 file:mr-3 file:rounded file:border-0 file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 dark:file:text-primary-300 file:px-3 file:py-1.5 file:text-xs"
            />
            {uploadFile && (
              <span className="text-gray-500 dark:text-gray-400">
                {Math.round(uploadFile.size / 1024)} KB
              </span>
            )}
          </div>
          {bucket.ownerProp && (
            <input
              type="text"
              placeholder={`${bucket.ownerProp} (optional)`}
              value={ownerIdInput}
              onChange={(e) => setOwnerIdInput(e.target.value)}
              className="form-input w-full text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          )}
        </div>
      }
      runner={async () => {
        if (!uploadFile) throw new Error("Pick a file first.");
        const fd = new FormData();
        fd.append("file", uploadFile);
        if (bucket.ownerProp && ownerIdInput)
          fd.append(bucket.ownerProp, ownerIdInput);
        const res = await client.post(`${basePath}/upload`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // Auto-fill the file-id input from the response so subsequent
        // download/delete cards work without copy-paste.
        const id = res.data?.file?.id || res.data?.id;
        if (id) setFileIdInput(id);
        const accessKey = res.data?.file?.accessKey || res.data?.accessKey;
        if (accessKey) setAccessKeyInput(accessKey);
        return {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
          body: res.data,
        };
      }}
    />
  );

  // GET /v1/<resource>?ownerProp=...
  const metadataListCard = (
    <EndpointCard
      title="List files (metadata)"
      method="GET"
      icon={<ListIcon className="w-4 h-4 text-blue-600" />}
      description="Generated CRUD list endpoint for the bucket's metadata data object. Returns rows only — no binary content. Add ?{ownerProp}={id} to filter to one parent record."
      bucket={bucket}
      path={`/v1/${bucket.metadataResource}`}
      authRequired
      queryShape={[
        { name: "pageNumber", note: "optional, default 1" },
        { name: "pageRowCount", note: "optional, default 50" },
        ...(bucket.ownerProp
          ? [
              {
                name: bucket.ownerProp,
                note: `optional FK filter — owner ${bucket.ownerObjectName}`,
              },
            ]
          : []),
      ]}
      customControls={
        bucket.ownerProp ? (
          <input
            type="text"
            placeholder={`Filter by ${bucket.ownerProp} (optional)`}
            value={ownerIdInput}
            onChange={(e) => setOwnerIdInput(e.target.value)}
            className="form-input w-full text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        ) : null
      }
      runner={async () => {
        const params = { pageNumber: 1, pageRowCount: 50 };
        if (bucket.ownerProp && ownerIdInput)
          params[bucket.ownerProp] = ownerIdInput;
        const res = await client.get(`/v1/${bucket.metadataResource}`, {
          params,
        });
        return {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
          body: res.data,
        };
      }}
    />
  );

  // GET /remotebucket/<name>/download/:id
  const downloadCard = (
    <EndpointCard
      title="Download file"
      method="GET"
      icon={<DownloadIcon className="w-4 h-4 text-blue-600" />}
      description={`${bucket.urlStrategy === "proxy" ? "Service proxies the bytes through the API." : "Service returns a 302 to a presigned provider URL (S3/GCS/R2/MinIO)."} The "Send" button below issues a HEAD-equivalent GET to confirm the route resolves; pass an empty body to avoid downloading the full bytes into the panel.`}
      bucket={bucket}
      path={`${basePath}/download/<id>`}
      authRequired
      queryShape={[
        { name: ":id", note: "metadata row id (returned from upload)" },
      ]}
      customControls={
        <input
          type="text"
          placeholder="File id (uuid from upload response or list)"
          value={fileIdInput}
          onChange={(e) => setFileIdInput(e.target.value)}
          className="form-input w-full text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      }
      downloadable
      runner={async () => {
        if (!fileIdInput) throw new Error("Provide a file id.");
        const res = await client.get(
          `${basePath}/download/${encodeURIComponent(fileIdInput)}`,
          {
            responseType: "blob",
            maxRedirects: 5,
          },
        );
        const ct =
          res.headers?.["content-type"] || res.headers?.["Content-Type"] || "";
        const size = res.data?.size ?? null;
        const fileName = pickFileNameFromHeaders(res.headers);
        return {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
          body: {
            note: "binary body fetched — preview shows metadata only",
            contentType: ct,
            sizeBytes: size,
            fileName,
            requestUrl: `${baseUrl}${basePath}/download/${fileIdInput}`,
          },
          finalUrl: res.request?.responseURL || null,
        };
      }}
    />
  );

  // GET /remotebucket/<name>/download/key/:accessKey (when enabled)
  const publicDownloadCard =
    bucket.enableKeyAccess !== false ? (
      <EndpointCard
        title="Download via access key (public)"
        method="GET"
        icon={<DownloadIcon className="w-4 h-4 text-gray-500" />}
        description="Shareable URL — no Authorization header. Each file gets a random accessKey on upload. Use this for <img>/<video>/<a> embeds."
        bucket={bucket}
        path={`${basePath}/download/key/<accessKey>`}
        authRequired={false}
        queryShape={[
          { name: ":accessKey", note: "short random key on the file row" },
        ]}
        customControls={
          <input
            type="text"
            placeholder="Access key (from upload response or list)"
            value={accessKeyInput}
            onChange={(e) => setAccessKeyInput(e.target.value)}
            className="form-input w-full text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        }
        downloadable
        runner={async () => {
          if (!accessKeyInput) throw new Error("Provide an access key.");
          // Anonymous fetch — strip Authorization to verify the public path
          // actually doesn't require auth. Use plain fetch instead of the
          // authed axios client.
          const url = `${baseUrl}${basePath}/download/key/${encodeURIComponent(accessKeyInput)}`;
          const res = await fetch(url, { redirect: "follow" });
          const headers = {};
          res.headers.forEach((v, k) => {
            headers[k] = v;
          });
          const blob = res.ok ? await res.blob() : null;
          const bodyText = !res.ok ? await res.text().catch(() => "") : "";
          return {
            status: res.status,
            statusText: res.statusText,
            headers,
            body: res.ok
              ? {
                  note: "binary body fetched anonymously — preview shows metadata only",
                  contentType: blob?.type,
                  sizeBytes: blob?.size,
                  fileName: pickFileNameFromHeaders(headers),
                }
              : bodyText,
            finalUrl: res.url !== url ? res.url : null,
          };
        }}
      />
    ) : null;

  // DELETE /remotebucket/<name>/:id
  const deleteCard = (
    <EndpointCard
      title="Delete file (object + metadata)"
      method="DELETE"
      icon={<Trash2 className="w-4 h-4 text-red-600" />}
      description="Removes the underlying object in the storage provider AND the metadata row. For metadata-only delete (e.g. cleanup after provider was already wiped), use DELETE /v1/{resource}/:id instead."
      bucket={bucket}
      path={`${basePath}/<id>`}
      authRequired
      queryShape={[{ name: ":id", note: "metadata row id" }]}
      customControls={
        <input
          type="text"
          placeholder="File id to delete"
          value={fileIdInput}
          onChange={(e) => setFileIdInput(e.target.value)}
          className="form-input w-full text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      }
      runner={async () => {
        if (!fileIdInput) throw new Error("Provide a file id.");
        if (
          !window.confirm(
            `Permanently delete ${fileIdInput} from ${bucket.bucketName}?`,
          )
        ) {
          throw new Error("cancelled by user");
        }
        const res = await client.delete(
          `${basePath}/${encodeURIComponent(fileIdInput)}`,
        );
        return {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
          body: res.data,
        };
      }}
    />
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-3 text-xs text-blue-900 dark:text-blue-200">
        <p className="font-medium">
          RemoteBucket: <code className="font-mono">{bucket.bucketName}</code>{" "}
          on <code className="font-mono">{bucket.serviceName}</code>
        </p>
        <p className="mt-1 opacity-80">
          Provider: <strong>{bucket.provider || "s3"}</strong> · URL strategy:{" "}
          <strong>{bucket.urlStrategy || "presigned"}</strong> · Read:{" "}
          <strong>{bucket.readAccess}</strong> · Write:{" "}
          <strong>{bucket.writeAccess}</strong>
          {bucket.ownerObjectName && (
            <>
              {" "}
              · Owner: <strong>{bucket.ownerObjectName}</strong> (FK{" "}
              <code>{bucket.ownerProp}</code>)
            </>
          )}
        </p>
        <p className="mt-1 opacity-70">
          {getAuthToken()
            ? "Auth: Bearer token attached automatically from your current session."
            : "Auth: NOT logged in — auth-required endpoints will return 401."}
        </p>
      </div>

      {uploadCard}
      {metadataListCard}
      {downloadCard}
      {publicDownloadCard}
      {deleteCard}
    </div>
  );
}
