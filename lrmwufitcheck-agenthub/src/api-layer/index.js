module.exports = {
  AgentHubServiceManager: require("./service-manager/AgentHubServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // Sys_agentOverride Db Object
  GetAgentOverrideManager: require("./main/sys_agentOverride/get-agentoverride-api"),
  ListAgentOverridesManager: require("./main/sys_agentOverride/list-agentoverrides-api"),
  CreateAgentOverrideManager: require("./main/sys_agentOverride/create-agentoverride-api"),
  UpdateAgentOverrideManager: require("./main/sys_agentOverride/update-agentoverride-api"),
  DeleteAgentOverrideManager: require("./main/sys_agentOverride/delete-agentoverride-api"),
  _fetchListSys_agentOverrideManager: require("./main/sys_agentOverride/_fetch-listsys_agentoverride-api"),
  // Sys_agentExecution Db Object
  ListAgentExecutionsManager: require("./main/sys_agentExecution/list-agentexecutions-api"),
  GetAgentExecutionManager: require("./main/sys_agentExecution/get-agentexecution-api"),
  _fetchListSys_agentExecutionManager: require("./main/sys_agentExecution/_fetch-listsys_agentexecution-api"),
  // Sys_toolCatalog Db Object
  ListToolCatalogManager: require("./main/sys_toolCatalog/list-toolcatalog-api"),
  GetToolCatalogEntryManager: require("./main/sys_toolCatalog/get-toolcatalogentry-api"),
  _fetchListSys_toolCatalogManager: require("./main/sys_toolCatalog/_fetch-listsys_toolcatalog-api"),
  // Sys_agentConversation Db Object
  ListAgentChatsManager: require("./main/sys_agentConversation/list-agentchats-api"),
  GetAgentChatMessagesManager: require("./main/sys_agentConversation/get-agentchatmessages-api"),
  _fetchListSys_agentConversationManager: require("./main/sys_agentConversation/_fetch-listsys_agentconversation-api"),
  integrationRouter: require("./integrations/testRouter"),
};
