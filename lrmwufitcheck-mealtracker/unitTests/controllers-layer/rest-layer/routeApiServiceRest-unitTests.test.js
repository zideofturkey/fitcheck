const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("CreateMealLogRestController", () => {
  let createMealLog;
  let processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    processRequestStub = sinon.stub();

    createMealLog = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/mealLog/create-meallog-api.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        apiLayer: {
          CreateMealLogManager: sinon.stub(),
        },
        "../../MealTrackerServiceRestController": class {
          constructor(name, routeName, _req, _res, _next) {
            this._req = _req;
            this._res = _res;
            this._next = _next;
            this.processRequest = processRequestStub;
          }
        },
      },
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create instance and call processRequest", async () => {
    await createMealLog(req, res, next);

    expect(processRequestStub.calledOnce).to.be.true;
  });
});
