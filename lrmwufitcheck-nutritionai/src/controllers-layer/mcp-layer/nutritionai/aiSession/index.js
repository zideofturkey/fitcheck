module.exports = (headers) => {
  // AiSession Db Object Rest Api Router
  const aiSessionMcpRouter = [];

  // parseMeal controller
  aiSessionMcpRouter.push(require("./parse-meal-api")(headers));
  // askNutritionQuestion controller
  aiSessionMcpRouter.push(require("./ask-nutritionquestion-api")(headers));
  // getAiSession controller
  aiSessionMcpRouter.push(require("./get-aisession-api")(headers));
  // listAiSessions controller
  aiSessionMcpRouter.push(require("./list-aisessions-api")(headers));
  // _fetchListAiSession controller
  aiSessionMcpRouter.push(require("./_fetch-listaisession-api")(headers));

  return aiSessionMcpRouter;
};
