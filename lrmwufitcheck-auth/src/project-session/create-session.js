module.exports = {
  createSession: () => {
    const SessionManager = require("./fitcheck-login-session");
    return new SessionManager();
  },
};
