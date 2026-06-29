const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const _ = require("lodash");

module.exports = {
  topic: "lrmwufitcheck-user-service-mobile-verification-start",
  handle: async (event) => {
    try {
      const mappedData = {
        types: ["sms"],
        isStored: false,
        template: "mobileVerification",
        metadata: {
          ...event,
          actionDeepLink: "&#39;&#39;",
          actionText: "&#39;&#39;",
        },
      };

      mappedData.to = _.get(event, "mobile");
      await notificationService.sendNotification(mappedData);
    } catch (error) {
      //**errorLog
      console.error(
        "lrmwufitcheck-user-service-mobile-verification-start ",
        error,
      );
    }
  },
};
