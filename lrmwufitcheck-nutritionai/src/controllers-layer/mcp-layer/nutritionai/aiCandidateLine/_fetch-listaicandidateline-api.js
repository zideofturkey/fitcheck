const { _fetchListAiCandidateLineManager } = require("apiLayer");
const { z } = require("zod");

const NutritionAiServiceMcpController = require("../../NutritionAiServiceMcpController");

class _fetchListAiCandidateLineMcpController extends NutritionAiServiceMcpController {
  constructor(params) {
    super("_fetchListAiCandidateLine", "_fetchlistaicandidateline", params);
    this.dataName = "aiCandidateLines";
    this.crudType = "list";
  }

  createApiManager() {
    return new _fetchListAiCandidateLineManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        aiCandidateLines: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z.string().uuid().describe(""),
            aiCandidateMealId: z.string().uuid().describe(""),
            detectedFoodName: z.string().max(255).describe(""),
            estimatedGrams: z.number().describe(""),
            estimatedCalories: z.number().optional().nullable().describe(""),
            estimatedProtein: z.number().optional().nullable().describe(""),
            estimatedCarbohydrates: z
              .number()
              .optional()
              .nullable()
              .describe(""),
            estimatedFat: z.number().optional().nullable().describe(""),
            estimatedSugar: z.number().optional().nullable().describe(""),
            estimatedFiber: z.number().optional().nullable().describe(""),
            quantityConfidence: z.number().optional().nullable().describe(""),
            nutritionReference: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(""),
            saveAsFood: z.boolean().describe(""),
          })
          .describe(
            "Represents a single food item detected within an AI candidate meal — stores AI-estimated gram amounts and nutrition values as a snapshot, along with confidence, reference source, and user's choice to save the food to their library.",
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

      aiCandidateMealId: z.string().uuid().optional().describe(""),
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
    name: "_fetchListAiCandidateLine",
    description:
      "System API to fetch list of aiCandidateLine records for frontend application. Auto-generated, not visible in design." +
      requiredRolesMarker,
    requiredRoles,
    parameters: _fetchListAiCandidateLineMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new _fetchListAiCandidateLineMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return _fetchListAiCandidateLineMcpController.getOutputSchema().parse(result);
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
