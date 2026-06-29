import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Custom env file loader that reads from .[mode].env format
function loadCustomEnv(mode) {
  const envFile = `.${mode}.env`;
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf-8");
    const env = {};
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key) {
          env[key.trim()] = valueParts.join("=").trim();
        }
      }
    });
    return env;
  }
  return {};
}

export default defineConfig(({ mode }) => {
  // Load custom env file (e.g., .dev.env, .beta.env, .prod.env)
  const customEnv = loadCustomEnv(mode);

  // Merge into process.env for Vite to expose as import.meta.env
  Object.entries(customEnv).forEach(([key, value]) => {
    if (key.startsWith("VITE_")) {
      process.env[key] = value;
    }
  });

  return {
    base: "/panel/",
    plugins: [
      react(),
      // The preview proxy strips the /panel prefix before forwarding to the
      // Vite dev server, so incoming requests arrive without the base prefix.
      // This middleware re-adds it so Vite can resolve modules and pages.
      {
        name: "preview-proxy-base-fix",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.url && !req.url.startsWith("/panel")) {
              req.url =
                "/panel" + (req.url.startsWith("/") ? req.url : "/" + req.url);
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Expose custom env vars to the app
      ...Object.fromEntries(
        Object.entries(customEnv)
          .filter(([key]) => key.startsWith("VITE_"))
          .map(([key, value]) => [
            `import.meta.env.${key}`,
            JSON.stringify(value),
          ]),
      ),
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: customEnv.VITE_MCP_BFF_URL || "http://localhost:3005",
          changeOrigin: true,
        },
      },
    },
    build: {
      // Disable sourcemaps for production builds (both 'prod' and default 'production' mode)
      sourcemap: mode === "dev" || mode === "development",
    },
  };
});
