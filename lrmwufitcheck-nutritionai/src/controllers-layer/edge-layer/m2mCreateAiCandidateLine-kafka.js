const {
  HttpServerError,
  HttpError,
  NotAuthenticatedError,
  ErrorCodes,
  validateM2MToken,
} = require("common");
const { m2mCreateAiCandidateLine } = require("edgeFunctions");

const m2mCreateAiCandidateLineHandler = async (
  topic,
  session,
  message,
  callbackData,
) => {
  console.log("Received data for edge controller:", { topic, message });
  try {
    // Extract M2M token from Kafka message payload
    const m2mToken = message?.M2MToken || message?.m2mToken || null;
    if (m2mToken) {
      message.M2MToken = m2mToken;
    }

    // Authentication and authorization logic

    // Strategy 4: If M2MAllowed is false and loginRequired is false, no check needed

    // Strategy 1: If M2MAllowed and M2MToken exists, validate M2M token

    if (m2mToken) {
      const m2mPayload = await validateM2MToken(m2mToken);
      if (!m2mPayload) {
        throw new NotAuthenticatedError(
          "m2mCreateAiCandidateLineInvalidM2MToken",
          ErrorCodes.InvalidM2MToken,
        );
      }
      // M2M token is valid, set M2M context
      message.m2mPayload = m2mPayload;
    } else {
      // Strategy 2: If M2MAllowed but no M2MToken

      // Strategy 2.1: If loginRequired is false, M2M token is required
      throw new NotAuthenticatedError(
        "m2mCreateAiCandidateLineRequiresM2MToken",
        ErrorCodes.M2MTokenRequired,
      );
    }

    // Strategy 3: If loginRequired is true, check valid login

    message.session = session;
    const result = await m2mCreateAiCandidateLine(message);
    // log result
  } catch (err) {
    console.error(
      "Error running routeService for m2mCreateAiCandidateLine: ",
      err,
    );
    // log error
  }
};

module.exports = m2mCreateAiCandidateLineHandler;
