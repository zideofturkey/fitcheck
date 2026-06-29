const { ParseMealManager } = require("apiLayer");
const { z } = require("zod");

const NutritionAiServiceMcpController = require("../../NutritionAiServiceMcpController");

class ParseMealMcpController extends NutritionAiServiceMcpController {
  constructor(params) {
    super("parseMeal", "parsemeal", params);
    this.dataName = "aiSession";
    this.crudType = "create";
  }

  createApiManager() {
    return new ParseMealManager(this.request, "mcp");
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
        .describe("Raw Turkish meal description from the user"),

      proposedMealDate: z
        .string()
        .datetime()
        .optional()
        .describe("Optional date hint from user"),

      proposedMealTime: z
        .string()
        .max(255)
        .optional()
        .describe("Optional time hint from user"),

      proposedSlotName: z
        .string()
        .max(255)
        .optional()
        .describe("Optional meal slot override"),
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
    name: "parseMeal",
    description:
      "Accepts a natural-language Turkish meal description, creates an aiSession record, invokes the AI parsing library function, and creates the resulting aiCandidateMeal and aiCandidateLine records." +
      requiredRolesMarker,
    requiredRoles,
    parameters: ParseMealMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new ParseMealMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return ParseMealMcpController.getOutputSchema().parse(result);
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
