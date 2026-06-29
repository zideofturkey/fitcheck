const HexaPublisher = require("./hexa-publisher");
const { sendMessageToKafka } = require("./kafka");
const { hexaLogger, HexaLogTypes } = require("../common/hexa-logger");

class KafkaPublisher extends HexaPublisher {
  async publish() {
    await super.publish();
    const result = await sendMessageToKafka(this.eventName, this.data);

    // Extract _eventId and _requestId from data for log correlation
    const eventId = this.data?._eventId;
    const requestId = this.data?._requestId;

    if (!result || result.length == 0) {
      if (this.delayRetry()) {
        console.log(
          "Event can't be raised, retrying",
          this.reTry,
          this.eventName,
        );
        return result;
      }
      console.log(
        "Event can't be raised after several retries",
        this.eventName,
      );
      // write event and topic to database to fire later
      hexaLogger.insertError(
        "EventCanNotBeRaised",
        { event: this.eventName, eventId: eventId, result: result },
        "kafka-publisher.js->publish",
        this.data,
        requestId, // Pass requestId to logger for correlation with HTTP requests
      );
    } else {
      if (this.reTry) {
        console.log(
          "Event IS RAISED after n retries n:",
          this.reTry,
          this.eventName,
        );
      }

      hexaLogger.insertInfo(
        "EventRaised",
        { event: this.eventName, eventId: eventId, result: result },
        "kafka-publisher.js->publish",
        this.data,
        requestId, // Pass requestId to logger for correlation with HTTP requests
      );
    }

    return result;
  }
}

module.exports = KafkaPublisher;
