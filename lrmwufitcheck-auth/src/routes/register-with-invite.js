const express = require("express");
const { hashString, newUUID } = require("common");
const { createUser } = require("dbLayer");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/v1/registeruser", async (req, res) => {
  try {
    const { inviteCode, fullname, email, password } = req.body || {};

    if (!inviteCode) {
      return res
        .status(400)
        .json({ status: "ERR", message: "errMsg_inviteCodeisRequired" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ status: "ERR", message: "errMsg_emailisRequired" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ status: "ERR", message: "errMsg_passwordisRequired" });
    }
    if (!fullname) {
      return res
        .status(400)
        .json({ status: "ERR", message: "errMsg_fullnameisRequired" });
    }
    if (!EMAIL_RE.test(email)) {
      return res
        .status(400)
        .json({ status: "ERR", message: "InvalidEmailFormat" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ status: "ERR", message: "errMsg_PasswordTooShort" });
    }

    const invitationcenterUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!invitationcenterUrl) {
      return res.status(500).json({
        status: "ERR",
        message: "INVITATIONCENTER_SERVICE_URL is not configured",
      });
    }

    // Step 1: validate + reserve the invite. This is the invitationcenter
    // service's own combined validate-and-consume-one-use operation (it
    // increments usageCount and transitions inviteState), so a successful
    // response here means the slot is genuinely spent - the user record
    // must be created right after, not re-validated later.
    let validateResp;
    try {
      validateResp = await fetch(
        `${invitationcenterUrl.replace(/\/$/, "")}/v1/invite-links/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode }),
        },
      );
    } catch (err) {
      return res.status(502).json({
        status: "ERR",
        message: "errMsg_InvitationServiceUnavailable",
      });
    }

    const validateBody = await validateResp.json().catch(() => null);
    if (!validateResp.ok || !validateBody?.inviteLink) {
      return res.status(validateResp.status === 404 ? 404 : 400).json({
        status: "ERR",
        message: validateBody?.message || "errMsg_InviteCodeInvalid",
      });
    }

    const inviteLink = validateBody.inviteLink;

    if (
      inviteLink.invitedEmail &&
      inviteLink.invitedEmail.toLowerCase() !== email.toLowerCase()
    ) {
      return res.status(403).json({
        status: "ERR",
        message: "errMsg_EmailDoesNotMatchInvite",
      });
    }

    // Step 2: create the user, mirroring CreateUserManager's dataClause
    // (main/user/create-user-api.js) so self-registered accounts look
    // identical to admin-created ones.
    let newUser;
    try {
      newUser = await createUser({
        id: newUUID(false),
        email,
        password: hashString(password),
        fullname,
        avatar: null,
        roleId: "user",
        emailVerified: false,
        isActive: true,
        _archivedAt: null,
      });
    } catch (err) {
      return res
        .status(err.status || 400)
        .json({ status: "ERR", message: err.message });
    }

    // Step 3: bind the invite to the newly created user. Best-effort - the
    // invite was already consumed in step 1 (inviteState + usageCount), so
    // a failure here can't let someone reuse the code; it just means
    // inviteLink.registeredUserId stays unset (an admin can reconcile).
    // Note: this endpoint requires login (M2MAllowed: true on invitationcenter's
    // side), but no service-to-service (M2M) trust is configured between
    // auth and invitationcenter in this environment (would need a real JWKS
    // endpoint + SERVICE_SECRET_KEY), so this call is expected to 401 for now.
    try {
      const consumeResp = await fetch(
        `${invitationcenterUrl.replace(/\/$/, "")}/v1/invite-links/${inviteLink.id}/consume`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registeredUserId: newUser.id }),
        },
      );
      if (!consumeResp.ok) {
        const body = await consumeResp.json().catch(() => null);
        console.warn(
          "register-with-invite: consume call rejected:",
          consumeResp.status,
          body?.message,
        );
      }
    } catch (err) {
      console.warn(
        "register-with-invite: failed to mark invite as consumed:",
        err.message,
      );
    }

    return res.status(201).json({
      status: "OK",
      user: {
        id: newUser.id,
        email: newUser.email,
        fullname: newUser.fullname,
      },
      emailVerificationNeeded: true,
    });
  } catch (err) {
    console.error("register-with-invite error:", err);
    return res
      .status(err.status || 500)
      .json({ status: "ERR", message: err.message || "Internal error" });
  }
});

module.exports = router;
