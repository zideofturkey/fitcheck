const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("aiCandidateMealWithLines.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_aicandidatemeal";
  const STORED_INDEX = "lrmwufitcheck_aicandidatemealwithlines";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire(
      "../../src/aggregates/aiCandidateMealWithLines.aggregate",
      {
        "common/elasticsearch": { elasticClient: esStub },
      },
    );
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: aiCandidateMealWithLinesAggregateData
  // ==========================================================
  it("aiCandidateMealWithLinesAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = {
      id: "p1",
      userId: "userIdVal",
      aiSessionId: "aiSessionIdVal",
      proposedMealDate: "proposedMealDateVal",
      proposedMealTime: "proposedMealTimeVal",
      proposedSlotName: "proposedSlotNameVal",
      candidateSource: "candidateSourceVal",
      warningText: "warningTextVal",
      confirmationRequired: "confirmationRequiredVal",
      isConfirmed: "isConfirmedVal",
      isCommitted: "isCommittedVal",
      totalCalories: "totalCaloriesVal",
      totalProtein: "totalProteinVal",
      totalCarbohydrates: "totalCarbohydratesVal",
      totalFat: "totalFatVal",
      totalSugar: "totalSugarVal",
      totalFiber: "totalFiberVal",
      committedMealLogId: "committedMealLogIdVal",
      createdAt: "createdAtVal",
      updatedAt: "updatedAtVal",
    };

    if ("aiSessionId" !== "id") {
      baseSource["aiSessionId"] = "dummyParent";
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
              sessionType: "sessionTypeVal",
              inputText: "inputTextVal",
              sessionState: "sessionStateVal",
              confidenceScore: "confidenceScoreVal",
              detectedLanguage: "detectedLanguageVal",
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
              detectedFoodName: "detectedFoodNameVal",
              estimatedGrams: "estimatedGramsVal",
              estimatedCalories: "estimatedCaloriesVal",
              estimatedProtein: "estimatedProteinVal",
              estimatedCarbohydrates: "estimatedCarbohydratesVal",
              estimatedFat: "estimatedFatVal",
              estimatedSugar: "estimatedSugarVal",
              estimatedFiber: "estimatedFiberVal",
              quantityConfidence: "quantityConfidenceVal",
              nutritionReference: "nutritionReferenceVal",
              saveAsFood: "saveAsFoodVal",
            },
          },
          {
            _source: {
              id: "idVal2",
              detectedFoodName: "detectedFoodNameVal2",
              estimatedGrams: "estimatedGramsVal2",
              estimatedCalories: "estimatedCaloriesVal2",
              estimatedProtein: "estimatedProteinVal2",
              estimatedCarbohydrates: "estimatedCarbohydratesVal2",
              estimatedFat: "estimatedFatVal2",
              estimatedSugar: "estimatedSugarVal2",
              estimatedFiber: "estimatedFiberVal2",
              quantityConfidence: "quantityConfidenceVal2",
              nutritionReference: "nutritionReferenceVal2",
              saveAsFood: "saveAsFoodVal2",
            },
          },
        ],
      },
    });

    esStub.index.resolves({ result: "created" });
    await mod.aiCandidateMealWithLinesAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");

    expect(idxArgs.body).to.have.property("session");

    expect(idxArgs.body).to.have.property("lines");
  });

  it("sessionAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { aiSessionId: "v1", id: "p1" };
    esStub.search.resolves({
      hits: {
        hits: [
          {
            _source: {
              id: "x",
              sessionType: "x",
              inputText: "x",
              sessionState: "x",
              confidenceScore: "x",
              detectedLanguage: "x",
            },
          },
        ],
      },
    });
    await mod.sessionAggregateDataFromIndex(source);

    expect(source).to.have.property("session");
  });

  it("linesAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { id: "v1", id: "p1" };
    esStub.search.resolves({
      hits: {
        hits: [
          {
            _source: {
              id: "x",
              detectedFoodName: "x",
              estimatedGrams: "x",
              estimatedCalories: "x",
              estimatedProtein: "x",
              estimatedCarbohydrates: "x",
              estimatedFat: "x",
              estimatedSugar: "x",
              estimatedFiber: "x",
              quantityConfidence: "x",
              nutritionReference: "x",
              saveAsFood: "x",
            },
          },
        ],
      },
    });
    await mod.linesAggregateDataFromIndex(source);

    expect(source).to.have.property("lines");
  });

  it("sessionReAiCandidateMealWithLines re-enriches stored docs by child id", async () => {
    esStub.search
      .onCall(0)
      .resolves({
        hits: {
          hits: [{ id: "p1", _source: { id: "p1", aiSessionId: "v1" } }],
        },
      });
    esStub.search
      .onCall(1)
      .resolves({
        hits: {
          hits: [
            {
              _source: {
                id: "x",
                sessionType: "x",
                inputText: "x",
                sessionState: "x",
                confidenceScore: "x",
                detectedLanguage: "x",
              },
            },
          ],
        },
      });
    esStub.index.resolves({ result: "updated" });

    await mod.sessionReAiCandidateMealWithLines("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });

  it("linesReAiCandidateMealWithLines re-enriches stored docs by child id", async () => {
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
                detectedFoodName: "x",
                estimatedGrams: "x",
                estimatedCalories: "x",
                estimatedProtein: "x",
                estimatedCarbohydrates: "x",
                estimatedFat: "x",
                estimatedSugar: "x",
                estimatedFiber: "x",
                quantityConfidence: "x",
                nutritionReference: "x",
                saveAsFood: "x",
              },
            },
          ],
        },
      });
    esStub.index.resolves({ result: "updated" });

    await mod.linesReAiCandidateMealWithLines("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });
});
