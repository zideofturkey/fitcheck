const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const _ = require("lodash");

module.exports = {
  topic: "lrmwufitcheck-user-service-email-verification-start",
  handle: async (event) => {
    try {
      const mappedData = {
        types: ["email"],
        isStored: false,
        template: "emailVerification",
        metadata: {
          ...event,
          actionDeepLink: "&#39;&#39;",
          actionText: "&#39;&#39;",
        },
      };

      mappedData.to = _.get(event, "email");
      await notificationService.sendNotification(mappedData);
    } catch (error) {
      //**errorLog
      console.error(
        "lrmwufitcheck-user-service-email-verification-start ",
        error,
      );
    }
  },
};
