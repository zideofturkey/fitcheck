const kafka = require("common/kafka.client.js");
const { TopicRouter } = require("./topic.router");

const SERVICE_CODENAME = process.env.SERVICE_CODENAME;
let kafkaConsumer = null;
let kafkaAdmin = null;

// Retry configuration for message handlers with exponential backoff
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

// Topic configuration for kafka topics
const TOPIC_CONFIG = {
  autoCreateTopics: process.env.KAFKA_AUTO_CREATE_TOPICS !== "false",
  numPartitions: parseInt(process.env.KAFKA_NUM_PARTITIONS) || 1,
  replicationFactor: parseInt(process.env.KAFKA_REPLICATION_FACTOR) || 1,
  subscriptionMaxRetries: parseInt(process.env.KAFKA_SUBSCRIPTION_RETRIES) || 5,
  subscriptionRetryDelayMs:
    parseInt(process.env.KAFKA_SUBSCRIPTION_RETRY_DELAY) || 5000,
};

// Consumer configuration for kafka consumer group
const CONSUMER_CONFIG = {
  sessionTimeout: parseInt(process.env.KAFKA_SESSION_TIMEOUT) || 30000,
  heartbeatInterval: parseInt(process.env.KAFKA_HEARTBEAT_INTERVAL) || 3000,
  autoOffsetReset: (
    process.env.KAFKA_AUTO_OFFSET_RESET || "earliest"
  ).toLowerCase(),
};

/**
 * Execute a handler with exponential backoff retry
 */
const executeWithRetry = async (handler, payload, topic, attempt = 1) => {
  try {
    await handler(payload);
    return true;
  } catch (error) {
    const isLastAttempt = attempt >= RETRY_CONFIG.maxRetries;

    if (isLastAttempt) {
      console.error(
        `❌ Handler failed after ${attempt} attempts for topic ${topic}:`,
        error.message,
      );
      console.error(
        `💀 Dead letter - Topic: ${topic}, Payload: ${JSON.stringify(payload).substring(0, 500)}`,
      );
      return false;
    }

    const delay = Math.min(
      RETRY_CONFIG.initialDelayMs *
        Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
      RETRY_CONFIG.maxDelayMs,
    );

    console.warn(
      `⚠️ Handler failed for topic ${topic}, attempt ${attempt}/${RETRY_CONFIG.maxRetries}. Retrying in ${delay}ms...`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return executeWithRetry(handler, payload, topic, attempt + 1);
  }
};

/**
 * Check which topics exist in Kafka
 * @param {string[]} topics - List of topic names to check
 * @returns {Promise<{existing: string[], missing: string[]}>}
 */
const checkTopicsExist = async (topics) => {
  try {
    const metadata = await kafkaAdmin.fetchTopicMetadata({ topics });
    const existingTopics = metadata.topics.map((t) => t.name);

    return {
      existing: topics.filter((t) => existingTopics.includes(t)),
      missing: topics.filter((t) => !existingTopics.includes(t)),
    };
  } catch (error) {
    // If we can't fetch metadata, assume all topics are missing
    console.warn(`⚠️ Could not fetch topic metadata: ${error.message}`);
    return { existing: [], missing: topics };
  }
};

/**
 * Create topics that don't exist
 * @param {string[]} topics - List of topic names to create
 * @returns {Promise<{created: string[], failed: string[]}>}
 */
const createMissingTopics = async (topics) => {
  const created = [];
  const failed = [];

  for (const topic of topics) {
    try {
      await kafkaAdmin.createTopics({
        waitForLeaders: true,
        topics: [
          {
            topic,
            numPartitions: TOPIC_CONFIG.numPartitions,
            replicationFactor: TOPIC_CONFIG.replicationFactor,
          },
        ],
      });
      created.push(topic);
      console.log(`✅ Created topic: ${topic}`);
    } catch (error) {
      // Topic might already exist (race condition) or creation failed
      if (error.message?.includes("already exists")) {
        created.push(topic);
        console.log(`ℹ️ Topic already exists: ${topic}`);
      } else {
        failed.push(topic);
        console.error(`❌ Failed to create topic ${topic}: ${error.message}`);
      }
    }
  }

  return { created, failed };
};

/**
 * Subscribe to a topic with retry logic
 * @param {string} topic - Topic name
 * @param {number} attempt - Current attempt number
 * @param {boolean} fromBeginning - If true, when no offset exists start from earliest (catch-up)
 * @returns {Promise<boolean>} - True if subscribed successfully
 */
const subscribeWithRetry = async (topic, attempt = 1, fromBeginning = true) => {
  try {
    await kafkaConsumer.subscribe({ topic, fromBeginning });
    return true;
  } catch (error) {
    const isLastAttempt = attempt >= TOPIC_CONFIG.subscriptionMaxRetries;

    if (isLastAttempt) {
      console.error(
        `❌ Failed to subscribe to topic ${topic} after ${attempt} attempts: ${error.message}`,
      );
      return false;
    }

    console.warn(
      `⚠️ Subscription to ${topic} failed (attempt ${attempt}/${TOPIC_CONFIG.subscriptionMaxRetries}). Retrying in ${TOPIC_CONFIG.subscriptionRetryDelayMs}ms...`,
    );
    await new Promise((resolve) =>
      setTimeout(resolve, TOPIC_CONFIG.subscriptionRetryDelayMs),
    );

    // If auto-create is enabled, try to create the topic before retrying
    if (TOPIC_CONFIG.autoCreateTopics && attempt === 1) {
      await createMissingTopics([topic]);
    }

    return subscribeWithRetry(topic, attempt + 1, fromBeginning);
  }
};

const startListener = async () => {
  const router = new TopicRouter();
  router.loadHandlers();

  const topics = router.getTopics();

  if (topics.length === 0) {
    console.log("ℹ️ No topics to subscribe to. Kafka listener not started.");
    return;
  }

  // Initialize admin client for topic management
  kafkaAdmin = kafka.admin();
  await kafkaAdmin.connect();
  console.log("📡 Kafka admin connected");

  // Check which topics exist
  const { existing, missing } = await checkTopicsExist(topics);

  if (existing.length > 0) {
    console.log(`✅ Existing topics: ${existing.join(", ")}`);
  }

  // Handle missing topics
  if (missing.length > 0) {
    console.log(`⚠️ Missing topics: ${missing.join(", ")}`);

    if (TOPIC_CONFIG.autoCreateTopics) {
      console.log("🔧 Auto-creating missing topics...");
      const { created, failed } = await createMissingTopics(missing);

      if (failed.length > 0) {
        console.warn(
          `⚠️ Could not create topics: ${failed.join(", ")}. Will retry during subscription.`,
        );
      }
    } else {
      console.warn(
        "⚠️ Auto-create disabled. Missing topics will be retried during subscription.",
      );
    }
  }

  // Initialize consumer (resumes from last committed offset after restart = no missed messages)
  kafkaConsumer = kafka.consumer({
    groupId: `${SERVICE_CODENAME}-bff-aggregator`,
    sessionTimeout: CONSUMER_CONFIG.sessionTimeout,
    heartbeatInterval: CONSUMER_CONFIG.heartbeatInterval,
  });
  await kafkaConsumer.connect();
  console.log("📡 Kafka consumer connected");

  // When group has no committed offset: earliest = catch up from retention, latest = only new messages
  const fromBeginning = CONSUMER_CONFIG.autoOffsetReset === "earliest";

  // Subscribe to topics with retry logic
  const subscriptionResults = await Promise.all(
    topics.map(async (topic) => {
      const success = await subscribeWithRetry(topic, 1, fromBeginning);
      return { topic, success };
    }),
  );

  const subscribedTopics = subscriptionResults
    .filter((r) => r.success)
    .map((r) => r.topic);
  const failedTopics = subscriptionResults
    .filter((r) => !r.success)
    .map((r) => r.topic);

  if (failedTopics.length > 0) {
    console.error(
      `❌ Failed to subscribe to topics: ${failedTopics.join(", ")}`,
    );
  }

  if (subscribedTopics.length === 0) {
    console.error("❌ No topics subscribed. Kafka listener not started.");
    await kafkaConsumer.disconnect();
    await kafkaAdmin.disconnect();
    return;
  }

  console.log(
    `✅ Subscribed to ${subscribedTopics.length} topics: ${subscribedTopics.join(", ")}`,
  );

  // Start consuming messages
  await kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const handlers = router.getHandlers(topic);

      if (handlers.length === 0) {
        console.log(`⚠ No handlers for topic: ${topic}`);
        return;
      }

      let payload;
      try {
        payload = JSON.parse(message.value.toString());
      } catch (parseError) {
        console.error(
          `❌ Failed to parse message from topic ${topic}:`,
          parseError.message,
        );
        console.error(
          `   Raw message: ${message.value.toString().substring(0, 200)}`,
        );
        return;
      }

      const results = await Promise.all(
        handlers.map((fn) => executeWithRetry(fn, payload, topic)),
      );

      const successCount = results.filter((r) => r).length;
      const failCount = results.length - successCount;

      if (failCount > 0) {
        console.warn(
          `📊 Topic ${topic}: ${successCount}/${results.length} handlers succeeded, ${failCount} failed after retries`,
        );
      }
    },
  });

  console.log(
    "🔥 Kafka consumer started (parallel handlers with retry enabled)",
  );
  console.log(
    `   Retry config: max ${RETRY_CONFIG.maxRetries} attempts, initial delay ${RETRY_CONFIG.initialDelayMs}ms, backoff x${RETRY_CONFIG.backoffMultiplier}`,
  );
  console.log(
    `   Topic config: autoCreate=${TOPIC_CONFIG.autoCreateTopics}, partitions=${TOPIC_CONFIG.numPartitions}, replication=${TOPIC_CONFIG.replicationFactor}`,
  );
  console.log(
    `   Consumer config: sessionTimeout=${CONSUMER_CONFIG.sessionTimeout}ms, autoOffsetReset=${CONSUMER_CONFIG.autoOffsetReset} (resume from last offset after restart)`,
  );
};

const shutdownListener = async () => {
  console.log("🔥 Shutting down Kafka listener...");

  if (kafkaConsumer) {
    await kafkaConsumer.disconnect();
    kafkaConsumer = null;
    console.log("   Consumer disconnected");
  }

  if (kafkaAdmin) {
    await kafkaAdmin.disconnect();
    kafkaAdmin = null;
    console.log("   Admin disconnected");
  }

  console.log("🔥 Kafka listener shutdown complete");
};

module.exports = { startListener, shutdownListener };
