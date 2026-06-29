module.exports = async (request) => {
  const { createSys_agentExecution } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const data = request.body?.data || request.data || request;
  const result = await createSys_agentExecution(data, context);
  return { status: 200, content: result };
};
