const { hexaLogger } = require("common");
const { raiseAgentResultEvent } = require("./agent-event-raiser");

let _runtimes = null;

function registerAgentRuntimes(runtimes) {
  _runtimes = runtimes;
}

function getAgentRuntime(agentName) {
  if (!_runtimes) return null;
  return _runtimes[agentName] || null;
}

async function executeAgent(agentName, data, options) {
  const runtime = getAgentRuntime(agentName);
  if (!runtime) {
    throw new Error(
      `Agent "${agentName}" runtime not found. Make sure the agent exists and is initialized.`,
    );
  }

  const syntheticRequest = {
    body: data || {},
    params: options?.params || {},
    query: options?.query || {},
    headers: options?.headers || {},
    session: options?.session || null,
    path: `/internal/agent/${agentName}`,
  };

  const result = await runtime.execute(syntheticRequest, null);

  raiseAgentResultEvent(agentName, result, {
    source: "internal",
    session: options?.session,
  });

  hexaLogger.insertInfo(
    "AgentInternalExecutionSuccess",
    { agent: agentName },
    "agent-executor.executeAgent",
    { resultType: typeof result },
  );

  return result;
}

module.exports = { registerAgentRuntimes, getAgentRuntime, executeAgent };
