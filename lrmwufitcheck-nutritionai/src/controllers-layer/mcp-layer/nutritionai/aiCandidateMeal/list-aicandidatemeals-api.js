const { ListAiCandidateMealsManager } = require("apiLayer");
const { z } = require("zod");

const NutritionAiServiceMcpController = require("../../NutritionAiServiceMcpController");

class ListAiCandidateMealsMcpController extends NutritionAiServiceMcpController {
  constructor(params) {
    super("listAiCandidateMeals", "listaicandidatemeals", params);
    this.dataName = "aiCandidateMeals";
    this.crudType = "list";
  }

  createApiManager() {
    return new ListAiCandidateMealsManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        aiCandidateMeals: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z.string().uuid().describe(""),
            aiSessionId: z.string().uuid().describe(""),
            proposedMealDate: z.string().optional().nullable().describe(""),
            proposedMealTime: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(""),
            proposedSlotName: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(""),
            candidateSource: z.enum(["aiAssistant"]).describe(""),
            warningText: z.string().optional().nullable().describe(""),
            confirmationRequired: z.boolean().describe(""),
            isConfirmed: z.boolean().describe(""),
            isCommitted: z.boolean().describe(""),
            totalCalories: z.number().optional().nullable().describe(""),
            totalProtein: z.number().optional().nullable().describe(""),
            totalCarbohydrates: z.number().optional().nullable().describe(""),
            totalFat: z.number().optional().nullable().describe(""),
            totalSugar: z.number().optional().nullable().describe(""),
            totalFiber: z.number().optional().nullable().describe(""),
            committedMealLogId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe(""),
          })
          .describe(
            "Stores the structured meal proposal produced by AI parsing of a user's natural-language input — holds proposed slot, date, nutrition totals, warning flags, and a confirmation status before the meal is committed to mealTracker.",
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

      aiSessionId: z.string().uuid().optional().describe(""),

      isConfirmed: z.boolean().optional().describe(""),

      isCommitted: z.boolean().optional().describe(""),
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
    name: "listAiCandidateMeals",
    description:
      "Lists candidate meals for the authenticated user." + requiredRolesMarker,
    requiredRoles,
    parameters: ListAiCandidateMealsMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new ListAiCandidateMealsMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return ListAiCandidateMealsMcpController.getOutputSchema().parse(result);
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
