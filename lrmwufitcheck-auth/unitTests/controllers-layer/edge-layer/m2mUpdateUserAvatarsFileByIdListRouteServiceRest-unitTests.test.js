require("module-alias/register");
const { expect } = require("chai");
const sinon = require("sinon");
const { NotAuthenticatedError } = require("common");
const proxyquire = require("proxyquire");

describe("m2mUpdateUserAvatarsFileByIdListRestController", function () {
  let functionNameStub;
  let m2mUpdateUserAvatarsFileByIdListRestController;

  beforeEach(() => {
    // Always return a basic object so controller can respond
    functionNameStub = sinon.stub().resolves({ content: "ok" });

    m2mUpdateUserAvatarsFileByIdListRestController = proxyquire(
      "../../../src/controllers-layer/edge-layer/m2mUpdateUserAvatarsFileByIdList-rest",
      {
        edgeFunctions: { m2mUpdateUserAvatarsFileByIdList: functionNameStub },
      },
    );
  });

  it("should return a valid response when login is not required", async function () {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    const next = sinon.stub();

    await m2mUpdateUserAvatarsFileByIdListRestController(req, res, next);

    expect(res.status.called).to.be.true;
    expect(res.send.called).to.be.true;
    expect(next.called).to.be.false;
  });

  it("should handle errors and call next() on failure", async function () {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    const next = sinon.stub();

    const error = new Error("Test error");

    m2mUpdateUserAvatarsFileByIdListRestController = (req, res, next) => {
      next(error);
    };

    await m2mUpdateUserAvatarsFileByIdListRestController(req, res, next);

    expect(next.calledWith(error)).to.be.true;
    expect(next.args[0][0]).to.be.instanceOf(Error);
    expect(next.args[0][0].message).to.equal("Test error");
  });
});
