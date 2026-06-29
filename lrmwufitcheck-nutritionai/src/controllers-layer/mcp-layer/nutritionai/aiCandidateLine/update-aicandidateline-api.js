const { UpdateAiCandidateLineManager } = require("apiLayer");
const { z } = require("zod");

const NutritionAiServiceMcpController = require("../../NutritionAiServiceMcpController");

class UpdateAiCandidateLineMcpController extends NutritionAiServiceMcpController {
  constructor(params) {
    super("updateAiCandidateLine", "updateaicandidateline", params);
    this.dataName = "aiCandidateLine";
    this.crudType = "update";
  }

  createApiManager() {
    return new UpdateAiCandidateLineManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        aiCandidateLine: z
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
      aiCandidateLineId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      estimatedGrams: z.number().optional().describe("Updated gram amount"),

      saveAsFood: z
        .boolean()
        .optional()
        .describe("Toggle save-to-library intent"),

      detectedFoodName: z
        .string()
        .max(255)
        .optional()
        .describe("User may rename the detected food"),
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
    name: "updateAiCandidateLine",
    description:
      "Updates a single candidate food line — allows the user to adjust gram amounts, toggle save-as-food, or rename the detected food. Recalculates nutrition values proportionally when grams change." +
      requiredRolesMarker,
    requiredRoles,
    parameters: UpdateAiCandidateLineMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new UpdateAiCandidateLineMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return UpdateAiCandidateLineMcpController.getOutputSchema().parse(result);
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
