require("module-alias/register");
const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { NotAuthorizedError } = require("common");

describe("fitcheck-session", () => {
  let getRedisDataStub;

  beforeEach(() => {
    getRedisDataStub = sinon.stub().resolves(null);

    InstanceSession = proxyquire("../../src/project-session/fitcheck-session", {
      common: {
        hexaLogger: { log: sinon.stub() },
        getRedisData: getRedisDataStub,
        redisClient: { set: sinon.stub() },
      },
      "../../src/project-session/hexa-auth": class {
        getBearerToken = sinon.stub();
        getCookieToken = sinon.stub();
      },
      serviceCommon: {
        ElasticIndexer: class {
          constructor() {}
          getOne = sinon.stub().resolves({ id: "resolved-id" });
        },
      },
    });

    instance = new InstanceSession();
    instance.session = {}; // default dummy session
  });

  describe("userHasRole", () => {
    it("should return true if role matches string", () => {
      instance.session = { roleId: "admin" };
      expect(instance.userHasRole("admin")).to.be.true;
    });
    it("should return true if role in array", () => {
      instance.session = { roleId: ["admin"] };
      expect(instance.userHasRole("admin")).to.be.true;
    });
    it("should return false if role not matched", () => {
      instance.session = { roleId: "user" };
      expect(instance.userHasRole("admin")).to.be.false;
    });
  });
});
