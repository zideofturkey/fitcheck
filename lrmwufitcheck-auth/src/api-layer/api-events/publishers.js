const { ServicePublisher } = require("serviceCommon");

// User Event Publisher Classes

// Publisher class for getUser api
const { UserRetrivedTopic } = require("./topics");
class UserRetrivedPublisher extends ServicePublisher {
  constructor(user, session, requestId) {
    super(UserRetrivedTopic, user, session, requestId);
  }

  static async Publish(user, session, requestId) {
    const _publisher = new UserRetrivedPublisher(user, session, requestId);
    await _publisher.publish();
  }
}

// Publisher class for updateUser api
const { UserUpdatedTopic } = require("./topics");
class UserUpdatedPublisher extends ServicePublisher {
  constructor(user, session, requestId) {
    super(UserUpdatedTopic, user, session, requestId);
  }

  static async Publish(user, session, requestId) {
    const _publisher = new UserUpdatedPublisher(user, session, requestId);
    await _publisher.publish();
  }
}

// Publisher class for updateProfile api
const { ProfileUpdatedTopic } = require("./topics");
class ProfileUpdatedPublisher extends ServicePublisher {
  constructor(profile, session, requestId) {
    super(ProfileUpdatedTopic, profile, session, requestId);
  }

  static async Publish(profile, session, requestId) {
    const _publisher = new ProfileUpdatedPublisher(profile, session, requestId);
    await _publisher.publish();
  }
}

// Publisher class for createUser api
const { UserCreatedTopic } = require("./topics");
class UserCreatedPublisher extends ServicePublisher {
  constructor(user, session, requestId) {
    super(UserCreatedTopic, user, session, requestId);
  }

  static async Publish(user, session, requestId) {
    const _publisher = new UserCreatedPublisher(user, session, requestId);
    await _publisher.publish();
  }
}

// Publisher class for deleteUser api
const { UserDeletedTopic } = require("./topics");
class UserDeletedPublisher extends ServicePublisher {
  constructor(user, session, requestId) {
    super(UserDeletedTopic, user, session, requestId);
  }

  static async Publish(user, session, requestId) {
    const _publisher = new UserDeletedPublisher(user, session, requestId);
    await _publisher.publish();
  }
}

// Publisher class for archiveProfile api
const { ProfileArchivedTopic } = require("./topics");
class ProfileArchivedPublisher extends ServicePublisher {
  constructor(profile, session, requestId) {
    super(ProfileArchivedTopic, profile, session, requestId);
  }

  static async Publish(profile, session, requestId) {
    const _publisher = new ProfileArchivedPublisher(
      profile,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for listUsers api
const { UsersListedTopic } = require("./topics");
class UsersListedPublisher extends ServicePublisher {
  constructor(users, session, requestId) {
    super(UsersListedTopic, users, session, requestId);
  }

  static async Publish(users, session, requestId) {
    const _publisher = new UsersListedPublisher(users, session, requestId);
    await _publisher.publish();
  }
}

// Publisher class for searchUsers api
const { UsersSearchedTopic } = require("./topics");
class UsersSearchedPublisher extends ServicePublisher {
  constructor(users, session, requestId) {
    super(UsersSearchedTopic, users, session, requestId);
  }

  static async Publish(users, session, requestId) {
    const _publisher = new UsersSearchedPublisher(users, session, requestId);
    await _publisher.publish();
  }
}

// Publisher class for updateUserRole api
const { UserroleUpdatedTopic } = require("./topics");
class UserroleUpdatedPublisher extends ServicePublisher {
  constructor(userrole, session, requestId) {
    super(UserroleUpdatedTopic, userrole, session, requestId);
  }

  static async Publish(userrole, session, requestId) {
    const _publisher = new UserroleUpdatedPublisher(
      userrole,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateUserPassword api
const { UserpasswordUpdatedTopic } = require("./topics");
class UserpasswordUpdatedPublisher extends ServicePublisher {
  constructor(userpassword, session, requestId) {
    super(UserpasswordUpdatedTopic, userpassword, session, requestId);
  }

  static async Publish(userpassword, session, requestId) {
    const _publisher = new UserpasswordUpdatedPublisher(
      userpassword,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateUserPasswordByAdmin api
const { UserpasswordbyadminUpdatedTopic } = require("./topics");
class UserpasswordbyadminUpdatedPublisher extends ServicePublisher {
  constructor(userpasswordbyadmin, session, requestId) {
    super(
      UserpasswordbyadminUpdatedTopic,
      userpasswordbyadmin,
      session,
      requestId,
    );
  }

  static async Publish(userpasswordbyadmin, session, requestId) {
    const _publisher = new UserpasswordbyadminUpdatedPublisher(
      userpasswordbyadmin,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for getBriefUser api
const { BriefuserRetrivedTopic } = require("./topics");
class BriefuserRetrivedPublisher extends ServicePublisher {
  constructor(briefuser, session, requestId) {
    super(BriefuserRetrivedTopic, briefuser, session, requestId);
  }

  static async Publish(briefuser, session, requestId) {
    const _publisher = new BriefuserRetrivedPublisher(
      briefuser,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// UserAvatarsFile Event Publisher Classes

// Publisher class for getUserAvatarsFile api
const { UseravatarsfileRetrivedTopic } = require("./topics");
class UseravatarsfileRetrivedPublisher extends ServicePublisher {
  constructor(useravatarsfile, session, requestId) {
    super(UseravatarsfileRetrivedTopic, useravatarsfile, session, requestId);
  }

  static async Publish(useravatarsfile, session, requestId) {
    const _publisher = new UseravatarsfileRetrivedPublisher(
      useravatarsfile,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for listUserAvatarsFiles api
const { UseravatarsfilesListedTopic } = require("./topics");
class UseravatarsfilesListedPublisher extends ServicePublisher {
  constructor(useravatarsfiles, session, requestId) {
    super(UseravatarsfilesListedTopic, useravatarsfiles, session, requestId);
  }

  static async Publish(useravatarsfiles, session, requestId) {
    const _publisher = new UseravatarsfilesListedPublisher(
      useravatarsfiles,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteUserAvatarsFile api
const { UseravatarsfileDeletedTopic } = require("./topics");
class UseravatarsfileDeletedPublisher extends ServicePublisher {
  constructor(useravatarsfile, session, requestId) {
    super(UseravatarsfileDeletedTopic, useravatarsfile, session, requestId);
  }

  static async Publish(useravatarsfile, session, requestId) {
    const _publisher = new UseravatarsfileDeletedPublisher(
      useravatarsfile,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

module.exports = {
  UserRetrivedPublisher,
  UserUpdatedPublisher,
  ProfileUpdatedPublisher,
  UserCreatedPublisher,
  UserDeletedPublisher,
  ProfileArchivedPublisher,
  UsersListedPublisher,
  UsersSearchedPublisher,
  UserroleUpdatedPublisher,
  UserpasswordUpdatedPublisher,
  UserpasswordbyadminUpdatedPublisher,
  BriefuserRetrivedPublisher,

  UseravatarsfileRetrivedPublisher,
  UseravatarsfilesListedPublisher,
  UseravatarsfileDeletedPublisher,
};
