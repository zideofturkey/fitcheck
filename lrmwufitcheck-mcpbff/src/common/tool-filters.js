/**
 * Tool Filters
 *
 * Shared filtering logic for MCP tools across the unified MCP server,
 * REST tools API, and AI chat routes.
 *
 * Three filter stages applied in order:
 *   1. Remove _fetchXXList auto-generated grid APIs (always)
 *   2. Remove tools from explicitly disabled services
 *   3. Cap total tools at MAX_TOOLS, trimming from the end of the
 *      service array while protecting payment/billing services
 */

const MAX_TOOLS = 120;

const FETCH_LIST_PATTERN = /^_fetchList/;

const PROTECTED_SERVICE_PATTERNS = [
  /payment/i,
  /billing/i,
  /stripe/i,
  /subscri/i,
];

function isFetchListTool(name) {
  return FETCH_LIST_PATTERN.test(name);
}

function isProtectedService(name) {
  return PROTECTED_SERVICE_PATTERNS.some((p) => p.test(name));
}

/**
 * Apply all tool filters.
 *
 * @param {Array} tools - Full tool list from McpClientManager.getAllTools()
 * @param {Object} [options]
 * @param {string[]} [options.disabledServices] - Service names toggled off by the user
 * @param {number}   [options.maxTools]         - Tool cap (default 120)
 * @returns {{ tools: Array, autoFilteredServices: Array, fetchListCount: number }}
 */
function filterTools(tools, options = {}) {
  const { disabledServices = [], maxTools = MAX_TOOLS } = options;
  const disabledSet = new Set(disabledServices.map((s) => s.toLowerCase()));

  // Stage 1 — remove _fetchXXList
  let filtered = [];
  let fetchListCount = 0;
  for (const tool of tools) {
    if (isFetchListTool(tool.name)) {
      fetchListCount++;
    } else {
      filtered.push(tool);
    }
  }

  // Stage 2 — remove disabled services
  if (disabledSet.size > 0) {
    filtered = filtered.filter(
      (t) => !disabledSet.has((t.service || "").toLowerCase()),
    );
  }

  // Stage 3 — cap at maxTools, trimming services from the end
  const autoFilteredServices = [];
  if (filtered.length > maxTools) {
    const serviceOrder = [];
    const byService = {};
    for (const tool of filtered) {
      const svc = tool.service || "unknown";
      if (!byService[svc]) {
        byService[svc] = [];
        serviceOrder.push(svc);
      }
      byService[svc].push(tool);
    }

    const protectedSvcs = serviceOrder.filter((s) => isProtectedService(s));
    const nonProtectedSvcs = serviceOrder.filter((s) => !isProtectedService(s));

    const kept = [];
    for (const svc of protectedSvcs) {
      kept.push(...byService[svc]);
    }
    for (const svc of nonProtectedSvcs) {
      if (kept.length + byService[svc].length <= maxTools) {
        kept.push(...byService[svc]);
      } else {
        autoFilteredServices.push({
          service: svc,
          toolCount: byService[svc].length,
        });
      }
    }
    filtered = kept;
  }

  return { tools: filtered, autoFilteredServices, fetchListCount };
}

/**
 * Advisory-only: compute which services *would* be auto-filtered
 * if tools exceed maxTools. Used by the REST tools endpoint to inform
 * the frontend without actually removing tools from the response.
 */
function computeAutoFilteredServices(tools, maxTools = MAX_TOOLS) {
  const nonFetchList = tools.filter((t) => !isFetchListTool(t.name));
  if (nonFetchList.length <= maxTools) return [];

  const serviceOrder = [];
  const byService = {};
  for (const tool of nonFetchList) {
    const svc = tool.service || "unknown";
    if (!byService[svc]) {
      byService[svc] = [];
      serviceOrder.push(svc);
    }
    byService[svc].push(tool);
  }

  const protectedSvcs = serviceOrder.filter((s) => isProtectedService(s));
  const nonProtectedSvcs = serviceOrder.filter((s) => !isProtectedService(s));

  let count = 0;
  for (const svc of protectedSvcs) count += byService[svc].length;

  const result = [];
  for (const svc of nonProtectedSvcs) {
    if (count + byService[svc].length <= maxTools) {
      count += byService[svc].length;
    } else {
      result.push({ service: svc, toolCount: byService[svc].length });
    }
  }
  return result;
}

module.exports = {
  filterTools,
  computeAutoFilteredServices,
  isFetchListTool,
  isProtectedService,
  MAX_TOOLS,
};
