const { GetMealLogManager } = require("apiLayer");
const { z } = require("zod");

const MealTrackerServiceMcpController = require("../../MealTrackerServiceMcpController");

class GetMealLogMcpController extends MealTrackerServiceMcpController {
  constructor(params) {
    super("getMealLog", "getmeallog", params);
    this.dataName = "mealLog";
    this.crudType = "get";
  }

  createApiManager() {
    return new GetMealLogManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        mealLog: z
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
      mealLogId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to query the required data object.",
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
    name: "getMealLog",
    description:
      "Retrieves a single meal log by ID, scoped to the authenticated user." +
      requiredRolesMarker,
    requiredRoles,
    parameters: GetMealLogMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new GetMealLogMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return GetMealLogMcpController.getOutputSchema().parse(result);
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
