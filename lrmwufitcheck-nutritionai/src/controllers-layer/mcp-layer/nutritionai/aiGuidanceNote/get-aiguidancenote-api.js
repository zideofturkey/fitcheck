const { GetAiGuidanceNoteManager } = require("apiLayer");
const { z } = require("zod");

const NutritionAiServiceMcpController = require("../../NutritionAiServiceMcpController");

class GetAiGuidanceNoteMcpController extends NutritionAiServiceMcpController {
  constructor(params) {
    super("getAiGuidanceNote", "getaiguidancenote", params);
    this.dataName = "aiGuidanceNote";
    this.crudType = "get";
  }

  createApiManager() {
    return new GetAiGuidanceNoteManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        aiGuidanceNote: z
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
      aiGuidanceNoteId: z
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
    name: "getAiGuidanceNote",
    description:
      "Retrieves a single AI guidance note by ID, scoped to the authenticated user." +
      requiredRolesMarker,
    requiredRoles,
    parameters: GetAiGuidanceNoteMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      console.log("Mcp Request Received", mcpParams);
      mcpParams.headers = headers;
      const controller = new GetAiGuidanceNoteMcpController(mcpParams);
      try {
        const result = await controller.processRequest();
        //return GetAiGuidanceNoteMcpController.getOutputSchema().parse(result);
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
