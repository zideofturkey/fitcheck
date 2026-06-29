const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const _ = require("lodash");

module.exports = {
  topic: "lrmwufitcheck-user-service-password-reset-by-email-start",
  handle: async (event) => {
    try {
      const mappedData = {
        types: ["email"],
        isStored: false,
        template: "passwordResetByEmail",
        metadata: {
          ...event,
          actionDeepLink: "&#39;https://www.mindbricks.com&#39;",
          actionText: "&#39;Visit Mindbricks&#39;",
        },
      };

      mappedData.to = _.get(event, "email");
      await notificationService.sendNotification(mappedData);
    } catch (error) {
      //**errorLog
      console.error(
        "lrmwufitcheck-user-service-password-reset-by-email-start ",
        error,
      );
    }
  },
};
