const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("ParseMealRestController", () => {
  let parseMeal;
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

    parseMeal = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/aiSession/parse-meal-api.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        apiLayer: {
          ParseMealManager: sinon.stub(),
        },
        "../../NutritionAiServiceRestController": class {
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
    await parseMeal(req, res, next);

    expect(processRequestStub.calledOnce).to.be.true;
  });
});
