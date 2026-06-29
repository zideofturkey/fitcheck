const {
  NotAuthenticatedError,
  ErrorCodes,
  validateM2MToken,
} = require("common");
const { m2mDeleteInviteAuditByQuery } = require("edgeFunctions");
const createServiceController = require("restLayer/create-service-controller");

const m2mDeleteInviteAuditByQueryRestController = async (req, res, next) => {
  try {
    req.loginRequired = false;
    const statusCode = 200;

    const restController = createServiceController(
      "m2mDeleteInviteAuditByQuery",
      "m2mDeleteInviteAuditByQuery",
      req,
      res,
    );
    await restController.init();

    if (req.M2MToken) {
      const m2mPayload = await validateM2MToken(req.M2MToken);
      if (!m2mPayload) {
        throw new NotAuthenticatedError(
          "m2mDeleteInviteAuditByQueryInvalidM2MToken",
          ErrorCodes.InvalidM2MToken,
        );
      }
      req.m2mPayload = m2mPayload;
    }

    const result = await m2mDeleteInviteAuditByQuery(req);
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
      "Error running routeService for m2mDeleteInviteAuditByQuery: ",
      err,
    );
    return next(err);
  }
};

module.exports = m2mDeleteInviteAuditByQueryRestController;
