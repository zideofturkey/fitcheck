const { User } = require("models");
const { createHexCode } = require("common");
const { hexaLogger } = require("common");
const { hashCompare, hashString, md5 } = require("common");
const { ServicePublisher } = require("serviceCommon");
const path = require("path");
const fs = require("fs");
const { parseClientInfo } = require("utils");

const {
  HttpServerError,
  ForbiddenError,
  NotAuthenticatedError,
  ErrorCodes,
} = require("common");

const { getRedisData, setRedisData, getRestData } = require("common");

const { Op } = require("sequelize");

const { getUserByQuery, createUser, updateUserById } = require("dbLayer");

const FitcheckSession = require("./fitcheck-session");

class FitcheckLoginSession extends FitcheckSession {
  constructor() {
    super();
    this.allowedCookieDomains = [];
  }

  async #getUserFromDb(userField, userValue) {
    const getUserQuery = (forceActive) => {
      const uQuery = {
        [Op.and]: [{ [userField]: { [Op.eq]: userValue } }],
      };
      if (forceActive) {
        uQuery[Op.and].push({ isActive: { [Op.eq]: true } });
      }
      return uQuery;
    };

    const whereActive = getUserQuery(true);
    const where = getUserQuery(false);

    // first get the active user, if not search for passive
    const user =
      (await getUserByQuery(whereActive)) ?? (await getUserByQuery(where));

    //check if the user is a root user and owner of this tenant

    return user;
  }

  async #activateDeletedAccount(userId) {
    const user = await updateUserById(userId, {
      isActive: true,
      _archivedAt: null,
    });

    // Publish event to the configured topic
    const _publisher = new ServicePublisher(
      "lrmwufitcheck-auth-service-profile-restored",
      user,
      null, // no session yet
      this.loginRequest?.requestId,
    );
    try {
      await _publisher.publish();
    } catch (err) {
      console.log("Profile restored event cant be published", err);
    }

    return user;
  }

  async #getUserWithUsernamePassword(identifier, password) {
    const loginField = "email";
    console.log("check user with " + loginField, identifier);
    let user = await this.#getUserFromDb(loginField, identifier);

    if (!user) {
      throw new NotAuthenticatedError(
        "errMsg_UserNotFound",
        ErrorCodes.UserNotFound,
      );
    }

    if (!user.isActive && user._archivedAt) {
      const archivedAt = user._archivedAt.getTime();
      const _30Days = 30 * 24 * 60 * 60 * 1000;
      const today = new Date().getTime();
      const diff = today - archivedAt;

      if (diff > _30Days) {
        throw new NotAuthenticatedError(
          "errMsg_ThisAccountISDeleted",
          ErrorCodes.UserNotFound,
        );
      }
    }

    const userPassword = user.password;

    if (!(hashCompare(password, userPassword) == true)) {
      throw new ForbiddenError(
        "errMsg_PasswordDoesntMatch",
        ErrorCodes.WrongPassword,
      );
    }

    if (process.env.CONFIG_ENV == "prod" && user.roleId == "superAdmin") {
      throw new ForbiddenError(
        "errMsg_DefaultPasswordCantBeUsedInProdMode",
        ErrorCodes.WrongPassword,
      );
    }

    if (!user.isActive) {
      // re-activate acccount
      user = this.#activateDeletedAccount(user.id);
    }

    return user;
  }

  async #getUserWithSsoSubject(userField, ssoSubject) {
    const user = await this.#getUserFromDb(userField, ssoSubject);
    if (!user) {
      throw new NotAuthenticatedError(
        "errMsg_UserNotFound",
        ErrorCodes.UserNotFound,
      );
    }
    return user;
  }

  async loginUser(byPassword, bySubject) {
    const session = { appCodename: this.appCodename };
    let user = null;
    if (byPassword) {
      user = await this.#getUserWithUsernamePassword(
        byPassword.username ?? byPassword.email ?? byPassword.mobile,
        byPassword.password,
      );
    } else if (bySubject) {
      user = await this.#getUserWithSsoSubject(
        bySubject.userField,
        bySubject.subjectClaim,
      );
    }

    if (!user) return null;

    if (bySubject && bySubject.userField == "email") {
      // since email comes from social login, it can be considered as verified
      user.emailVerified = true;
    }

    if (user.emailVerified !== true) {
      throw new ForbiddenError(
        "errMsg_EmailNotVerified",
        ErrorCodes.EmailVerificationNeeded,
      );
    }

    if (user.id === this.superAdminId) user.isAbsolute = true;
    session.isAbsolute = user.isAbsolute;

    session.sessionId = byPassword
      ? createHexCode()
      : (bySubject?.sessionId ?? createHexCode());
    session.userId = user.id;

    for (const key of Object.keys(user)) {
      if (
        ![
          "id",
          "createdAt",
          "updatedAt",
          "_archivedAt",
          "isActive",
          "password",
        ].includes(key)
      )
        session[key] = user[key];
    }
    // Alias roleId → role for MScript / dataClause / formula expressions.
    // The underlying field name is `roleId` (string like "user", "admin",
    // "superAdmin", "tenantOwner"), but agents and developers frequently
    // reach for `.role`. Aliasing once at session build avoids the
    // silent-undefined bug across every condition / whereClause / formula.
    session.role = session.roleId;
    if (!session.fullname && session.name) {
      session.fullname = `${session.name} ${session.surname}`;
    }

    session.registeredAt = user.createdAt;
    session.loginAt = new Date().toISOString();

    session._USERID = user.id;

    return session;
  }

  async relogin(req) {
    console.log("fitcheck session found but a relogin is requested");
    try {
      const userField = "id";
      const subjectClaim = this.session.userId;
      await this.setLoginToRequest(req, null, { userField, subjectClaim });
      await this.setServiceSession(req);
      req.sessionToken = this.accessToken;
    } catch (err) {
      console.log(err);
      throw new HttpServerError(
        "errMsg_CantReLoginAfterUserAuthConfigUpdate",
        err,
      );
    }
  }

  async setLoginToRequest(req, byPassword, bySubject) {
    this.loginRequest = req;

    if (
      byPassword &&
      (!byPassword.password ||
        (!byPassword.username && !byPassword.email && !byPassword.mobile))
    ) {
      throw new NotAuthenticatedError(
        "errMsg_UserCanNotLoginWithoutCredentials",
        ErrorCodes.UserLoginWithoutCredentials,
      );
    }
    const session = await this.loginUser(byPassword, bySubject);

    session.loginIp = req.clientIp;

    if (session.loginIp == "::1") session.loginIp = "161.185.160.93";

    session.city = "$UNKNOWN";
    session.country = "$UNKNOWN";

    try {
      const geoData = await getRestData(
        `https://api.ipapi.com/api/${session.loginIp}?access_key=${process.env.API_STACK_KEY}`,
      );
      console.log("geoData for IP:", req.clientIp, geoData);
      if (geoData) {
        session.country = geoData.country_name ?? "$UNKNOWN";
        session.city = geoData.city ?? "$UNKNOWN";
        session.localDateTime = geoData.time_zone?.current_time ?? "$UNKNOWN";
        session.gmtOffset = geoData.time_zone?.gmt_offset ?? "$UNKNOWN";
        session.timeZoneCode = geoData.time_zone?.code ?? "$UNKNOWN";
        session.language = geoData.location?.languages.length
          ? geoData.location?.languages[0]
          : null;
        session.location =
          geoData.latitude && geoData.longitude
            ? { lat: geoData.latitude, lon: geoData.longitude }
            : null;
        session.isp = geoData.connection?.isp ?? "$UNKNOWN";
      }
    } catch (err) {
      console.log("IP Location Can Not Be Fetched", req.cklientIp, err.message);
    }

    const agent = parseClientInfo(req.headers)?.summary;
    session.agent = agent;

    session._USERID = session.userId;

    session.checkTokenMark = this.projectCodename + "-inapp-token";
    session._USERID = session.userId;

    await this.setSessionToEntityCache(session);

    req.session = session;
    const token = await this.createTokenFromSession(session, false);
    if (!token) {
      throw new HttpServerError("errMsg_LoginTokenCanNotBeCreated", {
        detail: "JWTLib couldnt create token",
      });
    }
    session.accessToken = token;
    this.session = req.session;
    this.sessionId = req.sessionId;
    req.auth = this;
    this.accessToken = token;
    this.tokenLocation = "cookie";
    req.sessionToken = this.accessToken;

    if (byPassword) {
      const newSessionCheck = await this.checkNewSession(this.session);
      if (newSessionCheck) {
        // Publish new-login event to the configured topic
        const _publisher = new ServicePublisher(
          "lrmwufitcheck-auth-service-new-loginlocation",
          newSessionCheck,
          this.session,
          req.requestId,
        );
        try {
          await _publisher.publish();
        } catch (err) {
          console.log("New login location event cant be published", err);
        }

        console.log("new-loginlocation published", newSessionCheck);
      }

      // Publish event to the configured topic
      const _publisher = new ServicePublisher(
        "lrmwufitcheck-auth-service-user-logged-in",
        session,
        this.session,
        req.requestId,
      );
      try {
        await _publisher.publish();
      } catch (err) {
        console.log("User logged in event cant be published", err);
      }
    }
  }

  /**
   * Performs social login: checks if user exists, either returns registration-needed data
   * or performs full login via setLoginToRequest.
   * Returns { needsRegistration, data } — the caller (social-login-router) handles the response
   * using RestController for consistent cookie/token handling.
   */
  async loginBySocialAccount(accountInfo, req) {
    console.log("loginBySocialAccount", accountInfo);
    const userField = accountInfo.userField;
    const subjectClaim = accountInfo[userField];

    if (!userField || !subjectClaim) {
      throw new NotAuthenticatedError(
        "errMsg_UserCanNotLoginWithoutCredentials",
        ErrorCodes.UserLoginWithoutCredentials,
      );
    }

    // check if user exists in db
    let user = await this.#getUserFromDb(userField, subjectClaim);

    // If user was soft-deleted, check deletion age:
    // - Within 30 days: restore the account (user keeps their ID and data)
    // - Older than 30 days: treat as "user not found" — a fresh registration will create a new account
    //   (unique index has WHERE isActive=true, so the old record won't conflict)
    if (user && !user.isActive) {
      const _30Days = 30 * 24 * 60 * 60 * 1000;
      const isOldDeletion =
        user._archivedAt &&
        new Date().getTime() - user._archivedAt.getTime() > _30Days;

      if (isOldDeletion) {
        console.log(
          "Old deleted account found (>30 days), treating as new registration:",
          subjectClaim,
        );
        user = null; // fall through to needsRegistration below
      } else {
        user = await this.#activateDeletedAccount(user.id);
        console.log(
          "Soft-deleted account reactivated via social login:",
          subjectClaim,
        );
      }
    }

    if (!user) {
      // No active user found — the frontend decides whether to
      // register silently or show a form for additional required fields.
      await setRedisData(
        accountInfo.socialCode,
        JSON.stringify(accountInfo),
        60 * 3,
      ); // store for 3 minutes
      return {
        needsRegistration: true,
        data: {
          type: "RegisterNeededForSocialLogin",
          message: "User not found. Registration is needed.",
          socialCode: accountInfo.socialCode,
          accountInfo: accountInfo,
        },
      };
    }

    await this.setLoginToRequest(req, null, { userField, subjectClaim });
    console.log("Session is created", this.session);
    return { needsRegistration: false };
  }

  async init() {
    await this.initSuperAdmin();
  }

  async initSuperAdmin() {
    try {
      const { createUser, getUserById, updateUserById } = require("dbLayer");
      const absUser = await getUserById(this.superAdminId);

      if (!absUser) {
        const absUserData = {
          id: this.superAdminId,
          fullname: "Root User",
          email: "admin@fitcheck.com",
          emailVerified: true,
          password: hashString("superadmin"),

          roleId: "superAdmin",
          avatar: `https://gravatar.com/avatar/${md5("superAdmin")}?s=200&d=identicon`,
        };
        await createUser(absUserData);
      } else {
        const absUserData = {
          email: "admin@fitcheck.com",
          password: hashString("superadmin"),
        };
        await updateUserById(absUser.id, absUserData);
      }
    } catch (err) {
      hexaLogger.insertError("Error while creating super admin user", err);
    }
  }
}

// Export the class
module.exports = FitcheckLoginSession;
