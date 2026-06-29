module.exports = async (request) => {
  const { updateUserByQuery } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const dataClause =
    request.body?.dataClause || request.dataClause || request.body;
  const query = request.body?.query || request.query || {};
  if (!query || typeof query !== "object" || Object.keys(query).length === 0) {
    return {
      status: 400,
      message: "Query is required and must be a non-empty object",
    };
  }
  const result = await updateUserByQuery(dataClause, query, context);
  return { status: 200, content: result };
};
