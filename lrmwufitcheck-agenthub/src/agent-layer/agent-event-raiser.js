const { sendMessageToKafka, hexaLogger } = require("common");

const AGENT_RESULT_TOPICS = {
  nutritionGuidanceAgent:
    "lrmwufitcheck-agenthub-service-agent-nutritionGuidanceAgent-result",
  mealParsingAgent:
    "lrmwufitcheck-agenthub-service-agent-mealParsingAgent-result",
};

const raiseAgentResultEvent = async (agentName, result, context) => {
  const topic = AGENT_RESULT_TOPICS[agentName];
  if (!topic) return;

  try {
    await sendMessageToKafka(topic, {
      _eventType: "agent-result",
      _agent: agentName,
      _source: context?.source || "unknown",
      _sourceController: context?.controller || null,
      _timestamp: new Date().toISOString(),
      session: context?.session || null,
      result,
    });
  } catch (err) {
    hexaLogger.insertError(
      "AgentResultEventPublishError",
      { agent: agentName, topic, source: context?.source },
      "agent-event-raiser.raiseAgentResultEvent",
      err,
    );
  }
};

module.exports = { raiseAgentResultEvent, AGENT_RESULT_TOPICS };
