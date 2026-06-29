const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("monthlyAnalyticsView.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_nutritionday";
  const STORED_INDEX = "lrmwufitcheck_monthlyanalyticsview";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire("../../src/aggregates/monthlyAnalyticsView.aggregate", {
      "common/elasticsearch": { elasticClient: esStub },
    });
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: monthlyAnalyticsViewAggregateData
  // ==========================================================
  it("monthlyAnalyticsViewAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = {
      id: "p1",
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
    };

    esStub.search
      .onCall(0)
      .resolves({ hits: { hits: [{ _source: baseSource }] } });
    let call = 1;

    esStub.search.onCall(call++).resolves({
      aggregations: {
        avgDailyCalories: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        avgDailyProtein: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        avgDailyCarbohydrates: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        avgDailySugar: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        avgDailyFat: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        avgDailyFiber: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        goalHitRateProtein: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        goalHitRateCarbohydrates: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        goalHitRateCalories: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        goalHitRateFat: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        goalHitRateSugar: { value: 123 },
      },
    });

    esStub.search.onCall(call++).resolves({
      aggregations: {
        goalHitRateFiber: { value: 123 },
      },
    });

    esStub.index.resolves({ result: "created" });
    await mod.monthlyAnalyticsViewAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");

    expect(idxArgs.body).to.have.property("avgDailyCalories");

    expect(idxArgs.body).to.have.property("avgDailyProtein");

    expect(idxArgs.body).to.have.property("avgDailyCarbohydrates");

    expect(idxArgs.body).to.have.property("avgDailySugar");

    expect(idxArgs.body).to.have.property("avgDailyFat");

    expect(idxArgs.body).to.have.property("avgDailyFiber");

    expect(idxArgs.body).to.have.property("goalHitRateProtein");

    expect(idxArgs.body).to.have.property("goalHitRateCarbohydrates");

    expect(idxArgs.body).to.have.property("goalHitRateCalories");

    expect(idxArgs.body).to.have.property("goalHitRateFat");

    expect(idxArgs.body).to.have.property("goalHitRateSugar");

    expect(idxArgs.body).to.have.property("goalHitRateFiber");
  });

  it("avgDailyCaloriesStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        avgDailyCalories: { value: 777 },
      },
    });

    await mod.avgDailyCaloriesStatDataFromIndex(source);

    expect(source).to.have.property("avgDailyCalories");

    expect(source["avgDailyCalories"]).to.have.property(
      "avgDailyCalories",
      777,
    );
  });

  it("avgDailyProteinStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        avgDailyProtein: { value: 777 },
      },
    });

    await mod.avgDailyProteinStatDataFromIndex(source);

    expect(source).to.have.property("avgDailyProtein");

    expect(source["avgDailyProtein"]).to.have.property("avgDailyProtein", 777);
  });

  it("avgDailyCarbohydratesStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        avgDailyCarbohydrates: { value: 777 },
      },
    });

    await mod.avgDailyCarbohydratesStatDataFromIndex(source);

    expect(source).to.have.property("avgDailyCarbohydrates");

    expect(source["avgDailyCarbohydrates"]).to.have.property(
      "avgDailyCarbohydrates",
      777,
    );
  });

  it("avgDailySugarStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        avgDailySugar: { value: 777 },
      },
    });

    await mod.avgDailySugarStatDataFromIndex(source);

    expect(source).to.have.property("avgDailySugar");

    expect(source["avgDailySugar"]).to.have.property("avgDailySugar", 777);
  });

  it("avgDailyFatStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        avgDailyFat: { value: 777 },
      },
    });

    await mod.avgDailyFatStatDataFromIndex(source);

    expect(source).to.have.property("avgDailyFat");

    expect(source["avgDailyFat"]).to.have.property("avgDailyFat", 777);
  });

  it("avgDailyFiberStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        avgDailyFiber: { value: 777 },
      },
    });

    await mod.avgDailyFiberStatDataFromIndex(source);

    expect(source).to.have.property("avgDailyFiber");

    expect(source["avgDailyFiber"]).to.have.property("avgDailyFiber", 777);
  });

  it("goalHitRateProteinStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        goalHitRateProtein: { value: 777 },
      },
    });

    await mod.goalHitRateProteinStatDataFromIndex(source);

    expect(source).to.have.property("goalHitRateProtein");

    expect(source["goalHitRateProtein"]).to.have.property(
      "goalHitRateProtein",
      777,
    );
  });

  it("goalHitRateCarbohydratesStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        goalHitRateCarbohydrates: { value: 777 },
      },
    });

    await mod.goalHitRateCarbohydratesStatDataFromIndex(source);

    expect(source).to.have.property("goalHitRateCarbohydrates");

    expect(source["goalHitRateCarbohydrates"]).to.have.property(
      "goalHitRateCarbohydrates",
      777,
    );
  });

  it("goalHitRateCaloriesStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        goalHitRateCalories: { value: 777 },
      },
    });

    await mod.goalHitRateCaloriesStatDataFromIndex(source);

    expect(source).to.have.property("goalHitRateCalories");

    expect(source["goalHitRateCalories"]).to.have.property(
      "goalHitRateCalories",
      777,
    );
  });

  it("goalHitRateFatStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        goalHitRateFat: { value: 777 },
      },
    });

    await mod.goalHitRateFatStatDataFromIndex(source);

    expect(source).to.have.property("goalHitRateFat");

    expect(source["goalHitRateFat"]).to.have.property("goalHitRateFat", 777);
  });

  it("goalHitRateSugarStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        goalHitRateSugar: { value: 777 },
      },
    });

    await mod.goalHitRateSugarStatDataFromIndex(source);

    expect(source).to.have.property("goalHitRateSugar");

    expect(source["goalHitRateSugar"]).to.have.property(
      "goalHitRateSugar",
      777,
    );
  });

  it("goalHitRateFiberStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        goalHitRateFiber: { value: 777 },
      },
    });

    await mod.goalHitRateFiberStatDataFromIndex(source);

    expect(source).to.have.property("goalHitRateFiber");

    expect(source["goalHitRateFiber"]).to.have.property(
      "goalHitRateFiber",
      777,
    );
  });
});
