const { _fetchListNutritionDayManager } = require("apiLayer");
const { z } = require("zod");

const MealTrackerServiceMcpController = require("../../MealTrackerServiceMcpController");

class _fetchListNutritionDayMcpController extends MealTrackerServiceMcpController {
  constructor(params) {
    super("_fetchListNutritionDay", "_fetchlistnutritionday", params);
    this.dataName = "nutritionDays";
    this.crudType = "list";
  }

  createApiManager() {
    return new _fetchListNutritionDayManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        nutritionDays: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z.string().uuid().describe(""),
            summaryDate: z.string().describe(""),
            consumedCalories: z.number().describe(""),
            consumedProtein: z.number().describe(""),
            consumedCarbohydrates: z.number().describe(""),
            consumedFat: z.number().describe(""),
            consumedSugar: z.number().describe(""),
            consumedFiber: z.number().describe(""),
            targetCalories: z.number().describe(""),
            targetProtein: z.number().describe(""),
            targetCarbohydrates: z.number().describe(""),
            targetFat: z.number().describe(""),
            targetSugar: z.number().describe(""),
            targetFiber: z.number().describe(""),
            exceededMetrics: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(""),
            mealCount: z.number().int().describe(""),
          })
          .describe(
            "A daily rollup record per user storing consumed totals for all six macros alongside the target values active on that day, plus exceeded metric flags and meal count. Created/updated whenever meals are logged or edited.",
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
      summaryDate: z.string().datetime().optional().describe(""),
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
    name: "_fetchListNutritionDay",
    description:
      "System API to fetch list of nutritionDay records for frontend application. Auto-generated, not visible in design." +
      requiredRolesMarker,
    requiredRoles,
    parameters: _fetchListNutritionDayMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new _fetchListNutritionDayMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return _fetchListNutritionDayMcpController.getOutputSchema().parse(result);
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
