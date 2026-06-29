module.exports = (headers) => {
  // AiCandidateMeal Db Object Rest Api Router
  const aiCandidateMealMcpRouter = [];

  // confirmCandidateMeal controller
  aiCandidateMealMcpRouter.push(
    require("./confirm-candidatemeal-api")(headers),
  );
  // getAiCandidateMeal controller
  aiCandidateMealMcpRouter.push(require("./get-aicandidatemeal-api")(headers));
  // listAiCandidateMeals controller
  aiCandidateMealMcpRouter.push(
    require("./list-aicandidatemeals-api")(headers),
  );
  // rejectCandidateMeal controller
  aiCandidateMealMcpRouter.push(require("./reject-candidatemeal-api")(headers));
  // _fetchListAiCandidateMeal controller
  aiCandidateMealMcpRouter.push(
    require("./_fetch-listaicandidatemeal-api")(headers),
  );

  return aiCandidateMealMcpRouter;
};
