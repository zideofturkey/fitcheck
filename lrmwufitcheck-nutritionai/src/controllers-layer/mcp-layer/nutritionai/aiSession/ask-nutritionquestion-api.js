const { AskNutritionQuestionManager } = require("apiLayer");
const { z } = require("zod");

const NutritionAiServiceMcpController = require("../../NutritionAiServiceMcpController");

class AskNutritionQuestionMcpController extends NutritionAiServiceMcpController {
  constructor(params) {
    super("askNutritionQuestion", "asknutritionquestion", params);
    this.dataName = "aiSession";
    this.crudType = "create";
  }

  createApiManager() {
    return new AskNutritionQuestionManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        aiSession: z
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
      inputText: z
        .string()
        .describe("Natural-language nutrition question in Turkish"),

      contextRange: z
        .string()
        .max(255)
        .optional()
        .describe("Time scope for context: today, week, month"),
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
    name: "askNutritionQuestion",
    description:
      "Creates an aiSession for nutrition guidance, fetches macro targets and meal context from sibling services, invokes the AI guidance library function, and persists the structured guidance note." +
      requiredRolesMarker,
    requiredRoles,
    parameters: AskNutritionQuestionMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new AskNutritionQuestionMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return AskNutritionQuestionMcpController.getOutputSchema().parse(result);
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
