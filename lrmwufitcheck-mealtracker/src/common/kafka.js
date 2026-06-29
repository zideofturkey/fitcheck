const { Kafka, logLevel } = require("kafkajs");
const crypto = require("crypto");

const kafkaUri = process.env.KAFKA_URI || "localhost:9092";
const serviceName = process.env.SERVICE_CODENAME ?? "mindbricks-service";
const kafkaUserName = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASS;

let kafkaProducer = null;
let kafkaClient = null;
const consumers = [];
let _topicAliasResolver = null;

const registerTopicAliasResolver = (resolverFn) => {
  _topicAliasResolver = resolverFn;
};

const resolveTopic = (topic) => {
  if (!_topicAliasResolver || !topic) return topic;
  try {
    return _topicAliasResolver(topic);
  } catch (_) {
    return topic;
  }
};

const sendMessageToKafka = async (kafkaTopic, data) => {
  if (process.env.NODE_ENV == "development")
    return [{ message: "Event publish is omitted in development" }];
  const resolvedTopic = resolveTopic(kafkaTopic);
  try {
    const sResult = kafkaProducer
      ? await kafkaProducer.send({
          topic: resolvedTopic,
          messages: [{ value: JSON.stringify(data) }],
        })
      : null;
    return sResult;
  } catch (err) {
    //**errorLog
    console.log("Event Raise Error:", err);
    return null;
  }
};

const logCreator =
  (logLevel) =>
  ({ namespace, level, label, log }) => {
    const { message, ...extra } = log;
    if (level === logLevel.ERROR) {
      console.error(`[${label}] ${message}`, extra);
    }
  };

const connectToKafka = async () => {
  // kafkaClient = new Kafka({
  //   clientId: serviceName,
  //   brokers: [kafkaUri],
  //   logLevel: logLevel.ERROR,
  //   logCreator,
  // });

  kafkaClient = new Kafka({
    ssl: false,
    clientId: serviceName,
    brokers: [kafkaUri],
    logLevel: logLevel.ERROR,
    logCreator,
    ...(kafkaUserName && kafkaPassword
      ? {
          sasl: {
            mechanism: "plain",
            username: kafkaUserName,
            password: kafkaPassword,
          },
        }
      : {}),
  });

  kafkaProducer = kafkaClient.producer();

  try {
    await kafkaProducer.connect();
    console.log("kafka producer connected");
  } catch (err) {
    //**errorLog
    console.log("kafka producer can not connect", err);
  }
};

const createConsumer = (topic, listener) => {
  const resolvedTopic = resolveTopic(topic);
  const hashes = crypto.getHashes();
  const hash = crypto
    .createHash("shake256", { outputLength: 6 })
    .update(serviceName + (listener ? listener : ""))
    .digest("hex");
  const consumer = kafkaClient.consumer({
    groupId: hash + "-" + resolvedTopic,
  });
  consumer._resolvedTopic = resolvedTopic;
  consumers.push(consumer);
  return consumer;
};

const ensureTopicExists = async (topic) => {
  if (!kafkaClient) return;
  const admin = kafkaClient.admin();
  try {
    await admin.connect();
    const existingTopics = await admin.listTopics();
    if (!existingTopics.includes(topic)) {
      await admin.createTopics({
        waitForLeaders: true,
        topics: [{ topic, numPartitions: 1, replicationFactor: 1 }],
      });
      console.log(`[KAFKA] Topic "${topic}" created`);
    }
  } catch (err) {
    console.log(
      `[KAFKA] Could not ensure topic "${topic}" exists:`,
      err.message,
    );
  } finally {
    await admin.disconnect().catch(() => {});
  }
};

const closeKafka = async () => {
  console.log("Disconnecting Kafka producers and consumers...");
  if (kafkaProducer) await kafkaProducer.disconnect();
  consumers.forEach(async (consumer) => {
    await consumer.disconnect();
  });
  consumers.length = 0;
};

module.exports = {
  connectToKafka,
  sendMessageToKafka,
  createConsumer,
  closeKafka,
  registerTopicAliasResolver,
  resolveTopic,
  ensureTopicExists,
};
