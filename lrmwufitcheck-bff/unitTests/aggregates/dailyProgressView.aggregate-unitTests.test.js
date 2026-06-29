const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("dailyProgressView.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_nutritionday";
  const STORED_INDEX = "lrmwufitcheck_dailyprogressview";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire("../../src/aggregates/dailyProgressView.aggregate", {
      "common/elasticsearch": { elasticClient: esStub },
    });
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: dailyProgressViewAggregateData
  // ==========================================================
  it("dailyProgressViewAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = {
      id: "p1",
      userId: "userIdVal",
      summaryDate: "summaryDateVal",
      consumedCalories: "consumedCaloriesVal",
      consumedProtein: "consumedProteinVal",
      consumedCarbohydrates: "consumedCarbohydratesVal",
      consumedFat: "consumedFatVal",
      consumedSugar: "consumedSugarVal",
      consumedFiber: "consumedFiberVal",
      targetCalories: "targetCaloriesVal",
      targetProtein: "targetProteinVal",
      targetCarbohydrates: "targetCarbohydratesVal",
      targetFat: "targetFatVal",
      targetSugar: "targetSugarVal",
      targetFiber: "targetFiberVal",
      exceededMetrics: "exceededMetricsVal",
      mealCount: "mealCountVal",
      createdAt: "createdAtVal",
      updatedAt: "updatedAtVal",
    };

    if ("userId" !== "id") {
      baseSource["userId"] = "dummyParent";
    }

    esStub.search
      .onCall(0)
      .resolves({ hits: { hits: [{ _source: baseSource }] } });
    let call = 1;

    esStub.search.onCall(call++).resolves({
      hits: {
        hits: [
          {
            _source: {
              id: "idVal",
              fullname: "fullnameVal",
              email: "emailVal",
            },
          },
        ],
      },
    });

    esStub.index.resolves({ result: "created" });
    await mod.dailyProgressViewAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");

    expect(idxArgs.body).to.have.property("userProfile");
  });

  it("userProfileAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { userId: "v1", id: "p1" };
    esStub.search.resolves({
      hits: { hits: [{ _source: { id: "x", fullname: "x", email: "x" } }] },
    });
    await mod.userProfileAggregateDataFromIndex(source);

    expect(source).to.have.property("userProfile");
  });

  it("userProfileReDailyProgressView re-enriches stored docs by child id", async () => {
    esStub.search
      .onCall(0)
      .resolves({
        hits: { hits: [{ id: "p1", _source: { id: "p1", userId: "v1" } }] },
      });
    esStub.search
      .onCall(1)
      .resolves({
        hits: { hits: [{ _source: { id: "x", fullname: "x", email: "x" } }] },
      });
    esStub.index.resolves({ result: "updated" });

    await mod.userProfileReDailyProgressView("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });
});
