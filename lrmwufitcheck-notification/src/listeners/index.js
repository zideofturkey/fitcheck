const kafka = require("../utils/kafka.client.js");
const { TopicRouter } = require("./topic.router");

const SERVICE_CODENAME = process.env.SERVICE_CODENAME;
const startListener = async () => {
  const router = new TopicRouter();
  router.loadHandlers();

  const topics = router.getTopics();

  const consumer = kafka.consumer({
    groupId: `${SERVICE_CODENAME}-notification-bridge`,
  });

  await consumer.connect();

  await Promise.all(
    topics.map((t) => consumer.subscribe({ topic: t, fromBeginning: true })),
  );

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const handlers = router.getHandlers(topic);

      if (handlers.length === 0) {
        console.log(`⚠ No handlers for topic: ${topic}`);
        return;
      }

      const payload = JSON.parse(message.value.toString());

      await Promise.all(
        handlers.map((fn) =>
          fn(payload).catch((err) => {
            console.error(`❌ Error running handler for topic ${topic}:`, err);
          }),
        ),
      );
    },
  });

  console.log("🔥 Kafka consumer started (parallel handlers enabled)");
};

module.exports = startListener;
