module.exports = (headers) => {
  // main Database Crud Object Mcp Api Routers
  return {
    sys_agentOverrideMcpRouter: require("./sys_agentOverride")(headers),
    sys_agentExecutionMcpRouter: require("./sys_agentExecution")(headers),
    sys_toolCatalogMcpRouter: require("./sys_toolCatalog")(headers),
    sys_agentConversationMcpRouter: require("./sys_agentConversation")(headers),
  };
};
