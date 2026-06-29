const { expect } = require("chai");
const sinon = require("sinon");
const httpStatus = require("http-status");
const proxyquire = require("proxyquire");

describe("error middleware", () => {
  let sandbox;
  let ApiErrorStub;
  let middleware;
  let req, res, next;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ApiErrorStub = sandbox.stub();

    middleware = proxyquire("../../src/middlewares/error", {
      "../utils": { ApiError: ApiErrorStub },
    });

    req = {};
    res = {
      status: sandbox.stub().returnsThis(),
      send: sandbox.stub(),
      locals: {},
    };
    next = sandbox.stub();
  });

  afterEach(() => sandbox.restore());

  describe("errorConverter", () => {
    it("should pass through if error is an instance of ApiError", () => {
      const fakeError = new (function FakeApiError() {})();
      Object.setPrototypeOf(fakeError, ApiErrorStub.prototype);

      middleware.errorConverter(fakeError, req, res, next);

      expect(next.calledOnceWith(fakeError)).to.be.true;
    });

    it("should convert a generic error into an ApiError", () => {
      const err = new Error("Something bad");

      ApiErrorStub.prototype.constructor = ApiErrorStub;

      const fakeApiError = { statusCode: 500, message: "Converted" };
      ApiErrorStub.returns(fakeApiError);

      middleware.errorConverter(err, req, res, next);

      expect(ApiErrorStub.calledOnce).to.be.true;
      expect(next.calledOnceWith(fakeApiError)).to.be.true;
    });

    it("should set BAD_REQUEST if original error has statusCode", () => {
      const err = new Error("Invalid");
      err.statusCode = true;

      const fakeApiError = { statusCode: 400, message: "Bad" };
      ApiErrorStub.returns(fakeApiError);

      middleware.errorConverter(err, req, res, next);

      const callArgs = ApiErrorStub.getCall(0).args;
      expect(callArgs[0]).to.equal(httpStatus.BAD_REQUEST);
      expect(next.calledOnceWith(fakeApiError)).to.be.true;
    });
  });

  describe("errorHandler", () => {
    beforeEach(() => {
      sandbox.stub(console, "error");
    });

    it("should return full error info in development mode", () => {
      process.env.NODE_ENV = "development";

      const err = {
        statusCode: 400,
        message: "Bad Request",
        stack: "stack",
        isOperational: true,
      };

      middleware.errorHandler(err, req, res);

      expect(res.status.calledOnceWith(400)).to.be.true;
      const sent = res.send.getCall(0).args[0];

      expect(sent).to.include.keys("code", "message", "stack");
      expect(sent.code).to.equal(400);
      expect(sent.message).to.equal("Bad Request");
    });

    it("should hide stack in production mode and handle non-operational errors", () => {
      process.env.NODE_ENV = "production";

      const err = {
        statusCode: 400,
        message: "Bad",
        isOperational: false,
      };

      middleware.errorHandler(err, req, res);

      expect(res.status.calledOnceWith(httpStatus.INTERNAL_SERVER_ERROR)).to.be
        .true;

      const sent = res.send.getCall(0).args[0];
      expect(sent).to.not.have.property("stack");
      expect(sent.message).to.equal(httpStatus[500]);
    });

    it("should preserve message and code for operational error in production", () => {
      process.env.NODE_ENV = "production";

      const err = {
        statusCode: 404,
        message: "Not found",
        isOperational: true,
      };

      middleware.errorHandler(err, req, res);

      expect(res.status.calledOnceWith(404)).to.be.true;

      const sent = res.send.getCall(0).args[0];
      expect(sent.message).to.equal("Not found");
    });
  });
});
