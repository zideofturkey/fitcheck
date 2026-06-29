const {
  NotAuthenticatedError,
  ErrorCodes,
  validateM2MToken,
} = require("common");
const { m2mBulkCreateAiCandidateMeal } = require("edgeFunctions");
const createServiceController = require("restLayer/create-service-controller");

const m2mBulkCreateAiCandidateMealRestController = async (req, res, next) => {
  try {
    req.loginRequired = false;
    const statusCode = 201;

    const restController = createServiceController(
      "m2mBulkCreateAiCandidateMeal",
      "m2mBulkCreateAiCandidateMeal",
      req,
      res,
    );
    await restController.init();

    if (req.M2MToken) {
      const m2mPayload = await validateM2MToken(req.M2MToken);
      if (!m2mPayload) {
        throw new NotAuthenticatedError(
          "m2mBulkCreateAiCandidateMealInvalidM2MToken",
          ErrorCodes.InvalidM2MToken,
        );
      }
      req.m2mPayload = m2mPayload;
    }

    const result = await m2mBulkCreateAiCandidateMeal(req);
    result.statusCode = result.status ?? statusCode;
    if (result.headers) {
      for (const [headerName, headerValue] of Object.entries(result.headers)) {
        res.set(headerName, headerValue);
      }
    }
    res
      .status(result.statusCode)
      .send(result.content ?? result.message ?? result);
  } catch (err) {
    console.error(
      "Error running routeService for m2mBulkCreateAiCandidateMeal: ",
      err,
    );
    return next(err);
  }
};

module.exports = m2mBulkCreateAiCandidateMealRestController;
