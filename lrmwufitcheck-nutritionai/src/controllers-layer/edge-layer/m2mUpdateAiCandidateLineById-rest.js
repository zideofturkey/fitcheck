const {
  NotAuthenticatedError,
  ErrorCodes,
  validateM2MToken,
} = require("common");
const { m2mUpdateAiCandidateLineById } = require("edgeFunctions");
const createServiceController = require("restLayer/create-service-controller");

const m2mUpdateAiCandidateLineByIdRestController = async (req, res, next) => {
  try {
    req.loginRequired = false;
    const statusCode = 200;

    const restController = createServiceController(
      "m2mUpdateAiCandidateLineById",
      "m2mUpdateAiCandidateLineById",
      req,
      res,
    );
    await restController.init();

    if (req.M2MToken) {
      const m2mPayload = await validateM2MToken(req.M2MToken);
      if (!m2mPayload) {
        throw new NotAuthenticatedError(
          "m2mUpdateAiCandidateLineByIdInvalidM2MToken",
          ErrorCodes.InvalidM2MToken,
        );
      }
      req.m2mPayload = m2mPayload;
    }

    const result = await m2mUpdateAiCandidateLineById(req);
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
      "Error running routeService for m2mUpdateAiCandidateLineById: ",
      err,
    );
    return next(err);
  }
};

module.exports = m2mUpdateAiCandidateLineByIdRestController;
