/**
 * Service-specific API clients
 * Each Mindbricks service gets its own client instance with the correct base URL.
 * URLs are resolved once from VITE_* env vars at import time.
 */

import { ApiClient } from "@/lib/api-client";
import { getServiceUrl } from "@/config/environment";

// Core service clients
export const authApi = new ApiClient(getServiceUrl("auth"));
export const bffApi = new ApiClient(getServiceUrl("bff"));
export const notificationApi = new ApiClient(getServiceUrl("notification"));

// Business service clients
export const invitationcenterApi = new ApiClient(
  getServiceUrl("invitationcenter"),
);
export const nutritionlibraryApi = new ApiClient(
  getServiceUrl("nutritionlibrary"),
);
export const mealtrackerApi = new ApiClient(getServiceUrl("mealtracker"));
export const nutritionaiApi = new ApiClient(getServiceUrl("nutritionai"));
export const agenthubApi = new ApiClient(getServiceUrl("agenthub"));
