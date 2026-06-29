const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("dailyMealReminderNotificationView.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_user";
  const STORED_INDEX = "lrmwufitcheck_dailymealremindernotificationview";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire(
      "../../src/aggregates/dailyMealReminderNotificationView.aggregate",
      {
        "common/elasticsearch": { elasticClient: esStub },
      },
    );
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: dailyMealReminderNotificationViewAggregateData
  // ==========================================================
  it("dailyMealReminderNotificationViewAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = { id: "p1", fullname: "fullnameVal", email: "emailVal" };

    if ("id" !== "id") {
      baseSource["id"] = "dummyParent";
    }

    esStub.search
      .onCall(0)
      .resolves({ hits: { hits: [{ _source: baseSource }] } });
    let call = 1;

    esStub.search.onCall(call++).resolves({
      hits: { hits: [{ _source: { mealCount: "mealCountVal" } }] },
    });

    esStub.index.resolves({ result: "created" });
    await mod.dailyMealReminderNotificationViewAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");

    expect(idxArgs.body).to.have.property("todayNutritionDay");
  });

  it("todayNutritionDayAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { id: "v1", id: "p1" };
    esStub.search.resolves({
      hits: { hits: [{ _source: { mealCount: "x" } }] },
    });
    await mod.todayNutritionDayAggregateDataFromIndex(source);

    expect(source).to.have.property("todayNutritionDay");
  });

  it("todayNutritionDayReDailyMealReminderNotificationView re-enriches stored docs by child id", async () => {
    esStub.search
      .onCall(0)
      .resolves({
        hits: { hits: [{ id: "p1", _source: { id: "p1", id: "v1" } }] },
      });
    esStub.search
      .onCall(1)
      .resolves({ hits: { hits: [{ _source: { mealCount: "x" } }] } });
    esStub.index.resolves({ result: "updated" });

    await mod.todayNutritionDayReDailyMealReminderNotificationView("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });
});
