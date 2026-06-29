const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { status } = require("@grpc/grpc-js");

describe("GetUserGrpcController", () => {
  let getUser;
  let ManagerStub, processRequestStub;
  let call, callback;

  beforeEach(() => {
    call = {
      request: { foo: "bar" },
      metadata: { get: sinon.stub().returns([]) },
    };
    callback = sinon.stub();

    ManagerStub = sinon.stub();
    processRequestStub = sinon.stub().resolves();

    getUser = proxyquire(
      "../../../src/controllers-layer/grpc-layer/get-user-api.js",
      {
        apiLayer: { GetUserManager: ManagerStub },
        "./AuthServiceGrpcController": class {
          constructor(name, routeName, _call, _callback) {
            this.name = name;
            this.routeName = routeName;
            this._call = _call;
            this._callback = _callback;
            this.request = _call.request;
            this.processRequest = processRequestStub; // stubbed
          }
        },
        "@grpc/grpc-js": { status },
      },
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("getUser", () => {
    it("should call processRequest successfully", async () => {
      await getUser(call, callback);
      expect(processRequestStub.calledOnce).to.be.true;
      expect(callback.called).to.be.false; // no error callback
    });

    it("should handle errors and return gRPC error via callback", async () => {
      const error = new Error("boom");
      error.grpcStatus = status.NOT_FOUND;
      processRequestStub.rejects(error);

      await getUser(call, callback);

      expect(callback.calledOnce).to.be.true;
      const grpcError = callback.firstCall.args[0];
      expect(grpcError.code).to.equal(status.NOT_FOUND);
      expect(grpcError.message).to.equal("boom");
    });

    it("should fallback to INTERNAL if error has no grpcStatus", async () => {
      const error = new Error("generic failure");
      processRequestStub.rejects(error);

      await getUser(call, callback);

      expect(callback.calledOnce).to.be.true;
      const grpcError = callback.firstCall.args[0];
      expect(grpcError.code).to.equal(status.INTERNAL);
      expect(grpcError.message).to.equal("generic failure");
    });
  });
});
