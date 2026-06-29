module.exports = async (request) => {
  const { createBulkAiGuidanceNote } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const dataList =
    request.body?.dataList ||
    request.dataList ||
    (Array.isArray(request.body) ? request.body : [request.body]);
  if (!Array.isArray(dataList) || dataList.length === 0) {
    return { status: 400, message: "dataList must be a non-empty array" };
  }
  const result = await createBulkAiGuidanceNote(dataList, context);
  return { status: 200, content: result };
};
