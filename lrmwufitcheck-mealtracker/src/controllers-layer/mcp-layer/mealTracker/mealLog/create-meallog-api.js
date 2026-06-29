const { CreateMealLogManager } = require("apiLayer");
const { z } = require("zod");

const MealTrackerServiceMcpController = require("../../MealTrackerServiceMcpController");

class CreateMealLogMcpController extends MealTrackerServiceMcpController {
  constructor(params) {
    super("createMealLog", "createmeallog", params);
    this.dataName = "mealLog";
    this.crudType = "create";
  }

  createApiManager() {
    return new CreateMealLogManager(this.request, "mcp");
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
      mealDate: z.string().datetime().describe("Date the meal was consumed"),

      mealTime: z.string().max(255).describe("Local time string e.g. 13:30"),

      slotName: z.string().max(255).describe("Fixed or custom meal slot name"),

      logSource: z
        .enum(["foodLibrary", "presetTemplate", "manualEntry", "aiAssistant"])
        .describe("Source of the meal log entry"),

      noteText: z.string().max(255).optional().describe("Optional user notes"),

      totalCalories: z.number().describe("Meal-level calorie total"),

      totalProtein: z.number().describe("Meal-level protein total"),

      totalCarbohydrates: z.number().describe("Meal-level carbohydrate total"),

      totalFat: z.number().describe("Meal-level fat total"),

      totalSugar: z.number().describe("Meal-level sugar total"),

      totalFiber: z.number().describe("Meal-level fiber total"),

      lines: z.array(
        z.object({}).describe("Array of meal line objects to create"),
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
    name: "createMealLog",
    description:
      "Creates a new meal log entry with all nutrition totals and then inserts individual meal line items via a loop action. After creation, upserts the daily nutrition snapshot." +
      requiredRolesMarker,
    requiredRoles,
    parameters: CreateMealLogMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new CreateMealLogMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return CreateMealLogMcpController.getOutputSchema().parse(result);
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
