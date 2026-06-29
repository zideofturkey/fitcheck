const { loadEmailProvider } = require("../../utils/provider.loader.js");

// Load the email provider based on the environment variable
const SERVICE_CODENAME = process.env.SERVICE_CODENAME;
const provider = loadEmailProvider();

module.exports = {
  topic: `${SERVICE_CODENAME}-notification-email`,
  handle: async (event) => {
    try {
      await provider.send(event);
    } catch (error) {
      //**errorLog
      console.error(`${SERVICE_CODENAME}-notification-email: `, error);
    }
  },
};
