module.exports = (headers) => {
  // Sys_agentConversation Db Object Rest Api Router
  const sys_agentConversationMcpRouter = [];

  // listAgentChats controller
  sys_agentConversationMcpRouter.push(
    require("./list-agentchats-api")(headers),
  );
  // getAgentChatMessages controller
  sys_agentConversationMcpRouter.push(
    require("./get-agentchatmessages-api")(headers),
  );
  // _fetchListSys_agentConversation controller
  sys_agentConversationMcpRouter.push(
    require("./_fetch-listsys_agentconversation-api")(headers),
  );

  return sys_agentConversationMcpRouter;
};
