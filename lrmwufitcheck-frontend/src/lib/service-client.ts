/**
 * Service-specific API clients
 * Each Mindbricks service gets its own client instance with the correct base URL.
 * URLs are resolved once from VITE_* env vars at import time.
 */

import { ApiClient, type ApiRequestConfig } from "@/lib/api-client";
import { getServiceUrl } from "@/config/environment";
import i18n from "@/i18n";

// Core service clients
export const authApi = new ApiClient(getServiceUrl("auth"));
export const bffApi = new ApiClient(getServiceUrl("bff"));
export const notificationApi = new ApiClient(getServiceUrl("notification"));

// Business service clients
export const invitationcenterApi = new ApiClient(
  getServiceUrl("invitationcenter"),
);

// Bulk-imported library foodItems have a Turkish foodName plus an optional
// foodNameEn fallback (added because a translation pass overwrote the
// originally-English foodName with Turkish text for every user, breaking
// the English UI). Anything the user typed in themselves has no
// foodNameEn and is unaffected. This swaps foodName -> foodNameEn in-place
// on every response that carries a food item, at the single fetch choke
// point, so none of the ~12 pages/components rendering foodName need to
// know this exists.
function localizeFoodNames<T>(data: T): T {
  if (i18n.language !== "en" || !data || typeof data !== "object") return data;
  const swap = (item: unknown) => {
    if (item && typeof item === "object" && "foodNameEn" in item) {
      const f = item as { foodName?: string; foodNameEn?: string | null };
      if (f.foodNameEn) f.foodName = f.foodNameEn;
    }
  };
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.foodItems)) obj.foodItems.forEach(swap);
  if (obj.foodItem) swap(obj.foodItem);
  return data;
}

class NutritionlibraryApiClient extends ApiClient {
  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return localizeFoodNames(await super.get<T>(endpoint, config));
  }
  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ): Promise<T> {
    return localizeFoodNames(await super.post<T>(endpoint, data, config));
  }
  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ): Promise<T> {
    return localizeFoodNames(await super.patch<T>(endpoint, data, config));
  }
}

export const nutritionlibraryApi = new NutritionlibraryApiClient(
  getServiceUrl("nutritionlibrary"),
);
export const mealtrackerApi = new ApiClient(getServiceUrl("mealtracker"));
export const nutritionaiApi = new ApiClient(getServiceUrl("nutritionai"));
export const agenthubApi = new ApiClient(getServiceUrl("agenthub"));
