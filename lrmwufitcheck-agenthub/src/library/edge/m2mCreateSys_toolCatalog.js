module.exports = async (request) => {
  const { createSys_toolCatalog } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const data = request.body?.data || request.data || request;
  const result = await createSys_toolCatalog(data, context);
  return { status: 200, content: result };
};
