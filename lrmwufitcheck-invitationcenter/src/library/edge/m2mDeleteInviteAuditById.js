module.exports = async (request) => {
  const { deleteInviteAuditById } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const id = request.body?.id || request.params?.id || request.id;
  if (!id) {
    return { status: 400, message: "ID is required" };
  }
  const result = await deleteInviteAuditById(id, context);
  return { status: 200, content: result };
};
