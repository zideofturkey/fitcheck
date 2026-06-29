const { DeletePresetLineManager } = require("apiLayer");
const { z } = require("zod");

const NutritionLibraryServiceMcpController = require("../../NutritionLibraryServiceMcpController");

class DeletePresetLineMcpController extends NutritionLibraryServiceMcpController {
  constructor(params) {
    super("deletePresetLine", "deletepresetline", params);
    this.dataName = "presetLine";
    this.crudType = "delete";
  }

  createApiManager() {
    return new DeletePresetLineManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        presetLine: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            presetMealId: z.string().uuid().describe(""),
            foodItemId: z.string().uuid().describe(""),
            lineFoodName: z.string().max(255).describe(""),
            gramAmount: z.number().describe(""),
            lineCalories: z.number().describe(""),
            lineProtein: z.number().describe(""),
            lineCarbohydrates: z.number().describe(""),
            lineFat: z.number().describe(""),
            lineSugar: z.number().describe(""),
            lineFiber: z.number().describe(""),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "A single food item entry within a preset meal template. Stores a gram amount and snapshot nutrition values calculated at line creation. Lines are created or deleted to modify a preset; individual lines are not edited (replace pattern).",
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
      presetLineId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be deleted",
        ),

      presetMealId: z
        .string()
        .max(255)
        .describe(
          "This parameter will be used to select the data object that want to be deleted",
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
    name: "deletePresetLine",
    description:
      "Remove a single line from a preset, then recalculate preset totals. Validates preset ownership." +
      requiredRolesMarker,
    requiredRoles,
    parameters: DeletePresetLineMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new DeletePresetLineMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return DeletePresetLineMcpController.getOutputSchema().parse(result);
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
