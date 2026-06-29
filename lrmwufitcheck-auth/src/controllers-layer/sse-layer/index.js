const mainSseRouters = require("./main");

module.exports = {
  ...mainSseRouters,
  AuthServiceSseController: require("./AuthServiceSseController"),
};
