const { ListAgentChatsManager } = require("apiLayer");
const { z } = require("zod");

const AgentHubServiceMcpController = require("../../AgentHubServiceMcpController");

class ListAgentChatsMcpController extends AgentHubServiceMcpController {
  constructor(params) {
    super("listAgentChats", "listagentchats", params);
    this.dataName = "sys_agentConversations";
    this.crudType = "list";
  }

  createApiManager() {
    return new ListAgentChatsManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        sys_agentConversations: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            sessionId: z
              .string()
              .max(255)
              .describe("Unique conversation session identifier."),
            agentName: z
              .string()
              .max(255)
              .describe("Name of the agent this conversation belongs to."),
            userId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe("User who owns this conversation."),
            messages: z
              .object()
              .describe(
                "Array of conversation messages [{role, content, tool_calls?, tool_call_id?}].",
              ),
            messageCount: z
              .number()
              .int()
              .optional()
              .nullable()
              .describe("Number of messages in the conversation."),
          })
          .describe(
            "Conversation history for chat-mode AI agents. One record per session, keyed by sessionId.",
          )
          .array(),
      })
      .describe("The response object of the crud route");
  }

  static getInputScheme() {
    return {
      // Always include accessToken - it authenticates the request on behalf of the logged-in user
      accessToken: z
        .string()
        .optional()
        .describe(
          "The access token of the logged-in user. Pass this to authenticate API calls on behalf of the user. Required for protected routes, optional for public routes.",
        ),
      agentName: z
        .string()
        .max(255)
        .optional()
        .describe("Name of the agent this conversation belongs to."),

      userId: z
        .string()
        .uuid()
        .optional()
        .describe("User who owns this conversation."),
    };
  }
}

module.exports = (headers) => {
  const requiredRoles = [];
  const requiredRolesMarker =
    requiredRoles.length > 0
      ? ` [MBX_REQUIRED_ROLES:${requiredRoles.join("|")}]`
      : "";
  return {
    name: "listAgentChats",
    description: "" + requiredRolesMarker,
    requiredRoles,
    parameters: ListAgentChatsMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new ListAgentChatsMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return ListAgentChatsMcpController.getOutputSchema().parse(result);
        console.log("Mcp Response Ready", JSON.stringify(result));
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (err) {
        console.log("Mcp Error Occured", err.message);
        //**errorLog
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${err.message}`,
            },
          ],
        };
      }
    },
  };
};
