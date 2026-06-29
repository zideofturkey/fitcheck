const kafka = require("./kafka.client.js");

/**
 * Check if topic exists and create if not exists
 * @param {string} topic - The topic to check and create
 * @returns {Promise<void>}
 */
const checkAndCreateTopic = async (topic) => {
  try {
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes(topic)) {
      await admin.createTopics({ topics: [{ topic }] });
      console.log(`Topic ${topic} created successfully`);
    } else {
      console.log(`Topic ${topic} already exists`);
    }
    await admin.disconnect();
  } catch (error) {
    console.error("Error checking and creating topic", error);
    throw error;
  }
};

module.exports = { checkAndCreateTopic };
