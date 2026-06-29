const { _fetchListSys_agentExecutionManager } = require("apiLayer");
const { z } = require("zod");

const AgentHubServiceMcpController = require("../../AgentHubServiceMcpController");

class _fetchListSys_agentExecutionMcpController extends AgentHubServiceMcpController {
  constructor(params) {
    super(
      "_fetchListSys_agentExecution",
      "_fetchlistsys_agentexecution",
      params,
    );
    this.dataName = "sys_agentExecutions";
    this.crudType = "list";
  }

  createApiManager() {
    return new _fetchListSys_agentExecutionManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        sys_agentExecutions: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            agentName: z.string().max(255).describe("Agent that was executed."),
            agentType: z
              .enum(["design", "dynamic"])
              .describe("Whether this was a design-time or dynamic agent."),
            source: z
              .enum(["rest", "sse", "kafka", "agent"])
              .describe("How the agent was triggered."),
            userId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe("User who triggered the execution."),
            input: z
              .object()
              .optional()
              .nullable()
              .describe("Request input (truncated for large payloads)."),
            output: z
              .object()
              .optional()
              .nullable()
              .describe("Response output (truncated for large payloads)."),
            toolCalls: z
              .number()
              .int()
              .optional()
              .nullable()
              .describe("Number of tool calls made during execution."),
            tokenUsage: z
              .object()
              .optional()
              .nullable()
              .describe("Token usage: { prompt, completion, total }."),
            durationMs: z
              .number()
              .int()
              .optional()
              .nullable()
              .describe("Execution time in milliseconds."),
            status: z
              .enum(["success", "error", "timeout"])
              .describe("Execution status."),
            error: z
              .string()
              .optional()
              .nullable()
              .describe("Error message if execution failed."),
          })
          .describe(
            "Agent execution log. Records each agent invocation with input, output, and performance metrics.",
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
        .describe("Agent that was executed."),

      agentType: z
        .enum(["design", "dynamic"])
        .optional()
        .describe("Whether this was a design-time or dynamic agent."),

      source: z
        .enum(["rest", "sse", "kafka", "agent"])
        .optional()
        .describe("How the agent was triggered."),

      userId: z
        .string()
        .uuid()
        .optional()
        .describe("User who triggered the execution."),

      status: z
        .enum(["success", "error", "timeout"])
        .optional()
        .describe("Execution status."),
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
    name: "_fetchListSys_agentExecution",
    description:
      "System API to fetch list of sys_agentExecution records for frontend application. Auto-generated, not visible in design." +
      requiredRolesMarker,
    requiredRoles,
    parameters: _fetchListSys_agentExecutionMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new _fetchListSys_agentExecutionMcpController(
        mcpParams,
      );
      try {
        const result = await controller.processRequest();
        //return _fetchListSys_agentExecutionMcpController.getOutputSchema().parse(result);
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
