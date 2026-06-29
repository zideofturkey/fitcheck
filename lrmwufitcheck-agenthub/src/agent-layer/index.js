const {
  createNutritionGuidanceAgentRuntime,
} = require("./nutritionGuidanceAgent/agent-runtime");
const {
  createMealParsingAgentRuntime,
} = require("./mealParsingAgent/agent-runtime");
const { registerAgentRuntimes, executeAgent } = require("./agent-executor");

function initializeAgents(serviceContext) {
  const runtimes = {};

  // Bind serviceContext.agentRuntimes to the SAME runtimes object
  // BEFORE any createXxxRuntime call. Each createXxxRuntime
  // immediately calls buildXxxToolRegistry(serviceContext) which
  // probes `serviceContext.agentRuntimes?.['otherAgent']` to register
  // sub-agent tools on orchestrators. Without this pre-binding, the
  // probe returns undefined for every sibling and orchestrators end
  // up with zero sub-agent tools registered.
  //
  // Caveats: the runtimes object is shared by reference, so a
  // createXxxRuntime sees ALL siblings created BEFORE it but none of
  // those created AFTER. For services with cross-orchestrator
  // dependencies (agent A registers agent B as a tool AND vice
  // versa), the second-encountered direction works while the first
  // doesn't. The codegen orders agents top-down per declaration order
  // — keep the orchestrators last in the agent list when both
  // directions are needed, OR file an enhancement to make this a
  // true two-pass init with a rebuildToolRegistry call after assignment.
  serviceContext.agentRuntimes = runtimes;

  runtimes["nutritionGuidanceAgent"] =
    createNutritionGuidanceAgentRuntime(serviceContext);
  runtimes["mealParsingAgent"] = createMealParsingAgentRuntime(serviceContext);

  registerAgentRuntimes(runtimes);
  return runtimes;
}

module.exports = { initializeAgents, executeAgent };
