const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const { db } = require("../models");
const { notification: Notification, deviceToken: DeviceToken } = db;
const { pagination, loadTemplate } = require("../utils");

const {
  sendSmsNotification,
  sendEmailNotification,
  sendPushNotification,
} = require("../publishers");

// If the environment variable STORED_NOTICE is set to true, then the application will use the database to store the notifications.
const isStored = process.env.STORED_NOTICE === "true";

/**
 * Get notifications by user id
 * @param {*} userId
 * @param {*} sortBy
 * @param {*} page
 * @param {*} limit
 */
const getNotifications = async (userId, sortBy = "createdAt", page, limit) => {
  if (!isStored) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notifications not found");
  }

  return await pagination(
    Notification,
    { userId },
    [],
    sortBy,
    "DESC",
    page,
    limit,
  );
};

/**
 * Send notification
 * @param {*} notificationBody
 */
const sendNotification = async (notificationBody) => {
  for (const type of notificationBody.types) {
    let content = null;
    if (notificationBody.template != "NONE") {
      content = await loadTemplate(
        type,
        notificationBody.template,
        notificationBody.metadata,
      );
    }

    switch (type) {
      case "sms":
        await sendSmsNotification({
          to: notificationBody.to,
          message: content || notificationBody.body,
        });
        break;
      case "email":
        await sendEmailNotification({
          to: notificationBody.to,
          subject: notificationBody.title || " ",
          body: notificationBody.body || " ",
          html: content,
        });
        break;
      case "push":
        const deviceTokens = await DeviceToken.findAll({
          where: { userId: notificationBody.userId },
        });

        for (const deviceToken of deviceTokens) {
          await sendPushNotification({
            to: deviceToken.notificationToken,
            title: notificationBody.title,
            body: content || notificationBody.body,
            metadata: notificationBody.metadata,
          });
        }
        break;
      default:
        break;
    }
  }

  if (isStored && notificationBody.isStored) {
    await Notification.create(notificationBody);
  }
};

/**
 * Mark notifications as seen
 * @param {*} userId
 * @param {*} notificationIds
 */
const seenNotifications = async (userId, notificationIds) => {
  if (!isStored) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notifications not found");
  }

  return await Notification.update(
    { isSeen: true },
    { where: { userId, id: notificationIds } },
  );
};

/**
 * Delete a single notification (account-scoped - userId in the where
 * clause prevents deleting another user's notification by guessing an id).
 * @param {*} userId
 * @param {*} notificationId
 */
const deleteNotification = async (userId, notificationId) => {
  if (!isStored) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notifications not found");
  }

  const deletedCount = await Notification.destroy({
    where: { userId, id: notificationId },
  });
  if (!deletedCount) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }
};

module.exports = {
  getNotifications,
  sendNotification,
  seenNotifications,
  deleteNotification,
};
