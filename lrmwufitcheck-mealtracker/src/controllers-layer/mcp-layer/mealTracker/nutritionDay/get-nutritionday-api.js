const { GetNutritionDayManager } = require("apiLayer");
const { z } = require("zod");

const MealTrackerServiceMcpController = require("../../MealTrackerServiceMcpController");

class GetNutritionDayMcpController extends MealTrackerServiceMcpController {
  constructor(params) {
    super("getNutritionDay", "getnutritionday", params);
    this.dataName = "nutritionDay";
    this.crudType = "get";
  }

  createApiManager() {
    return new GetNutritionDayManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        nutritionDay: z
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
      nutritionDayId: z
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
    name: "getNutritionDay",
    description:
      "Retrieves a single nutritionDay record by ID, scoped to the authenticated user." +
      requiredRolesMarker,
    requiredRoles,
    parameters: GetNutritionDayMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new GetNutritionDayMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return GetNutritionDayMcpController.getOutputSchema().parse(result);
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
