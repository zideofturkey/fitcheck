module.exports = async (request) => {
  const { createMealLine } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const data = request.body?.data || request.data || request;
  const result = await createMealLine(data, context);
  return { status: 200, content: result };
};
