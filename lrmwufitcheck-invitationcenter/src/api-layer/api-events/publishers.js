const { ServicePublisher } = require("serviceCommon");

// InviteLink Event Publisher Classes

// Publisher class for validateInviteCode api
const { InvitecodeValidatedTopic } = require("./topics");
class InvitecodeValidatedPublisher extends ServicePublisher {
  constructor(invitecode, session, requestId) {
    super(InvitecodeValidatedTopic, invitecode, session, requestId);
  }

  static async Publish(invitecode, session, requestId) {
    const _publisher = new InvitecodeValidatedPublisher(
      invitecode,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for consumeInviteLink api
const { InvitelinkConsumedTopic } = require("./topics");
class InvitelinkConsumedPublisher extends ServicePublisher {
  constructor(invitelink, session, requestId) {
    super(InvitelinkConsumedTopic, invitelink, session, requestId);
  }

  static async Publish(invitelink, session, requestId) {
    const _publisher = new InvitelinkConsumedPublisher(
      invitelink,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// InviteAudit Event Publisher Classes

module.exports = {
  InvitecodeValidatedPublisher,
  InvitelinkConsumedPublisher,
};
