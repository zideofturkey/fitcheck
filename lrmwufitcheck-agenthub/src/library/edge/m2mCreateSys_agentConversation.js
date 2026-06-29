module.exports = async (request) => {
  const { createSys_agentConversation } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const data = request.body?.data || request.data || request;
  const result = await createSys_agentConversation(data, context);
  return { status: 200, content: result };
};
