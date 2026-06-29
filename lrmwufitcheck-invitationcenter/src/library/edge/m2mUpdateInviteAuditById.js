module.exports = async (request) => {
  const { updateInviteAuditById } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const id = request.body?.id || request.params?.id || request.id;
  const dataClause =
    request.body?.dataClause || request.dataClause || request.body;
  if (dataClause && dataClause.id) delete dataClause.id;
  if (!id) {
    return { status: 400, message: "ID is required" };
  }
  const result = await updateInviteAuditById(id, dataClause, context);
  return { status: 200, content: result };
};
