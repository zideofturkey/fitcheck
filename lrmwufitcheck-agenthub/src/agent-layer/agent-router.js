const express = require("express");
const agentRouter = express.Router();
const { raiseAgentResultEvent } = require("./agent-event-raiser");
const { hexaLogger } = require("../common/hexa-logger");

function truncateForLog(value, maxLen = 2048) {
  if (value == null) return null;
  const str = typeof value === "string" ? value : JSON.stringify(value);
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}
const createServiceController = require("../controllers-layer/rest-layer/create-service-controller");

async function resolveAgentSession(req, res) {
  if (req.session) return;
  try {
    const restController = createServiceController("agent", "agent", req, res);
    await restController.init();
  } catch (_) {
    req.session = null;
  }
}

// --- NutritionGuidanceAgent Agent ---

agentRouter.post("/agents/nutritionGuidanceAgent", async (req, res, next) => {
  const _startTime = Date.now();
  try {
    await resolveAgentSession(req, res);
    if (!req.session?.userId)
      return res.status(401).json({ error: "Authentication required" });
    const runtime = req.app.agentRuntimes?.["nutritionGuidanceAgent"];
    if (!runtime)
      return res.status(500).json({ error: "Agent not initialized" });
    const result = await runtime.execute(req, null);
    const _durationMs = Date.now() - _startTime;
    raiseAgentResultEvent("nutritionGuidanceAgent", result, {
      source: "rest",
      session: req.session,
    });
    hexaLogger.insertInfo(
      "AgentExecution",
      {
        agentName: "nutritionGuidanceAgent",
        source: "rest",
        status: "success",
        serviceName: "agentHub",
      },
      "agent-router.nutritionGuidanceAgent",
      {
        durationMs: _durationMs,
        toolCalls: result?._metrics?.toolCalls || 0,
        tokenUsage: result?._metrics?.tokenUsage || null,
        input: truncateForLog(req.body),
        output: truncateForLog(result),
      },
    );
    res.json({ success: true, data: result });
  } catch (err) {
    const _durationMs = Date.now() - _startTime;
    hexaLogger.insertError(
      "AgentExecution",
      {
        agentName: "nutritionGuidanceAgent",
        source: "rest",
        status: "error",
        serviceName: "agentHub",
      },
      "agent-router.nutritionGuidanceAgent",
      {
        durationMs: _durationMs,
        input: truncateForLog(req.body),
        error: err.message,
      },
    );
    next(err);
  }
});

agentRouter.post(
  "/agents/nutritionGuidanceAgent/stream",
  async (req, res, next) => {
    const _startTime = Date.now();
    try {
      await resolveAgentSession(req, res);
      if (!req.session?.userId)
        return res.status(401).json({ error: "Authentication required" });
      const runtime = req.app.agentRuntimes?.["nutritionGuidanceAgent"];
      if (!runtime)
        return res.status(500).json({ error: "Agent not initialized" });

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      const sseController = {
        sendEvent(event, data) {
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        },
        end() {
          res.write("event: complete\ndata: {}\n\n");
          res.end();
        },
      };

      req.on("close", () => {});

      const result = await runtime.execute(req, sseController);
      const _durationMs = Date.now() - _startTime;
      raiseAgentResultEvent("nutritionGuidanceAgent", result, {
        source: "sse",
        session: req.session,
      });
      hexaLogger.insertInfo(
        "AgentExecution",
        {
          agentName: "nutritionGuidanceAgent",
          source: "sse",
          status: "success",
          serviceName: "agentHub",
        },
        "agent-router.nutritionGuidanceAgent",
        {
          durationMs: _durationMs,
          toolCalls: result?._metrics?.toolCalls || 0,
          tokenUsage: result?._metrics?.tokenUsage || null,
          input: truncateForLog(req.body),
          output: truncateForLog(result),
        },
      );
    } catch (err) {
      const _durationMs = Date.now() - _startTime;
      hexaLogger.insertError(
        "AgentExecution",
        {
          agentName: "nutritionGuidanceAgent",
          source: "sse",
          status: "error",
          serviceName: "agentHub",
        },
        "agent-router.nutritionGuidanceAgent",
        {
          durationMs: _durationMs,
          input: truncateForLog(req.body),
          error: err.message,
        },
      );
      if (!res.headersSent) {
        next(err);
      } else {
        res.write(
          `event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`,
        );
        res.end();
      }
    }
  },
);

// --- MealParsingAgent Agent ---

agentRouter.post("/agents/mealParsingAgent", async (req, res, next) => {
  const _startTime = Date.now();
  try {
    await resolveAgentSession(req, res);
    if (!req.session?.userId)
      return res.status(401).json({ error: "Authentication required" });
    const runtime = req.app.agentRuntimes?.["mealParsingAgent"];
    if (!runtime)
      return res.status(500).json({ error: "Agent not initialized" });
    const result = await runtime.execute(req, null);
    const _durationMs = Date.now() - _startTime;
    raiseAgentResultEvent("mealParsingAgent", result, {
      source: "rest",
      session: req.session,
    });
    hexaLogger.insertInfo(
      "AgentExecution",
      {
        agentName: "mealParsingAgent",
        source: "rest",
        status: "success",
        serviceName: "agentHub",
      },
      "agent-router.mealParsingAgent",
      {
        durationMs: _durationMs,
        toolCalls: result?._metrics?.toolCalls || 0,
        tokenUsage: result?._metrics?.tokenUsage || null,
        input: truncateForLog(req.body),
        output: truncateForLog(result),
      },
    );
    res.json({ success: true, data: result });
  } catch (err) {
    const _durationMs = Date.now() - _startTime;
    hexaLogger.insertError(
      "AgentExecution",
      {
        agentName: "mealParsingAgent",
        source: "rest",
        status: "error",
        serviceName: "agentHub",
      },
      "agent-router.mealParsingAgent",
      {
        durationMs: _durationMs,
        input: truncateForLog(req.body),
        error: err.message,
      },
    );
    next(err);
  }
});

agentRouter.post("/agents/mealParsingAgent/stream", async (req, res, next) => {
  const _startTime = Date.now();
  try {
    await resolveAgentSession(req, res);
    if (!req.session?.userId)
      return res.status(401).json({ error: "Authentication required" });
    const runtime = req.app.agentRuntimes?.["mealParsingAgent"];
    if (!runtime)
      return res.status(500).json({ error: "Agent not initialized" });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const sseController = {
      sendEvent(event, data) {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      },
      end() {
        res.write("event: complete\ndata: {}\n\n");
        res.end();
      },
    };

    req.on("close", () => {});

    const result = await runtime.execute(req, sseController);
    const _durationMs = Date.now() - _startTime;
    raiseAgentResultEvent("mealParsingAgent", result, {
      source: "sse",
      session: req.session,
    });
    hexaLogger.insertInfo(
      "AgentExecution",
      {
        agentName: "mealParsingAgent",
        source: "sse",
        status: "success",
        serviceName: "agentHub",
      },
      "agent-router.mealParsingAgent",
      {
        durationMs: _durationMs,
        toolCalls: result?._metrics?.toolCalls || 0,
        tokenUsage: result?._metrics?.tokenUsage || null,
        input: truncateForLog(req.body),
        output: truncateForLog(result),
      },
    );
  } catch (err) {
    const _durationMs = Date.now() - _startTime;
    hexaLogger.insertError(
      "AgentExecution",
      {
        agentName: "mealParsingAgent",
        source: "sse",
        status: "error",
        serviceName: "agentHub",
      },
      "agent-router.mealParsingAgent",
      {
        durationMs: _durationMs,
        input: truncateForLog(req.body),
        error: err.message,
      },
    );
    if (!res.headersSent) {
      next(err);
    } else {
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`,
      );
      res.end();
    }
  }
});

module.exports = agentRouter;
