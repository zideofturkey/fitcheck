// Lightweight route: lets an external, non-logged-in caller (the
// notify-update.yml GitHub Actions workflow, via the current Cloudflare
// Tunnel URL) trigger an in-app "announcement" notification for every real
// user, alongside the email it already sends on every push to main.
//
// Auth is a static shared secret (x-broadcast-key header vs
// BROADCAST_NOTIFY_KEY env var) rather than a JWT, since the caller has no
// user session - this endpoint is the only thing CI ever talks to directly.
//
// Internally it logs in as a dedicated permanent service account
// (broadcast.service@fitcheck.local, created once via direct SQL, never
// exposed to CI) to get a real bearer token, uses it to list all users from
// the auth service, then calls the notification service's existing
// POST /notifications once per user (same shape lib/notify-user.js already
// uses) - no new auth plumbing anywhere else.
//
// Best-effort like notifyUser(): failures are logged and swallowed so a
// broken tunnel/offline PC never blocks the actual feature (this endpoint
// itself only runs when the PC+tunnel are up, since GitHub Actions can only
// reach it through the tunnel URL).
const express = require("express");

const router = express.Router();

async function getServiceToken() {
  const authUrl = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
  const res = await fetch(`${authUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.BROADCAST_SERVICE_EMAIL,
      password: process.env.BROADCAST_SERVICE_PASSWORD,
    }),
  });
  if (!res.ok) {
    throw new Error(`auth login failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const data = await res.json();
  const token = data.accessToken || data.token;
  if (!token) throw new Error("auth login response had no accessToken");
  return token;
}

async function listAllUserIds(token) {
  const authUrl = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
  const res = await fetch(`${authUrl}/v1/users?limit=1000`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`listUsers failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const data = await res.json();
  const users = data.users || data.items || data.data || [];
  return users
    .filter((u) => u.email !== process.env.BROADCAST_SERVICE_EMAIL)
    .map((u) => u.id)
    .filter(Boolean);
}

async function createNotification(token, userId, title, body) {
  const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3003";
  const res = await fetch(`${notificationUrl}/notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      types: [],
      template: "NONE",
      title,
      body,
      isStored: true,
    }),
  });
  return res.ok;
}

router.post("/v1/system/broadcast-notify", async (req, res) => {
  const expectedKey = process.env.BROADCAST_NOTIFY_KEY;
  if (!expectedKey) {
    return res.status(503).json({ error: "broadcast-notify not configured" });
  }
  if (req.headers["x-broadcast-key"] !== expectedKey) {
    return res.status(401).json({ error: "invalid broadcast key" });
  }

  const { title, body } = req.body || {};
  if (!title) return res.status(400).json({ error: "title is required" });

  try {
    const token = await getServiceToken();
    const userIds = await listAllUserIds(token);

    let notified = 0;
    for (const userId of userIds) {
      try {
        const ok = await createNotification(token, userId, title, body || "");
        if (ok) notified++;
      } catch (err) {
        console.log("broadcast-notify: per-user notification failed -", err.message);
      }
    }

    res.json({ totalUsers: userIds.length, notified });
  } catch (err) {
    console.log("broadcast-notify: failed -", err.message);
    res.status(502).json({ error: "broadcast failed", message: err.message });
  }
});

module.exports = router;
