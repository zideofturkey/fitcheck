const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("presetMealWithLines.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_presetmeal";
  const STORED_INDEX = "lrmwufitcheck_presetmealwithlines";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire("../../src/aggregates/presetMealWithLines.aggregate", {
      "common/elasticsearch": { elasticClient: esStub },
    });
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: presetMealWithLinesAggregateData
  // ==========================================================
  it("presetMealWithLinesAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = {
      id: "p1",
      userId: "userIdVal",
      templateName: "templateNameVal",
      descriptionText: "descriptionTextVal",
      totalCalories: "totalCaloriesVal",
      totalProtein: "totalProteinVal",
      totalCarbohydrates: "totalCarbohydratesVal",
      totalFat: "totalFatVal",
      totalSugar: "totalSugarVal",
      totalFiber: "totalFiberVal",
      createdAt: "createdAtVal",
      updatedAt: "updatedAtVal",
    };

    if ("foodItemId" !== "id") {
      baseSource["foodItemId"] = "dummyParent";
    }

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
              foodName: "foodNameVal",
              caloriePer100g: "caloriePer100gVal",
              proteinPer100g: "proteinPer100gVal",
              carbohydratePer100g: "carbohydratePer100gVal",
              fatPer100g: "fatPer100gVal",
              sugarPer100g: "sugarPer100gVal",
              fiberPer100g: "fiberPer100gVal",
              brandName: "brandNameVal",
              foodCategory: "foodCategoryVal",
            },
          },
          {
            _source: {
              id: "idVal2",
              foodName: "foodNameVal2",
              caloriePer100g: "caloriePer100gVal2",
              proteinPer100g: "proteinPer100gVal2",
              carbohydratePer100g: "carbohydratePer100gVal2",
              fatPer100g: "fatPer100gVal2",
              sugarPer100g: "sugarPer100gVal2",
              fiberPer100g: "fiberPer100gVal2",
              brandName: "brandNameVal2",
              foodCategory: "foodCategoryVal2",
            },
          },
        ],
      },
    });

    esStub.search.onCall(call++).resolves({
      hits: {
        hits: [
          {
            _source: {
              id: "idVal",
              foodItemId: "foodItemIdVal",
              lineFoodName: "lineFoodNameVal",
              gramAmount: "gramAmountVal",
              lineCalories: "lineCaloriesVal",
              lineProtein: "lineProteinVal",
              lineCarbohydrates: "lineCarbohydratesVal",
              lineFat: "lineFatVal",
              lineSugar: "lineSugarVal",
              lineFiber: "lineFiberVal",
            },
          },
          {
            _source: {
              id: "idVal2",
              foodItemId: "foodItemIdVal2",
              lineFoodName: "lineFoodNameVal2",
              gramAmount: "gramAmountVal2",
              lineCalories: "lineCaloriesVal2",
              lineProtein: "lineProteinVal2",
              lineCarbohydrates: "lineCarbohydratesVal2",
              lineFat: "lineFatVal2",
              lineSugar: "lineSugarVal2",
              lineFiber: "lineFiberVal2",
            },
          },
        ],
      },
    });

    esStub.index.resolves({ result: "created" });
    await mod.presetMealWithLinesAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");

    expect(idxArgs.body).to.have.property("foodItems");

    expect(idxArgs.body).to.have.property("lines");
  });

  it("foodItemsAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { foodItemId: "v1", id: "p1" };
    esStub.search.resolves({
      hits: {
        hits: [
          {
            _source: {
              id: "x",
              foodName: "x",
              caloriePer100g: "x",
              proteinPer100g: "x",
              carbohydratePer100g: "x",
              fatPer100g: "x",
              sugarPer100g: "x",
              fiberPer100g: "x",
              brandName: "x",
              foodCategory: "x",
            },
          },
        ],
      },
    });
    await mod.foodItemsAggregateDataFromIndex(source);

    expect(source).to.have.property("foodItems");
  });

  it("linesAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { id: "v1", id: "p1" };
    esStub.search.resolves({
      hits: {
        hits: [
          {
            _source: {
              id: "x",
              foodItemId: "x",
              lineFoodName: "x",
              gramAmount: "x",
              lineCalories: "x",
              lineProtein: "x",
              lineCarbohydrates: "x",
              lineFat: "x",
              lineSugar: "x",
              lineFiber: "x",
            },
          },
        ],
      },
    });
    await mod.linesAggregateDataFromIndex(source);

    expect(source).to.have.property("lines");
  });

  it("foodItemsRePresetMealWithLines re-enriches stored docs by child id", async () => {
    esStub.search
      .onCall(0)
      .resolves({
        hits: { hits: [{ id: "p1", _source: { id: "p1", foodItemId: "v1" } }] },
      });
    esStub.search
      .onCall(1)
      .resolves({
        hits: {
          hits: [
            {
              _source: {
                id: "x",
                foodName: "x",
                caloriePer100g: "x",
                proteinPer100g: "x",
                carbohydratePer100g: "x",
                fatPer100g: "x",
                sugarPer100g: "x",
                fiberPer100g: "x",
                brandName: "x",
                foodCategory: "x",
              },
            },
          ],
        },
      });
    esStub.index.resolves({ result: "updated" });

    await mod.foodItemsRePresetMealWithLines("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });

  it("linesRePresetMealWithLines re-enriches stored docs by child id", async () => {
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
                foodItemId: "x",
                lineFoodName: "x",
                gramAmount: "x",
                lineCalories: "x",
                lineProtein: "x",
                lineCarbohydrates: "x",
                lineFat: "x",
                lineSugar: "x",
                lineFiber: "x",
              },
            },
          ],
        },
      });
    esStub.index.resolves({ result: "updated" });

    await mod.linesRePresetMealWithLines("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });
});
