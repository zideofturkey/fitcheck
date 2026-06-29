import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// `.dev.env` reader — matches the suffix-after-mode filename every
// backend service generator emits (auth, bff, notification, mcp-bff,
// frontgate, custom services). Vite's native `loadEnv(mode)` reads
// `.env.<mode>`, so dev mode needs a manual read; test/stage/prod keep
// using `.env.<mode>` via `loadEnv`.
function loadDevEnv() {
  const envFile = path.resolve(process.cwd(), ".dev.env");
  if (!fs.existsSync(envFile)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

export default defineConfig(({ mode }) => {
  const isDev = mode === "dev" || mode === "development";

  // Dev → custom `.dev.env` reader. Other modes → Vite's native loader.
  // In both cases, expose VITE_* vars to the running app via process.env
  // so `import.meta.env.VITE_*` resolves.
  const env = isDev ? loadDevEnv() : loadEnv(mode, process.cwd(), "");
  for (const [k, v] of Object.entries(env)) {
    if (k.startsWith("VITE_")) process.env[k] = v;
  }

  // Fallback proxy target — used when a per-service VITE_<X>_URL is
  // absent. In production builds this is irrelevant (no dev server).
  const fallbackTarget =
    env.VITE_SERVICE_URL || "https://lrmwufitcheck.preview.mindbricks.com";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 5173,
      host: true,
      proxy: {
        "/auth-api": {
          target: env.VITE_AUTH_URL || fallbackTarget,
          changeOrigin: true,
        },
        "/bff-api": {
          target: env.VITE_BFF_URL || fallbackTarget,
          changeOrigin: true,
        },
        "/notification-api": {
          target: env.VITE_NOTIFICATION_URL || fallbackTarget,
          changeOrigin: true,
        },
        "/invitationcenter-api": {
          target: env.VITE_INVITATIONCENTER_URL || fallbackTarget,
          changeOrigin: true,
        },
        "/nutritionlibrary-api": {
          target: env.VITE_NUTRITIONLIBRARY_URL || fallbackTarget,
          changeOrigin: true,
        },
        "/mealtracker-api": {
          target: env.VITE_MEALTRACKER_URL || fallbackTarget,
          changeOrigin: true,
        },
        "/nutritionai-api": {
          target: env.VITE_NUTRITIONAI_URL || fallbackTarget,
          changeOrigin: true,
        },
        "/agenthub-api": {
          target: env.VITE_AGENTHUB_URL || fallbackTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
    // .env.<mode> only used for test/stage/prod; dev reads `.dev.env` above.
    envDir: ".",
    envPrefix: "VITE_",
  };
});
