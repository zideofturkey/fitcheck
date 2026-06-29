const { ListToolCatalogManager } = require("apiLayer");
const { z } = require("zod");

const AgentHubServiceMcpController = require("../../AgentHubServiceMcpController");

class ListToolCatalogMcpController extends AgentHubServiceMcpController {
  constructor(params) {
    super("listToolCatalog", "listtoolcatalog", params);
    this.dataName = "sys_toolCatalogs";
    this.crudType = "list";
  }

  createApiManager() {
    return new ListToolCatalogManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        sys_toolCatalogs: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            toolName: z
              .string()
              .max(255)
              .describe("Full tool name (e.g., service:apiName)."),
            serviceName: z.string().max(255).describe("Source service name."),
            description: z
              .string()
              .optional()
              .nullable()
              .describe("Tool description."),
            parameters: z
              .object()
              .optional()
              .nullable()
              .describe("JSON Schema of tool parameters."),
            lastRefreshed: z
              .string()
              .optional()
              .nullable()
              .describe("When this tool was last discovered/refreshed."),
          })
          .describe(
            "Cached tool catalog discovered from project services. Refreshed periodically.",
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
      serviceName: z
        .string()
        .max(255)
        .optional()
        .describe("Source service name."),
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
    name: "listToolCatalog",
    description: "" + requiredRolesMarker,
    requiredRoles,
    parameters: ListToolCatalogMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new ListToolCatalogMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return ListToolCatalogMcpController.getOutputSchema().parse(result);
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
