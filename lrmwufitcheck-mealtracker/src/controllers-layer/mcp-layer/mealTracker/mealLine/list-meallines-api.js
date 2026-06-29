const { ListMealLinesManager } = require("apiLayer");
const { z } = require("zod");

const MealTrackerServiceMcpController = require("../../MealTrackerServiceMcpController");

class ListMealLinesMcpController extends MealTrackerServiceMcpController {
  constructor(params) {
    super("listMealLines", "listmeallines", params);
    this.dataName = "mealLines";
    this.crudType = "list";
  }

  createApiManager() {
    return new ListMealLinesManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        mealLines: z
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
      mealLogId: z.string().uuid().optional().describe(""),
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
    name: "listMealLines",
    description:
      "Lists meal lines for the authenticated user. mealLogId is an auto-filter param via isFilterParameter=true." +
      requiredRolesMarker,
    requiredRoles,
    parameters: ListMealLinesMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new ListMealLinesMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return ListMealLinesMcpController.getOutputSchema().parse(result);
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
