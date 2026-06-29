require("module-alias/register");
const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("FitcheckLoginSession", () => {
  let session, mocks;

  beforeEach(() => {
    process.env.SERVICE_BASE_URL = "localhost";

    mocks = {
      getUserByQuery: sinon.stub(),
      createUser: sinon.stub(),
      updateUserById: sinon.stub(),
      getUserById: sinon.stub(),
      hashCompare: sinon.stub(),
      hashString: sinon.stub().returns("hashed"),
      createHexCode: sinon.stub().returns("hexcode"),
      getRedisData: sinon.stub(),
      setRedisData: sinon.stub(),
    };

    const LoginSession = proxyquire(
      "../../src/project-session/fitcheck-login-session",
      {
        dbLayer: mocks,
        common: {
          createHexCode: mocks.createHexCode,
          getRedisData: mocks.getRedisData,
          setRedisData: mocks.setRedisData,
          hashCompare: mocks.hashCompare,
          hashString: mocks.hashString,
          HttpServerError: class extends Error {},
          ForbiddenError: class extends Error {},
          NotAuthenticatedError: class extends Error {},
          ErrorCodes: {
            UserNotFound: "UserNotFound",
            WrongPassword: "WrongPassword",
            UserTenantMismatch: "UserTenantMismatch",
            EmailVerficationNeeded: "EmailVerficationNeeded",
            MobileVerificationNeeded: "MobileVerificationNeeded",
            UserLoginWithoutCredentials: "UserLoginWithoutCredentials",
          },
        },
        useragent: {
          parse: sinon.stub().returns({
            toJSON: () => ({ browser: "TestBrowser" }),
          }),
        },
        "../../src/project-session/fitcheck-session": class {
          readTenantIdFromRequest = sinon.stub();
          buildSessionFromRequest = sinon.stub();
          setServiceSession = sinon.stub();
          setSessionToEntityCache = sinon.stub();
          createTokenFromSession = sinon.stub().resolves("jwt-token");
          checkNewSession = sinon.stub().resolves(null);
        },
      },
    );

    session = new LoginSession();
    session._clientId = "client123";
    session.superAdminId = "superadmin";
    session.rootTenantId = "rootClient";
    session.tokenLocation = "cookie";
    session.setSessionToEntityCache = sinon.stub();
    session.createTokenFromSession = sinon.stub().resolves("jwt-token");
  });

  describe("initSuperAdmin", () => {
    it("should create super admin user if not exists", async () => {
      mocks.getUserById = sinon.stub().resolves(null);
      const { createUser, updateUserById } = mocks;
      session.superAdminId = "superadmin";
      session.rootTenantId = "rootClient";
      await session.initSuperAdmin();
      expect(mocks.createUser.calledOnce).to.be.true;
    });
  });

  describe("loginUser", () => {
    it("should throw if user not found", async () => {
      mocks.getUserByQuery.resolves(null);
      try {
        await session.loginUser({
          username: "email@test.com",
          password: "1234",
        });
      } catch (err) {
        expect(err.message).to.equal("errMsg_UserNotFound");
      }
    });

    it("should throw if password doesn't match", async () => {
      mocks.getUserByQuery.resolves({
        id: "user1",
        password: "hashed",
        emailVerified: true,
        mobileVerified: true,
        isActive: true,
        _archivedAt: new Date(),
      });
      mocks.hashCompare.returns(false);
      try {
        await session.loginUser({
          username: "email@test.com",
          password: "1234",
        });
      } catch (err) {
        expect(err.message).to.equal("errMsg_PasswordDoesntMatch");
      }
    });

    it("should throw if email is not verified", async () => {
      mocks.getUserByQuery.resolves({
        password: "hashed",
        emailVerified: false,
        mobileVerified: true,
        isActive: true,
        _archivedAt: new Date(),
      });
      mocks.hashCompare.returns(true);
      try {
        await session.loginUser({
          username: "email@test.com",
          password: "1234",
        });
      } catch (err) {
        expect(err.message).to.equal("errMsg_EmailNotVerified");
      }
    });

    it("should return session if valid login", async () => {
      mocks.getUserByQuery.resolves({
        id: "user1",
        password: "hashed",
        emailVerified: true,
        mobileVerified: true,
        isAbsolute: false,
        clientId: "client123",
        isActive: true,
        _archivedAt: new Date(),
      });
      mocks.getUserById.resolves({ name: "ClientName" });
      mocks.hashCompare.returns(true);
      const result = await session.loginUser({
        username: "email@test.com",
        password: "1234",
      });
      expect(result._USERID).to.equal("user1");
    });
  });

  describe("setLoginToRequest", () => {
    it("should set req.session and token correctly", async () => {
      const sessionData = {
        id: "u1",
        userId: "u1",
        emailVerified: true,
        mobileVerified: true,
        isAbsolute: false,
        roleId: "user",
        createdAt: new Date(),
      };

      session.loginUser = sinon.stub().resolves(sessionData);
      session.setSessionToEntityCache = sinon.stub().resolves();
      session.createTokenFromSession = sinon.stub().resolves("jwt-token");

      session.tokenName = "lrmwufitcheck-access-token";

      const req = {
        sessionId: "sess-abc",
        headers: { "user-agent": "TestAgent" },
        clientIp: "1.2.3.4",
      };

      await session.setLoginToRequest(
        req,
        { username: "a", password: "b" },
        null,
      );

      expect(req.session).to.exist;
      expect(req.session.accessToken).to.equal("jwt-token");

      expect(session.accessToken).to.equal("jwt-token");

      expect(session.tokenName).to.equal("lrmwufitcheck-access-token");
    });

    it("should throw HttpServerError if createTokenFromSession returns null", async () => {
      const sessionData = {
        id: "u1",
        userId: "u1",
        emailVerified: true,
        mobileVerified: true,
        isAbsolute: false,
      };

      session.loginUser = sinon.stub().resolves(sessionData);
      session.setSessionToEntityCache = sinon.stub().resolves();
      session.createTokenFromSession = sinon.stub().resolves(null);

      const req = {
        sessionId: "sess-abc",
        headers: { "user-agent": "TestAgent" },
        clientIp: "1.2.3.4",
      };

      try {
        await session.setLoginToRequest(
          req,
          { username: "a", password: "b" },
          null,
        );
        throw new Error("Should not reach here");
      } catch (err) {
        expect(err.message).to.equal("errMsg_LoginTokenCanNotBeCreated");
        expect(err).to.be.instanceOf(Error); // or HttpServerError
      }
    });
  });
  describe("relogin", () => {
    it("should call setLoginToRequest and setServiceSession", async () => {
      const req = {};
      session.session = { userId: "user1" };
      session.setLoginToRequest = sinon.stub().resolves();
      session.setServiceSession = sinon.stub().resolves();

      await session.relogin(req);
      expect(session.setLoginToRequest.calledOnce).to.be.true;
      expect(session.setServiceSession.calledOnce).to.be.true;
      expect(req.sessionToken).to.equal(session.accessToken);
    });

    it("should throw HttpServerError if setLoginToRequest fails", async () => {
      const req = {};
      session.session = { userId: "user1" };
      session.setLoginToRequest = sinon.stub().rejects(new Error("fail"));

      try {
        await session.relogin(req);
        throw new Error("should not reach");
      } catch (err) {
        expect(err.message).to.equal(
          "errMsg_CantReLoginAfterUserAuthConfigUpdate",
        );
      }
    });
  });
  describe("loginBySocialAccount", () => {
    it("should throw NotAuthenticatedError if no userField/subjectClaim", async () => {
      try {
        await session.loginBySocialAccount({}, {});
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal(
          "errMsg_UserCanNotLoginWithoutCredentials",
        );
      }
    });

    it("should return needsRegistration if user not found", async () => {
      mocks.getUserByQuery.resolves(null);
      const req = {};

      const result = await session.loginBySocialAccount(
        {
          userField: "email",
          email: "test@test.com",
          allowRegister: true,
          socialCode: "abc123",
        },
        req,
      );

      expect(result.needsRegistration).to.be.true;
      expect(result.data.type).to.equal("RegisterNeededForSocialLogin");
    });

    it("should login and return needsRegistration false if user exists", async () => {
      mocks.getUserByQuery.resolves({
        id: "u1",
        emailVerified: true,
        isActive: true,
      });
      session.setLoginToRequest = sinon.stub().resolves();
      session.accessToken = "token123";

      const req = {
        sessionId: "sess-abc",
        headers: { "user-agent": "TestAgent" },
        clientIp: "1.2.3.4",
      };

      const result = await session.loginBySocialAccount(
        { userField: "email", email: "user@test.com" },
        req,
      );

      expect(result.needsRegistration).to.be.false;
      expect(session.setLoginToRequest.calledOnce).to.be.true;
    });

    it("should reactivate a soft-deleted user and login via social", async () => {
      const recentArchiveDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      // First call returns null (active query), second returns the soft-deleted user
      mocks.getUserByQuery
        .onFirstCall()
        .resolves(null)
        .onSecondCall()
        .resolves({
          id: "u1",
          email: "user@test.com",
          isActive: false,
          _archivedAt: recentArchiveDate,
        });
      mocks.updateUserById.resolves({
        id: "u1",
        email: "user@test.com",
        isActive: true,
        _archivedAt: null,
      });
      session.setLoginToRequest = sinon.stub().resolves();
      session.accessToken = "token123";

      const req = {
        sessionId: "sess-abc",
        headers: { "user-agent": "TestAgent" },
        clientIp: "1.2.3.4",
      };

      const result = await session.loginBySocialAccount(
        { userField: "email", email: "user@test.com", socialCode: "sc123" },
        req,
      );

      expect(result.needsRegistration).to.be.false;
      expect(mocks.updateUserById.calledOnce).to.be.true;
      expect(session.setLoginToRequest.calledOnce).to.be.true;
    });

    it("should return needsRegistration for user deleted more than 30 days ago", async () => {
      const oldArchiveDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000); // 35 days ago
      mocks.getUserByQuery
        .onFirstCall()
        .resolves(null)
        .onSecondCall()
        .resolves({
          id: "u1",
          email: "user@test.com",
          isActive: false,
          _archivedAt: oldArchiveDate,
        });

      const req = {};

      const result = await session.loginBySocialAccount(
        { userField: "email", email: "user@test.com", socialCode: "sc123" },
        req,
      );

      expect(result.needsRegistration).to.be.true;
      expect(result.data.type).to.equal("RegisterNeededForSocialLogin");
      // Old record is NOT modified — unique index respects soft-delete (WHERE isActive = true)
      expect(mocks.updateUserById.called).to.be.false;
    });
  });
  describe("init", () => {
    it("should call initSuperAdmin", async () => {
      const spy1 = sinon.stub(session, "initSuperAdmin").resolves();

      await session.init();
      expect(spy1.calledOnce).to.be.true;
    });
  });
});
