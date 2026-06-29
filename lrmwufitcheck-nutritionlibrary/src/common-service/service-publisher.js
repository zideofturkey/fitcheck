const { KafkaPublisher } = require("common");
const { hexaLogger, createM2MToken, md5 } = require("common");
const v4 = require("uuid").v4;
const { resolveTopicAlias } = require("./topic-alias-resolver");

class ServicePublisher extends KafkaPublisher {
  constructor(topic, data, session, requestId) {
    const resolvedTopic = resolveTopicAlias(topic);
    const publishedData = JSON.parse(JSON.stringify(data));
    publishedData.session = session;
    publishedData._eventId = v4();
    publishedData._requestId = requestId;
    super(resolvedTopic, publishedData);
  }

  async publish() {
    // Add M2M token to the message payload before publishing (skipped in test mode)
    try {
      const m2mToken = await createM2MToken(
        { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
        {
          requestPayloadHash: md5(JSON.stringify(this.data)),
          expiresIn: "15m",
        },
      );

      // Only add M2M token to the published data if it was created (not in test mode)
      if (m2mToken) {
        this.data.M2MToken = m2mToken;
      }
    } catch (error) {
      console.error(
        "Error creating M2M token for ServicePublisher:",
        error.message,
      );
      //**errorLog
      // Continue to publish without M2M token
    }

    // Call parent publish method
    return await super.publish();
  }
}

module.exports = ServicePublisher;
