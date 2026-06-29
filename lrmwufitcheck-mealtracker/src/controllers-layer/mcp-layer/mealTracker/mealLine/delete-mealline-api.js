const { DeleteMealLineManager } = require("apiLayer");
const { z } = require("zod");

const MealTrackerServiceMcpController = require("../../MealTrackerServiceMcpController");

class DeleteMealLineMcpController extends MealTrackerServiceMcpController {
  constructor(params) {
    super("deleteMealLine", "deletemealline", params);
    this.dataName = "mealLine";
    this.crudType = "delete";
  }

  createApiManager() {
    return new DeleteMealLineManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        mealLine: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z.string().uuid().describe(""),
            mealLogId: z.string().uuid().describe(""),
            sourceFoodItemId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe(""),
            sourcePresetMealId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe(""),
            itemName: z.string().max(255).describe(""),
            consumedGrams: z.number().describe(""),
            itemCalories: z.number().describe(""),
            itemProtein: z.number().describe(""),
            itemCarbohydrates: z.number().describe(""),
            itemFat: z.number().describe(""),
            itemSugar: z.number().describe(""),
            itemFiber: z.number().describe(""),
            lineSource: z
              .enum([
                "foodLibrary",
                "presetTemplate",
                "manualEntry",
                "aiAssistant",
                "temporaryAi",
              ])
              .describe(""),
          })
          .describe(
            "An individual food item within a meal log, storing the consumed gram amount and snapshot nutrition values calculated at log time — immutable with respect to food library changes.",
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
      mealLineId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be deleted",
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
    name: "deleteMealLine",
    description:
      "Deletes a meal line item and recomputes the parent meal log and daily nutrition totals." +
      requiredRolesMarker,
    requiredRoles,
    parameters: DeleteMealLineMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new DeleteMealLineMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return DeleteMealLineMcpController.getOutputSchema().parse(result);
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
