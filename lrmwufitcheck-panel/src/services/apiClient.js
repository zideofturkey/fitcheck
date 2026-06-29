import axios from "axios";

/**
 * API Client Configuration
 *
 * Creates axios instances for different services with proper interceptors.
 *
 * Environment files are loaded based on build mode:
 *   npm run dev         -> loads .dev.env (local development)
 *   npm run build-test  -> loads .test.env
 *   npm run build-beta  -> loads .beta.env
 *   npm run build-prod  -> loads .prod.env
 *
 * Environment variables expected:
 *   VITE_AUTH_URL - Auth service URL
 *   VITE_MCP_BFF_URL - MCP-BFF service URL
 *   VITE_<SERVICE_NAME>_URL - Business service URLs
 */

// Fallback local ports (used if env vars are not set)
const LOCAL_PORTS = {
  auth: "3001",
  "mcp-bff": "3005",
  invitationcenter: "3050",
  nutritionlibrary: "3051",
  mealtracker: "3052",
  nutritionai: "3053",
  agenthub: "3006",
};

// Get service URL from environment variables
const getServiceUrl = (serviceName) => {
  const envVarName = `VITE_${serviceName.toUpperCase().replace(/-/g, "_")}_URL`;
  const url = import.meta.env[envVarName];

  if (url) {
    return url;
  }

  // Fallback to localhost with default port
  const port = LOCAL_PORTS[serviceName.toLowerCase()] || "3000";
  return `http://localhost:${port}`;
};

// Get auth service URL from environment
const getAuthUrl = () => {
  return (
    import.meta.env.VITE_AUTH_URL || `http://localhost:${LOCAL_PORTS.auth}`
  );
};

// Get MCP-BFF service URL from environment
const getMcpBffUrl = () => {
  return (
    import.meta.env.VITE_MCP_BFF_URL ||
    `http://localhost:${LOCAL_PORTS["mcp-bff"]}`
  );
};

// Create auth API client
export const createAuthClient = () => {
  const client = axios.create({
    baseURL: getAuthUrl(),
    headers: {
      "Content-Type": "application/json",
    },
  });

  setupInterceptors(client);
  return client;
};

// Create MCP-BFF client
export const createMcpBffClient = () => {
  const client = axios.create({
    baseURL: `${getMcpBffUrl()}/api`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  setupInterceptors(client);
  return client;
};

// Create service client for business services
export const createServiceClient = (serviceName) => {
  const client = axios.create({
    baseURL: getServiceUrl(serviceName),
    headers: {
      "Content-Type": "application/json",
    },
  });

  setupInterceptors(client);
  return client;
};

// Setup request/response interceptors
const setupInterceptors = (client) => {
  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config) => {
      // Get token from storage
      const storage = localStorage.getItem("lrmwufitcheck-auth-storage");
      let parsedState = null;
      if (storage) {
        try {
          const { state } = JSON.parse(storage);
          parsedState = state || null;
          if (parsedState?.accessToken) {
            config.headers.Authorization = `Bearer ${parsedState.accessToken}`;
          }
        } catch (e) {
          console.error("Error parsing auth storage:", e);
        }
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 - unauthorized
      if (error.response?.status === 401) {
        // Clear auth storage so the Zustand persist rehydration won't
        // restore stale tokens on the next page load.
        localStorage.removeItem("lrmwufitcheck-auth-storage");

        // Use replaceState + reload instead of window.location.href to
        // avoid an infinite loop: href = '/login' can race with Zustand
        // persist writing the old token back to localStorage before the
        // navigation completes.
        if (window.location.pathname !== "/panel/login") {
          window.location.replace("/panel/login");
        }
      }
      return Promise.reject(error);
    },
  );
};

// Default clients
export const authClient = createAuthClient();
export const mcpBffClient = createMcpBffClient();

// Re-create clients (useful after environment change)
export const refreshClients = () => {
  Object.assign(authClient.defaults, {
    baseURL: getAuthUrl(),
  });
  Object.assign(mcpBffClient.defaults, {
    baseURL: `${getMcpBffUrl()}/api`,
  });
};

// Environment constants for UI
export const ENVIRONMENTS = {
  local: "local",
  preview: "preview",
  staging: "staging",
  production: "production",
};

// Remote environment base URLs (used by bucket service, etc.)
export const REMOTE_ENVIRONMENTS = {
  preview: "https://lrmwufitcheck.preview.mindbricks.com",
  staging: "https://lrmwufitcheck-stage.mindbricks.co",
  production: "https://lrmwufitcheck.mindbricks.co",
};

// Get current environment based on build mode
export const getCurrentEnvironment = () => {
  const mode = import.meta.env.MODE;

  if (mode === "dev" || mode === "development") {
    return "local";
  }
  if (mode === "test") {
    return "preview";
  }
  if (mode === "stage") {
    return "staging";
  }
  if (mode === "prod" || mode === "production") {
    return "production";
  }

  // Default to local for unknown modes
  return "local";
};

export { getMcpBffUrl, getAuthUrl, getServiceUrl, LOCAL_PORTS };
