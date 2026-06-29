/**
 * SSE (Server-Sent Events) client utility.
 * Wraps the native EventSource API with auth injection and typed event handling.
 *
 * EventSource does not support custom headers, so the auth token is passed
 * as a query parameter. The backend SSE controller reads it from the query
 * string alongside standard cookie auth.
 */

import type { SseEventHandlers } from "@/types/api";
import { getAccessToken } from "@/lib/token-store";

/**
 * Opens an SSE connection to the given service endpoint and wires up event handlers.
 *
 * @param serviceBaseUrl - The base URL of the service (e.g. "/gameplay-api" or "https://example.com/gameplay-api")
 * @param endpoint       - The stream endpoint path relative to the service (e.g. "v1/tickets/export/stream")
 * @param params         - Optional query parameters forwarded to the backend
 * @param handlers       - Typed SSE event callbacks
 * @returns A cleanup function that closes the EventSource connection
 */
export function createSseStream(
  serviceBaseUrl: string,
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> | undefined,
  handlers: SseEventHandlers,
): { close: () => void } {
  // Build absolute URL — in dev mode serviceBaseUrl is a relative path
  const base = serviceBaseUrl.startsWith("/")
    ? `${window.location.origin}${serviceBaseUrl}`
    : serviceBaseUrl;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const url = new URL(endpoint, normalizedBase);

  // Inject auth token as query param (EventSource has no header support)
  const token = getAccessToken();
  if (token) url.searchParams.set("token", token);

  // Forward caller-supplied params
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const eventSource = new EventSource(url.toString(), {
    withCredentials: true,
  });

  // ── Stream mode events ──────────────────────────────────────────────────
  eventSource.addEventListener("meta", (e: MessageEvent) => {
    handlers.onMeta?.(JSON.parse(e.data));
  });

  eventSource.addEventListener("chunk", (e: MessageEvent) => {
    handlers.onChunk?.(JSON.parse(e.data));
  });

  eventSource.addEventListener("complete", (e: MessageEvent) => {
    handlers.onComplete?.(JSON.parse(e.data));
    eventSource.close();
  });

  // ── Events mode events ──────────────────────────────────────────────────
  eventSource.addEventListener("progress", (e: MessageEvent) => {
    handlers.onProgress?.(JSON.parse(e.data));
  });

  eventSource.addEventListener("result", (e: MessageEvent) => {
    handlers.onResult?.(JSON.parse(e.data));
    eventSource.close();
  });

  // ── Error handling ──────────────────────────────────────────────────────
  eventSource.addEventListener("error", () => {
    if (eventSource.readyState === EventSource.CLOSED) {
      handlers.onError?.({ message: "SSE connection closed" });
    }
  });

  // Server timeout event
  eventSource.addEventListener("timeout", () => {
    handlers.onError?.({ message: "SSE stream timed out" });
    eventSource.close();
  });

  return { close: () => eventSource.close() };
}
