// Best-effort in-app notification via lrmwufitcheck-notification's
// POST /notifications (see lrmwufitcheck-notification/src/routes/notification.route.js).
// That endpoint's auth only checks for *some* valid bearer token - it reads
// the target user from body.userId, not from the token - so we can forward
// the calling admin/user's own token and address any recipient by id.
//
// `types` is left empty (no sms/email/push dispatch) - the notification
// service's email/sms/push provider plumbing already exists and works
// (see providers/email/*.provider.js, EMAIL_PROVIDER env toggle), it's just
// not exercised by this feature yet. isStored:true is what actually creates
// the in-app notification row.
//
// Never let a notification failure break the caller's main flow - the
// promote/approve/reject action has already succeeded by the time this
// runs, so we only log and swallow.
async function notifyUser(req, { userId, title, body }) {
  try {
    const token =
      req.sessionToken ||
      (req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token || !userId) return;

    const notificationUrl =
      process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3003";

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

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.log("notifyUser: notification service responded", res.status, text);
    }
  } catch (err) {
    console.log("notifyUser: failed to send notification -", err.message);
  }
}

module.exports = { notifyUser };
