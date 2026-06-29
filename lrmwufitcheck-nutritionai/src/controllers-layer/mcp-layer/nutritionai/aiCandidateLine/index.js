module.exports = (headers) => {
  // AiCandidateLine Db Object Rest Api Router
  const aiCandidateLineMcpRouter = [];

  // updateAiCandidateLine controller
  aiCandidateLineMcpRouter.push(
    require("./update-aicandidateline-api")(headers),
  );
  // _fetchListAiCandidateLine controller
  aiCandidateLineMcpRouter.push(
    require("./_fetch-listaicandidateline-api")(headers),
  );

  return aiCandidateLineMcpRouter;
};
