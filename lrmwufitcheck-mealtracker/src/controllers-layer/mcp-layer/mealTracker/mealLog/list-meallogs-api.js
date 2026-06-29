const { ListMealLogsManager } = require("apiLayer");
const { z } = require("zod");

const MealTrackerServiceMcpController = require("../../MealTrackerServiceMcpController");

class ListMealLogsMcpController extends MealTrackerServiceMcpController {
  constructor(params) {
    super("listMealLogs", "listmeallogs", params);
    this.dataName = "mealLogs";
    this.crudType = "list";
  }

  createApiManager() {
    return new ListMealLogsManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        mealLogs: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z.string().uuid().describe(""),
            mealDate: z.string().describe(""),
            mealTime: z.string().max(255).describe(""),
            slotName: z.string().max(255).describe(""),
            logSource: z
              .enum([
                "foodLibrary",
                "presetTemplate",
                "manualEntry",
                "aiAssistant",
              ])
              .describe(""),
            noteText: z.string().max(255).optional().nullable().describe(""),
            totalCalories: z.number().describe(""),
            totalProtein: z.number().describe(""),
            totalCarbohydrates: z.number().describe(""),
            totalFat: z.number().describe(""),
            totalSugar: z.number().describe(""),
            totalFiber: z.number().describe(""),
          })
          .describe(
            "A single meal entry for a user on a given date and time, tagged with a slot name and source, storing meal-level nutrition totals.",
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
      fromDate: z
        .string()
        .datetime()
        .optional()
        .describe("Optional range start for multi-day queries"),

      toDate: z
        .string()
        .datetime()
        .optional()
        .describe("Optional range end for multi-day queries"),

      mealDate: z.string().datetime().optional().describe(""),

      logSource: z
        .enum(["foodLibrary", "presetTemplate", "manualEntry", "aiAssistant"])
        .optional()
        .describe(""),
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
    name: "listMealLogs",
    description:
      "Lists meal logs for the authenticated user with optional date range filtering. mealDate and logSource are auto-filtered via isFilterParameter." +
      requiredRolesMarker,
    requiredRoles,
    parameters: ListMealLogsMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new ListMealLogsMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return ListMealLogsMcpController.getOutputSchema().parse(result);
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
