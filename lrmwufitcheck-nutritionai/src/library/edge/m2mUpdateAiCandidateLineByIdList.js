module.exports = async (request) => {
  const { updateAiCandidateLineByIdList } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const idList = request.body?.idList || request.idList || [];
  const dataClause =
    request.body?.dataClause || request.dataClause || request.body;
  if (dataClause && dataClause.idList) delete dataClause.idList;
  if (!Array.isArray(idList) || idList.length === 0) {
    return { status: 400, message: "idList must be a non-empty array" };
  }
  const result = await updateAiCandidateLineByIdList(
    idList,
    dataClause,
    context,
  );
  return { status: 200, content: result };
};
