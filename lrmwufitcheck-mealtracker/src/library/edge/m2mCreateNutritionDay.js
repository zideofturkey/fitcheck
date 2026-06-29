module.exports = async (request) => {
  const { createNutritionDay } = require("dbLayer");
  const context = { session: request.session, requestId: request.requestId };
  const data = request.body?.data || request.data || request;
  const result = await createNutritionDay(data, context);
  return { status: 200, content: result };
};
