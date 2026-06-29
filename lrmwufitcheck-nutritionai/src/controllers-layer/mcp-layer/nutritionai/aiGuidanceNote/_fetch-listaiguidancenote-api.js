const { _fetchListAiGuidanceNoteManager } = require("apiLayer");
const { z } = require("zod");

const NutritionAiServiceMcpController = require("../../NutritionAiServiceMcpController");

class _fetchListAiGuidanceNoteMcpController extends NutritionAiServiceMcpController {
  constructor(params) {
    super("_fetchListAiGuidanceNote", "_fetchlistaiguidancenote", params);
    this.dataName = "aiGuidanceNotes";
    this.crudType = "list";
  }

  createApiManager() {
    return new _fetchListAiGuidanceNoteManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        aiGuidanceNotes: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z.string().uuid().describe(""),
            aiSessionId: z.string().uuid().describe(""),
            questionType: z.string().max(255).describe(""),
            contextRange: z.string().max(255).describe(""),
            answerSummary: z.string().describe(""),
            rationaleText: z.string().optional().nullable().describe(""),
            referencedMetricKeys: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(""),
            cautionText: z.string().optional().nullable().describe(""),
          })
          .describe(
            "Persists the structured outcome of a nutrition guidance Q&A interaction — stores question classification, time range context, the summarized answer, rationale, referenced metrics, and any caution text, linked to the parent aiSession.",
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

      questionType: z.string().max(255).optional().describe(""),

      contextRange: z.string().max(255).optional().describe(""),
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
    name: "_fetchListAiGuidanceNote",
    description:
      "System API to fetch list of aiGuidanceNote records for frontend application. Auto-generated, not visible in design." +
      requiredRolesMarker,
    requiredRoles,
    parameters: _fetchListAiGuidanceNoteMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new _fetchListAiGuidanceNoteMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return _fetchListAiGuidanceNoteMcpController.getOutputSchema().parse(result);
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
