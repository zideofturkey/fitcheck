const kafkaPublish = require("../utils/publisher");

const sendPushNotification = async (notification) => {
  try {
    console.log("sending push notification", notification);
    await kafkaPublish(
      `lrmwufitcheck-notification-service-notification-push`,
      notification,
    );
  } catch (error) {
    //**errorLog
    console.error("Error publishing push notification", error);
  }
};
module.exports = sendPushNotification;
