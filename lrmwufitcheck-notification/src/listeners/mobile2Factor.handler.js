const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const _ = require("lodash");

module.exports = {
  topic: "lrmwufitcheck-user-service-mobile-2FA-start",
  handle: async (event) => {
    try {
      const mappedData = {
        types: ["sms"],
        isStored: false,
        template: "mobile2Factor",
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
      console.error("lrmwufitcheck-user-service-mobile-2FA-start ", error);
    }
  },
};
