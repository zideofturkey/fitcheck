const HexaListener = require("./hexa-listener");
const { createConsumer, resolveTopic, ensureTopicExists } = require("./kafka");
const { hexaLogger, HexaLogTypes } = require("../common/hexa-logger");

const KAFKA_SUBSCRIBE_MAX_RETRIES = parseInt(
  process.env.KAFKA_SUBSCRIBE_MAX_RETRIES || "5",
  10,
);
const KAFKA_SUBSCRIBE_RETRY_DELAY_MS = parseInt(
  process.env.KAFKA_SUBSCRIBE_RETRY_DELAY_MS || "5000",
  10,
);

class KafkaListener extends HexaListener {
  async internalHandler(topic, message) {
    // Extract _eventId and _requestId early for correlation
    let eventId = null;
    let requestId = null;

    try {
      const controller = this.eventHandler;
      const dataStr = message.value.toString();
      const listenerData = JSON.parse(dataStr);

      // Extract correlation IDs from event payload
      eventId = listenerData?._eventId;
      requestId = listenerData?._requestId;

      hexaLogger.insertInfo(
        "NewEventArrived",
        { topic: topic, eventId: eventId },
        "kafka-listener.js->eachMessage",
        listenerData,
        requestId, // Pass requestId for correlation with original API request
      );

      const session = listenerData.session;
      const sessionId = session?.sessionId;

      hexaLogger.insertInfo(
        "EventSessionRetrieved",
        { sessionId: sessionId, eventId: eventId },
        "kafka-listener.js->eachMessage",
        session,
        requestId,
      );

      const response = await controller(
        topic,
        session,
        listenerData,
        this.callBackData,
      );
      const data = {};
      data[topic] = listenerData;

      let isProcessed = true;
      let isError = false;
      if (typeof response === "boolean") {
        isProcessed = response;
        isError = !isProcessed;
      } else if (response && typeof response === "object") {
        isError = response.response instanceof Error;
        isProcessed = response.eventProcess;
        if (isError) response.response = response.response.message;
        data[topic + "-response"] =
          response.response ?? "noResponseDataReturned";
      }

      if (isError) {
        hexaLogger.insertError(
          "EventCanNotProcessed",
          { topic: topic, eventId: eventId },
          "kafka-listener.js->eachMessage",
          data,
          requestId,
        );
      } else {
        hexaLogger.insertInfo(
          "EventIsProcessed",
          { topic: topic, eventId: eventId },
          "kafka-listener.js->eachMessage",
          data,
          requestId,
        );
      }
    } catch (err) {
      // log the error
      hexaLogger.insertError(
        "ListenerError",
        { topic: topic, eventId: eventId, err: err.message },
        "kafka-listener.js->eachMessage",
        err,
        requestId,
      );

      console.log(`Listener Controller Error In ${topic}:${err.message}`);
    }
  }

  async listen() {
    const resolvedEventName = resolveTopic(this.eventName);

    for (let attempt = 1; attempt <= KAFKA_SUBSCRIBE_MAX_RETRIES; attempt++) {
      try {
        const consumer = createConsumer(resolvedEventName, this.listenerType);
        await consumer.connect();

        try {
          await consumer.subscribe({
            topics: [resolvedEventName],
            fromBeginning: true,
          });
        } catch (subErr) {
          if (subErr.type === "UNKNOWN_TOPIC_OR_PARTITION" && attempt === 1) {
            console.log(
              `[KAFKA] Topic "${resolvedEventName}" not found, attempting to create it...`,
            );
            await ensureTopicExists(resolvedEventName);
            await consumer.subscribe({
              topics: [resolvedEventName],
              fromBeginning: true,
            });
          } else {
            throw subErr;
          }
        }

        await consumer.run({
          eachMessage: async ({
            topic,
            partition,
            message,
            heartbeat,
            pause,
          }) => {
            this.internalHandler(topic, message);
            return true;
          },
        });
        return true;
      } catch (err) {
        const retriable = attempt < KAFKA_SUBSCRIBE_MAX_RETRIES;
        console.log(
          `[KAFKA] Listener for "${resolvedEventName}" failed (attempt ${attempt}/${KAFKA_SUBSCRIBE_MAX_RETRIES}): ${err.message}` +
            (retriable
              ? ` — retrying in ${KAFKA_SUBSCRIBE_RETRY_DELAY_MS}ms`
              : " — giving up"),
        );
        hexaLogger.insertError(
          "KafkaListenerSubscribeError",
          {
            topic: resolvedEventName,
            attempt,
            maxRetries: KAFKA_SUBSCRIBE_MAX_RETRIES,
          },
          "kafka-listener.js->listen",
          err,
        );
        if (!retriable) return false;
        await new Promise((r) => setTimeout(r, KAFKA_SUBSCRIBE_RETRY_DELAY_MS));
      }
    }
    return false;
  }
}

module.exports = KafkaListener;
