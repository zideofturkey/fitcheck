module.exports = {
  createSession: () => {
    const SessionManager = require("./fitcheck-session");
    return new SessionManager();
  },
};
