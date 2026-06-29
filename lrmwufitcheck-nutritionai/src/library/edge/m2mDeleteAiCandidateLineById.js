module.exports = async (request) => {
  const { deleteAiCandidateLineById } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const id = request.body?.id || request.params?.id || request.id;
  if (!id) {
    return { status: 400, message: "ID is required" };
  }
  const result = await deleteAiCandidateLineById(id, context);
  return { status: 200, content: result };
};
