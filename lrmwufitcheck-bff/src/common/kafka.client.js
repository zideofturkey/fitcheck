const { Kafka, logLevel } = require("kafkajs");

const kafkaUri = process.env.KAFKA_URI || "localhost:9092";
const serviceName = process.env.SERVICE_CODENAME ?? "mindbricks-service";
const kafkaUserName = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASS;

const kafka = new Kafka({
  ssl: false,
  clientId: serviceName,
  brokers: [kafkaUri],
  logLevel: logLevel.NOTHING,
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

module.exports = kafka;
