const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const _ = require("lodash");

module.exports = {
  topic: "lrmwufitcheck-user-service-password-reset-by-mobile-start",
  handle: async (event) => {
    try {
      const mappedData = {
        types: ["sms"],
        isStored: false,
        template: "passwordResetByMobile",
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
        "lrmwufitcheck-user-service-password-reset-by-mobile-start ",
        error,
      );
    }
  },
};
