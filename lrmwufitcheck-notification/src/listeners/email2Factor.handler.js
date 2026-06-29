const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const _ = require("lodash");

module.exports = {
  topic: "lrmwufitcheck-user-service-email-2FA-start",
  handle: async (event) => {
    try {
      const mappedData = {
        types: ["email"],
        isStored: false,
        template: "email2Factor",
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
      console.error("lrmwufitcheck-user-service-email-2FA-start ", error);
    }
  },
};
