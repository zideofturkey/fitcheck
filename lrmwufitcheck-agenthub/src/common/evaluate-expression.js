const { hexaLogger } = require("./hexa-logger");

const _expressionCache = new Map();

function _getCompiledFunction(expression, paramNames) {
  const cacheKey = `${paramNames.join(",")}::${expression}`;
  let fn = _expressionCache.get(cacheKey);
  if (!fn) {
    fn = new Function(...paramNames, `return ${expression}`);
    _expressionCache.set(cacheKey, fn);
  }
  return fn;
}

function evaluateExpression(expression, context = {}, fallback = null) {
  if (!expression) return fallback;
  try {
    const paramNames = Object.keys(context);
    const paramValues = Object.values(context);
    const fn = _getCompiledFunction(expression, paramNames);
    return fn(...paramValues);
  } catch (err) {
    hexaLogger.insertError(
      "ExpressionEvalError",
      { expression, err: err.message },
      "evaluate-expression.js->evaluateExpression",
      err,
    );
    return fallback;
  }
}

function evaluateExpressionBool(expression, context = {}) {
  return !!evaluateExpression(expression, context, false);
}

function runMScript(executor, meta = {}) {
  const path = meta?.path || "unknown";
  const wrapError = (err) => {
    // Designer-emitted typed HTTP errors (4xx subclasses: BadRequestError,
    // ForbiddenError, NotFoundError, ConflictError, UnprocessableEntityError,
    // NotAuthenticatedError) propagate VERBATIM — they're intentional
    // business-validation rejections and their typed status + message must
    // reach the response. Wrapping them as MScriptRuntimeError would strip
    // the status and the outer try/catch (in generated action code) would
    // re-throw as 500, hiding a 403/400/etc. behind an Internal Server Error.
    //
    // Only unexpected exceptions (TypeError, ReferenceError, undefined-deref,
    // genuine crashes) get the diagnostic [MScript path] prefix and surface
    // as 500 — that's the operator's "something is broken in the script"
    // signal vs. "the script ran fine and rejected this caller" signal.
    if (
      err &&
      typeof err.status === "number" &&
      err.status >= 400 &&
      err.status < 500
    ) {
      return err;
    }
    if (err?.name === "MScriptRuntimeError") return err;
    const wrapped = new Error(`[MScript ${path}] ${err.message}`);
    wrapped.name = "MScriptRuntimeError";
    wrapped.cause = err;
    wrapped.mscript = { path };
    hexaLogger.insertError(
      "MScriptRuntimeError",
      { path, error: err.message },
      "evaluate-expression.js->runMScript",
      err,
    );
    return wrapped;
  };

  try {
    const result = executor();
    if (result && typeof result.then === "function") {
      return result.catch((err) => {
        throw wrapError(err);
      });
    }
    return result;
  } catch (err) {
    throw wrapError(err);
  }
}

module.exports = {
  evaluateExpression,
  evaluateExpressionBool,
  runMScript,
};
