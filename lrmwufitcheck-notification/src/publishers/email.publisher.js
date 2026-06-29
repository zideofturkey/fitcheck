const kafkaPublish = require("../utils/publisher");

const sendEmailNotification = async (notification) => {
  try {
    console.log("sending email notification", notification);
    await kafkaPublish(
      `lrmwufitcheck-notification-service-notification-email`,
      notification,
    );
  } catch (error) {
    //**errorLog
    console.error("Error publishing email notification", error);
  }
};
module.exports = sendEmailNotification;
