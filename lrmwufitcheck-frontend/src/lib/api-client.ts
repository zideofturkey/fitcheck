/**
 * Base API client for Mindbricks-generated backend services.
 * Handles the standard Mindbricks response envelope structure.
 *
 * Authentication strategy:
 *   - Bearer token from token-store (primary)
 *   - Cookies via credentials: "include" (fallback)
 */

import type { MindbricksError } from "@/types/api";
import { getAccessToken } from "@/lib/token-store";

export interface ApiRequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      const url = new URL(endpoint);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        }
      }
      return url.toString();
    }

    const base = this.baseURL.endsWith("/") ? this.baseURL : `${this.baseURL}/`;
    // When base is a relative path (e.g. "/auth-api/"), prefix with origin so URL() doesn't throw
    const absoluteBase = base.startsWith("/")
      ? `${window.location.origin}${base}`
      : base;
    const url = new URL(endpoint, absoluteBase);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private getHeaders(additionalHeaders?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    if (additionalHeaders) {
      if (additionalHeaders instanceof Headers) {
        additionalHeaders.forEach((v, k) => {
          headers[k] = v;
        });
      } else if (Array.isArray(additionalHeaders)) {
        for (const [k, v] of additionalHeaders) headers[k] = v;
      } else {
        Object.assign(headers, additionalHeaders);
      }
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {},
  ): Promise<T> {
    const { params, headers, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchConfig,
      headers: this.getHeaders(headers),
      credentials: "include",
    });

    // Read the body as text first so an empty body or non-JSON response
    // (e.g. zero-length 200, plain-text error pages) can never crash us with
    // a SyntaxError. Then attempt a JSON parse and fall back to null.
    const rawText = await response.text();
    let data: unknown = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        /* non-JSON body */
      }
    }
    const dataObj: Record<string, unknown> | null =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : null;

    if (!response.ok || dataObj?.result === "ERR") {
      const errMsg =
        (typeof dataObj?.message === "string" ? dataObj.message : undefined) ??
        // Plain Express routes (suggestions.js, admin-user-library.js, etc. -
        // not Mindbricks-generated Managers) respond with { error: "..." }
        // instead of { message: "..." } on failure.
        (typeof dataObj?.error === "string" ? dataObj.error : undefined) ??
        (rawText && !dataObj ? rawText : undefined) ??
        response.statusText ??
        `HTTP ${response.status}`;
      throw {
        httpStatus: response.status,
        status: dataObj?.status,
        message: errMsg,
        errCode: dataObj?.errCode,
        detail: dataObj?.detail,
      };
    }

    // BFF/Elasticsearch responses don't use the standard { status: "OK" } envelope.
    // Only enforce the envelope check when the response actually has a status field.
    if (
      dataObj &&
      "status" in dataObj &&
      dataObj.status !== "OK" &&
      !("accessToken" in dataObj)
    ) {
      throw new Error("Unexpected response format");
    }
    return data as T;
  }

  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Upload a file via multipart/form-data.
   * Does NOT set Content-Type — the browser sets it with the boundary automatically.
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: ApiRequestConfig,
  ): Promise<T> {
    const { params, headers: extraHeaders, ...fetchConfig } = config ?? {};
    const url = this.buildUrl(endpoint, params);

    // Build headers without Content-Type (browser sets it for FormData)
    const headers: Record<string, string> = {};
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    if (extraHeaders) Object.assign(headers, extraHeaders);

    const response = await fetch(url, {
      ...fetchConfig,
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || data.result === "ERR") {
      throw {
        status: data.status,
        message: data.message,
        errCode: data.errCode,
      };
    }
    return data as T;
  }

  /** Get the resolved base URL for constructing download URLs */
  get baseUrl(): string {
    return this.baseURL;
  }

  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }
}

export { ApiClient };
export default ApiClient;
