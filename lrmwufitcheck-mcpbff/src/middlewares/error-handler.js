/**
 * Error Handler Middleware
 */

const logger = require("../common/logger");
const ApiError = require("../common/ApiError");

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || "Internal server error";
  }

  logger.error("Error:", {
    statusCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    result: "ERR",
    status: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
