const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("foodItemList.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_fooditem";
  const STORED_INDEX = "lrmwufitcheck_fooditemlist";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire("../../src/aggregates/foodItemList.aggregate", {
      "common/elasticsearch": { elasticClient: esStub },
    });
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: foodItemListAggregateData
  // ==========================================================
  it("foodItemListAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = {
      id: "p1",
      userId: "userIdVal",
      foodName: "foodNameVal",
      caloriePer100g: "caloriePer100gVal",
      proteinPer100g: "proteinPer100gVal",
      carbohydratePer100g: "carbohydratePer100gVal",
      fatPer100g: "fatPer100gVal",
      sugarPer100g: "sugarPer100gVal",
      fiberPer100g: "fiberPer100gVal",
      brandName: "brandNameVal",
      foodCategory: "foodCategoryVal",
      creationSource: "creationSourceVal",
      createdAt: "createdAtVal",
      updatedAt: "updatedAtVal",
    };

    esStub.search
      .onCall(0)
      .resolves({ hits: { hits: [{ _source: baseSource }] } });
    let call = 1;

    esStub.search.onCall(call++).resolves({
      aggregations: {
        rowCount: { value: 123 },
      },
    });

    esStub.index.resolves({ result: "created" });
    await mod.foodItemListAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");

    expect(idxArgs.body).to.have.property("rowCount");
  });

  it("rowCountStatDataFromIndex writes stats object (stored view)", async () => {
    const source = { id: "p1" };

    esStub.search.resolves({
      aggregations: {
        rowCount: { value: 777 },
      },
    });

    await mod.rowCountStatDataFromIndex(source);

    expect(source).to.have.property("rowCount");

    expect(source["rowCount"]).to.have.property("rowCount", 777);
  });
});
