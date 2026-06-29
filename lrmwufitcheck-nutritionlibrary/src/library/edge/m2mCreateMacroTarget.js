module.exports = async (request) => {
  const { createMacroTarget } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const data = request.body?.data || request.data || request;
  const result = await createMacroTarget(data, context);
  return { status: 200, content: result };
};
