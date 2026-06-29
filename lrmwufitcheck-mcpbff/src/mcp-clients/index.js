/**
 * MCP Clients Index
 *
 * Exports MCP client configurations for all project services.
 * Uses SERVICE_URL env vars as the base, appending /mcp for MCP endpoints.
 */

// Service endpoint configuration (base URLs, MCP is SERVICE_URL + '/mcp')
const MCP_SERVICES = {
  auth: {
    name: "auth",
    envVar: "AUTH_SERVICE_URL",
    defaultUrl: "http://localhost:3000/auth-api",
  },
  invitationCenter: {
    name: "invitationCenter",
    envVar: "INVITATIONCENTER_SERVICE_URL",
    defaultUrl: "http://localhost:3000/invitationCenter-api",
  },
  nutritionLibrary: {
    name: "nutritionLibrary",
    envVar: "NUTRITIONLIBRARY_SERVICE_URL",
    defaultUrl: "http://localhost:3000/nutritionLibrary-api",
  },
  mealTracker: {
    name: "mealTracker",
    envVar: "MEALTRACKER_SERVICE_URL",
    defaultUrl: "http://localhost:3000/mealTracker-api",
  },
  nutritionAi: {
    name: "nutritionAi",
    envVar: "NUTRITIONAI_SERVICE_URL",
    defaultUrl: "http://localhost:3000/nutritionAi-api",
  },
  agentHub: {
    name: "agentHub",
    envVar: "AGENTHUB_SERVICE_URL",
    defaultUrl: "http://localhost:3000/agentHub-api",
  },
};

/**
 * Get base service URL for a service
 */
function getServiceBaseUrl(serviceName) {
  const config = MCP_SERVICES[serviceName];
  if (!config) {
    throw new Error(`Unknown service: ${serviceName}`);
  }
  return process.env[config.envVar] || config.defaultUrl;
}

/**
 * Get MCP URL for a service (base URL + '/mcp')
 */
function getServiceMcpUrl(serviceName) {
  return getServiceBaseUrl(serviceName) + "/mcp";
}

/**
 * Get all service configurations
 */
function getAllServiceConfigs() {
  return Object.entries(MCP_SERVICES).map(([name, config]) => ({
    name,
    baseUrl: process.env[config.envVar] || config.defaultUrl,
    url: (process.env[config.envVar] || config.defaultUrl) + "/mcp",
  }));
}

module.exports = {
  MCP_SERVICES,
  getServiceBaseUrl,
  getServiceMcpUrl,
  getAllServiceConfigs,
};
