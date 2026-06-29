/**
 * Environment configuration for fitcheck frontend
 * Auto-generated from project definition — DO NOT EDIT.
 *
 * AI agents: READ-ONLY. This file is overwritten on every codegen run.
 * Add custom environment helpers as NEW files in this folder (e.g.
 * `environment-helpers.ts`) — any file whose name doesn't match Genesis's
 * generated set survives rebuilds.
 *
 * All service URLs are derived from a single VITE_SERVICE_URL base.
 * Each build mode loads its corresponding env file:
 *   pnpm run dev        → .dev.env   (Vite proxy, relative paths)
 *   pnpm run build-test → .env.test  (preview URLs)
 *   pnpm run build-stage→ .env.stage (staging URLs)
 *   pnpm run build-prod → .env.prod  (production URLs)
 */

export interface ServiceUrls {
  auth: string;
  bff: string;
  notification: string;
  invitationcenter: string;
  nutritionlibrary: string;
  mealtracker: string;
  nutritionai: string;
  agenthub: string;
}

function buildServiceUrls(): ServiceUrls {
  const base = import.meta.env.VITE_SERVICE_URL || "";

  // In dev mode (pnpm run dev), Vite proxy handles routing — use relative paths
  if (import.meta.env.DEV) {
    return {
      auth: "/auth-api",
      bff: "/bff-api",
      notification: "/notification-api",
      invitationcenter: "/invitationcenter-api",
      nutritionlibrary: "/nutritionlibrary-api",
      mealtracker: "/mealtracker-api",
      nutritionai: "/nutritionai-api",
      agenthub: "/agenthub-api",
    };
  }

  // Production builds — derive all URLs from VITE_SERVICE_URL
  return {
    auth: `${base}/auth-api`,
    bff: `${base}/bff-api`,
    notification: `${base}/notification-api`,
    invitationcenter: `${base}/invitationcenter-api`,
    nutritionlibrary: `${base}/nutritionlibrary-api`,
    mealtracker: `${base}/mealtracker-api`,
    nutritionai: `${base}/nutritionai-api`,
    agenthub: `${base}/agenthub-api`,
  };
}

const serviceUrls = buildServiceUrls();

export const getServiceUrls = (): ServiceUrls => serviceUrls;
export const getServiceUrl = (service: keyof ServiceUrls): string =>
  serviceUrls[service];
