const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const httpStatus = require("http-status");

describe("validate middleware", () => {
  let sandbox;
  let pickStub;
  let ApiErrorStub;
  let JoiStub;
  let validate;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    pickStub = sandbox.stub();
    ApiErrorStub = sandbox.stub();
    JoiStub = {
      compile: sandbox.stub(),
    };

    validate = proxyquire("../../src/middlewares/validate", {
      "../utils": { pick: pickStub, ApiError: ApiErrorStub },
      joi: JoiStub,
    });
  });

  afterEach(() => sandbox.restore());

  it("should call next() with no error when validation passes", () => {
    const schema = { body: {} };
    const req = { body: { a: 1 } };
    const res = {};
    const next = sandbox.stub();

    // mock behavior
    pickStub.onFirstCall().returns(schema);
    pickStub.onSecondCall().returns(req);
    JoiStub.compile.returns({
      prefs: () => ({
        validate: () => ({ value: { body: { a: 1 } }, error: null }),
      }),
    });

    validate(schema)(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(ApiErrorStub.called).to.be.false;
    expect(req.body).to.deep.equal({ a: 1 });
  });

  it("should call next() with ApiError when validation fails", () => {
    const schema = { body: {} };
    const req = { body: {} };
    const res = {};
    const next = sandbox.stub();

    const fakeError = {
      details: [{ message: "field is required" }, { message: "invalid" }],
    };

    pickStub.onFirstCall().returns(schema);
    pickStub.onSecondCall().returns(req);

    JoiStub.compile.returns({
      prefs: () => ({
        validate: () => ({ value: {}, error: fakeError }),
      }),
    });

    const fakeApiError = { message: "bad request" };
    ApiErrorStub.returns(fakeApiError);

    validate(schema)(req, res, next);

    expect(ApiErrorStub.calledOnceWith(httpStatus.BAD_REQUEST)).to.be.true;
    expect(next.calledOnceWith(fakeApiError)).to.be.true;
  });

  it("should merge validated values back into req", () => {
    const schema = { query: {}, params: {} };
    const req = { query: { q: "1" }, params: { id: "5" } };
    const res = {};
    const next = sandbox.stub();

    pickStub.onFirstCall().returns(schema);
    pickStub.onSecondCall().returns(req);

    JoiStub.compile.returns({
      prefs: () => ({
        validate: () => ({
          value: { query: { q: "1" }, params: { id: "5" } },
          error: null,
        }),
      }),
    });

    validate(schema)(req, res, next);

    expect(req.query.q).to.equal("1");
    expect(req.params.id).to.equal("5");
    expect(next.calledOnce).to.be.true;
  });
});
