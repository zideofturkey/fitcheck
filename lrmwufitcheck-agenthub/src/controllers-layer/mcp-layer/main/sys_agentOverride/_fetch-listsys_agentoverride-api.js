const { _fetchListSys_agentOverrideManager } = require("apiLayer");
const { z } = require("zod");

const AgentHubServiceMcpController = require("../../AgentHubServiceMcpController");

class _fetchListSys_agentOverrideMcpController extends AgentHubServiceMcpController {
  constructor(params) {
    super("_fetchListSys_agentOverride", "_fetchlistsys_agentoverride", params);
    this.dataName = "sys_agentOverrides";
    this.crudType = "list";
  }

  createApiManager() {
    return new _fetchListSys_agentOverrideManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        sys_agentOverrides: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            agentName: z
              .string()
              .max(255)
              .describe("Design-time agent name this override applies to."),
            provider: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe("Override AI provider (e.g., openai, anthropic)."),
            model: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe("Override model name."),
            systemPrompt: z
              .string()
              .optional()
              .nullable()
              .describe("Override system prompt."),
            temperature: z
              .number()
              .optional()
              .nullable()
              .describe("Override temperature (0-2)."),
            maxTokens: z
              .number()
              .int()
              .optional()
              .nullable()
              .describe("Override max tokens."),
            responseFormat: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe("Override response format (text/json)."),
            selectedTools: z
              .object()
              .optional()
              .nullable()
              .describe(
                "Array of tool names from the catalog that this agent can use.",
              ),
            guardrails: z
              .object()
              .optional()
              .nullable()
              .describe(
                "Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.",
              ),
            enabled: z.boolean().describe("Enable or disable this agent."),
            updatedBy: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe("User who last updated this override."),
          })
          .describe(
            "Runtime overrides for design-time agents. Null fields use the design default.",
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
    name: "_fetchListSys_agentOverride",
    description:
      "System API to fetch list of sys_agentOverride records for frontend application. Auto-generated, not visible in design." +
      requiredRolesMarker,
    requiredRoles,
    parameters: _fetchListSys_agentOverrideMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new _fetchListSys_agentOverrideMcpController(
        mcpParams,
      );
      try {
        const result = await controller.processRequest();
        //return _fetchListSys_agentOverrideMcpController.getOutputSchema().parse(result);
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
