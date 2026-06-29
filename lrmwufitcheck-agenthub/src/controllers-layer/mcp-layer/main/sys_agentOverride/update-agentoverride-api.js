const { UpdateAgentOverrideManager } = require("apiLayer");
const { z } = require("zod");

const AgentHubServiceMcpController = require("../../AgentHubServiceMcpController");

class UpdateAgentOverrideMcpController extends AgentHubServiceMcpController {
  constructor(params) {
    super("updateAgentOverride", "updateagentoverride", params);
    this.dataName = "sys_agentOverride";
    this.crudType = "update";
  }

  createApiManager() {
    return new UpdateAgentOverrideManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        sys_agentOverride: z
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
          ),
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
      sys_agentOverrideId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      provider: z
        .string()
        .max(255)
        .optional()
        .describe("Override AI provider (e.g., openai, anthropic)."),

      model: z.string().max(255).optional().describe("Override model name."),

      systemPrompt: z.string().optional().describe("Override system prompt."),

      temperature: z
        .number()
        .optional()
        .describe("Override temperature (0-2)."),

      maxTokens: z.number().int().optional().describe("Override max tokens."),

      responseFormat: z
        .string()
        .max(255)
        .optional()
        .describe("Override response format (text/json)."),

      selectedTools: z
        .object({})
        .optional()
        .describe(
          "Array of tool names from the catalog that this agent can use.",
        ),

      guardrails: z
        .object({})
        .optional()
        .describe(
          "Override guardrails: { maxToolCalls, timeout, maxTokenBudget }.",
        ),

      enabled: z.boolean().optional().describe("Update the enabled flag."),
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
    name: "updateAgentOverride",
    description: "" + requiredRolesMarker,
    requiredRoles,
    parameters: UpdateAgentOverrideMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new UpdateAgentOverrideMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return UpdateAgentOverrideMcpController.getOutputSchema().parse(result);
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
