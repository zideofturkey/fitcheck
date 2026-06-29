const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("mealLogWithLines.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_meallog";
  const STORED_INDEX = "lrmwufitcheck_meallogwithlines";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire("../../src/aggregates/mealLogWithLines.aggregate", {
      "common/elasticsearch": { elasticClient: esStub },
    });
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: mealLogWithLinesAggregateData
  // ==========================================================
  it("mealLogWithLinesAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = {
      id: "p1",
      userId: "userIdVal",
      mealDate: "mealDateVal",
      mealTime: "mealTimeVal",
      slotName: "slotNameVal",
      logSource: "logSourceVal",
      noteText: "noteTextVal",
      totalCalories: "totalCaloriesVal",
      totalProtein: "totalProteinVal",
      totalCarbohydrates: "totalCarbohydratesVal",
      totalFat: "totalFatVal",
      totalSugar: "totalSugarVal",
      totalFiber: "totalFiberVal",
      createdAt: "createdAtVal",
      updatedAt: "updatedAtVal",
    };

    if ("id" !== "id") {
      baseSource["id"] = "dummyParent";
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
              itemName: "itemNameVal",
              consumedGrams: "consumedGramsVal",
              itemCalories: "itemCaloriesVal",
              itemProtein: "itemProteinVal",
              itemCarbohydrates: "itemCarbohydratesVal",
              itemFat: "itemFatVal",
              itemSugar: "itemSugarVal",
              itemFiber: "itemFiberVal",
              lineSource: "lineSourceVal",
              sourceFoodItemId: "sourceFoodItemIdVal",
              sourcePresetMealId: "sourcePresetMealIdVal",
            },
          },
          {
            _source: {
              id: "idVal2",
              itemName: "itemNameVal2",
              consumedGrams: "consumedGramsVal2",
              itemCalories: "itemCaloriesVal2",
              itemProtein: "itemProteinVal2",
              itemCarbohydrates: "itemCarbohydratesVal2",
              itemFat: "itemFatVal2",
              itemSugar: "itemSugarVal2",
              itemFiber: "itemFiberVal2",
              lineSource: "lineSourceVal2",
              sourceFoodItemId: "sourceFoodItemIdVal2",
              sourcePresetMealId: "sourcePresetMealIdVal2",
            },
          },
        ],
      },
    });

    esStub.index.resolves({ result: "created" });
    await mod.mealLogWithLinesAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");

    expect(idxArgs.body).to.have.property("mealLines");
  });

  it("mealLinesAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { id: "v1", id: "p1" };
    esStub.search.resolves({
      hits: {
        hits: [
          {
            _source: {
              id: "x",
              itemName: "x",
              consumedGrams: "x",
              itemCalories: "x",
              itemProtein: "x",
              itemCarbohydrates: "x",
              itemFat: "x",
              itemSugar: "x",
              itemFiber: "x",
              lineSource: "x",
              sourceFoodItemId: "x",
              sourcePresetMealId: "x",
            },
          },
        ],
      },
    });
    await mod.mealLinesAggregateDataFromIndex(source);

    expect(source).to.have.property("mealLines");
  });

  it("mealLinesReMealLogWithLines re-enriches stored docs by child id", async () => {
    esStub.search
      .onCall(0)
      .resolves({
        hits: { hits: [{ id: "p1", _source: { id: "p1", id: "v1" } }] },
      });
    esStub.search
      .onCall(1)
      .resolves({
        hits: {
          hits: [
            {
              _source: {
                id: "x",
                itemName: "x",
                consumedGrams: "x",
                itemCalories: "x",
                itemProtein: "x",
                itemCarbohydrates: "x",
                itemFat: "x",
                itemSugar: "x",
                itemFiber: "x",
                lineSource: "x",
                sourceFoodItemId: "x",
                sourcePresetMealId: "x",
              },
            },
          ],
        },
      });
    esStub.index.resolves({ result: "updated" });

    await mod.mealLinesReMealLogWithLines("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });
});
