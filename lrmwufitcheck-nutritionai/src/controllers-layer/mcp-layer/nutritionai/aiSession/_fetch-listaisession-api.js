const { _fetchListAiSessionManager } = require("apiLayer");
const { z } = require("zod");

const NutritionAiServiceMcpController = require("../../NutritionAiServiceMcpController");

class _fetchListAiSessionMcpController extends NutritionAiServiceMcpController {
  constructor(params) {
    super("_fetchListAiSession", "_fetchlistaisession", params);
    this.dataName = "aiSessions";
    this.crudType = "list";
  }

  createApiManager() {
    return new _fetchListAiSessionManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        aiSessions: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z.string().uuid().describe(""),
            sessionType: z
              .enum(["mealParsing", "nutritionGuidance"])
              .describe(""),
            inputText: z.string().describe(""),
            detectedLanguage: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(""),
            sessionState: z
              .enum(["pending", "needsConfirmation", "completed", "failed"])
              .describe(""),
            confidenceScore: z.number().optional().nullable().describe(""),
            finalResponseText: z.string().optional().nullable().describe(""),
          })
          .describe(
            "Records every AI interaction initiated by a user — either a meal-parsing request or a nutrition guidance question — capturing the raw input, detected language, processing state, and final localized response.",
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
      userId: z.string().uuid().optional().describe(""),

      sessionType: z
        .enum(["mealParsing", "nutritionGuidance"])
        .optional()
        .describe(""),

      sessionState: z
        .enum(["pending", "needsConfirmation", "completed", "failed"])
        .optional()
        .describe(""),
    };
  }
}

module.exports = (headers) => {
  const requiredRoles = ["superAdmin", "admin"];
  const requiredRolesMarker =
    requiredRoles.length > 0
      ? ` [MBX_REQUIRED_ROLES:${requiredRoles.join("|")}]`
      : "";
  return {
    name: "_fetchListAiSession",
    description:
      "System API to fetch list of aiSession records for frontend application. Auto-generated, not visible in design." +
      requiredRolesMarker,
    requiredRoles,
    parameters: _fetchListAiSessionMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new _fetchListAiSessionMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return _fetchListAiSessionMcpController.getOutputSchema().parse(result);
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
