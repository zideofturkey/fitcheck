module.exports = (headers) => {
  // nutritionai Database Crud Object Mcp Api Routers
  return {
    aiSessionMcpRouter: require("./aiSession")(headers),
    aiCandidateMealMcpRouter: require("./aiCandidateMeal")(headers),
    aiCandidateLineMcpRouter: require("./aiCandidateLine")(headers),
    aiGuidanceNoteMcpRouter: require("./aiGuidanceNote")(headers),
  };
};
