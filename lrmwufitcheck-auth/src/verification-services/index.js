const express = require("express");
const router = express.Router();

const {
  startPasswordResetByEmail,
  completePasswordResetByEmail,
} = require("./password-reset-by-email");
router.post("/password-reset-by-email/start", startPasswordResetByEmail);
router.post("/password-reset-by-email/complete", completePasswordResetByEmail);

const {
  startEmail2Factor,
  completeEmail2Factor,
} = require("./email-2-factor-verification");
router.post("/email-2factor-verification/start", startEmail2Factor);
router.post("/email-2factor-verification/complete", completeEmail2Factor);

const {
  startEmailVerification,
  completeEmailVerification,
} = require("./email-verification");
router.post("/email-verification/start", startEmailVerification);
router.post("/email-verification/complete", completeEmailVerification);

module.exports = router;
