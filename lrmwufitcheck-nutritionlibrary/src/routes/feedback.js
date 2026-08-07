// Lightweight route: public site feedback form (footer "Geri Bildirim").
// Plain Sequelize model access + plain Express routing, no Manager/MCP/gRPC
// layer - mirrors the pattern established in src/routes/suggestions.js.
const express = require("express");
const { newUUID } = require("common");
const { createSessionManager } = require("sessionLayer");
const requireAuth = require("./middleware/require-auth");
const requireAdmin = require("./middleware/require-admin");

const router = express.Router();

const SUBJECTS = ["bug", "featureRequest", "general", "other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getModels() {
  const { Feedback } = require("models");
  return { Feedback };
}

// Submission is public, but if the request carries a valid session token we
// still record which user sent it - purely informational, never required.
async function tryAttachUserId(req) {
  try {
    const authHeader = req.headers?.authorization || "";
    const token = req.query?.access_token || authHeader.replace("Bearer ", "");
    if (!token) return null;
    req.sessionToken = token;
    const sessionManager = createSessionManager(req);
    await sessionManager.verifySessionToken(req);
    return req.session?.userId ?? null;
  } catch {
    return null;
  }
}

// POST /v1/feedback - public feedback form submission
async function createFeedback(req, res, next) {
  try {
    const { fullName, email, subject, message } = req.body || {};

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: "fullName is required" });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    if (!SUBJECTS.includes(subject)) {
      return res
        .status(400)
        .json({ error: `subject must be one of: ${SUBJECTS.join(", ")}` });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const { Feedback } = getModels();
    const userId = await tryAttachUserId(req);

    const feedback = await Feedback.create({
      id: newUUID(false),
      userId,
      fullName: fullName.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
      status: "new",
    });

    res.status(201).json({ status: "OK", feedback: feedback.get({ plain: true }) });
  } catch (err) {
    next(err);
  }
}

// GET /v1/feedback - admin only, newest first
async function listFeedback(req, res, next) {
  try {
    const { Feedback } = getModels();
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const feedback = await Feedback.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: "OK",
      count: feedback.length,
      feedback: feedback.map((f) => f.get({ plain: true })),
    });
  } catch (err) {
    next(err);
  }
}

router.post("/v1/feedback", createFeedback);
router.get("/v1/feedback", requireAuth, requireAdmin, listFeedback);

module.exports = router;
