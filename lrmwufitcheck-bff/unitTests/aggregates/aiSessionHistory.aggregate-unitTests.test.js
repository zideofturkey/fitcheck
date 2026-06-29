const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("aiSessionHistory.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_aisession";
  const STORED_INDEX = "lrmwufitcheck_aisessionhistory";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire("../../src/aggregates/aiSessionHistory.aggregate", {
      "common/elasticsearch": { elasticClient: esStub },
    });
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: aiSessionHistoryAggregateData
  // ==========================================================
  it("aiSessionHistoryAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = {
      id: "p1",
      userId: "userIdVal",
      sessionType: "sessionTypeVal",
      inputText: "inputTextVal",
      detectedLanguage: "detectedLanguageVal",
      sessionState: "sessionStateVal",
      confidenceScore: "confidenceScoreVal",
      finalResponseText: "finalResponseTextVal",
      createdAt: "createdAtVal",
      updatedAt: "updatedAtVal",
    };

    if ("id" !== "id") {
      baseSource["id"] = "dummyParent";
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
              questionType: "questionTypeVal",
              contextRange: "contextRangeVal",
              answerSummary: "answerSummaryVal",
              cautionText: "cautionTextVal",
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
              proposedMealDate: "proposedMealDateVal",
              proposedSlotName: "proposedSlotNameVal",
              totalCalories: "totalCaloriesVal",
              confirmationRequired: "confirmationRequiredVal",
              warningText: "warningTextVal",
            },
          },
        ],
      },
    });

    esStub.index.resolves({ result: "created" });
    await mod.aiSessionHistoryAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");

    expect(idxArgs.body).to.have.property("guidanceNote");

    expect(idxArgs.body).to.have.property("candidateMeal");
  });

  it("guidanceNoteAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { id: "v1", id: "p1" };
    esStub.search.resolves({
      hits: {
        hits: [
          {
            _source: {
              id: "x",
              questionType: "x",
              contextRange: "x",
              answerSummary: "x",
              cautionText: "x",
            },
          },
        ],
      },
    });
    await mod.guidanceNoteAggregateDataFromIndex(source);

    expect(source).to.have.property("guidanceNote");
  });

  it("candidateMealAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { id: "v1", id: "p1" };
    esStub.search.resolves({
      hits: {
        hits: [
          {
            _source: {
              id: "x",
              proposedMealDate: "x",
              proposedSlotName: "x",
              totalCalories: "x",
              confirmationRequired: "x",
              warningText: "x",
            },
          },
        ],
      },
    });
    await mod.candidateMealAggregateDataFromIndex(source);

    expect(source).to.have.property("candidateMeal");
  });

  it("guidanceNoteReAiSessionHistory re-enriches stored docs by child id", async () => {
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
                questionType: "x",
                contextRange: "x",
                answerSummary: "x",
                cautionText: "x",
              },
            },
          ],
        },
      });
    esStub.index.resolves({ result: "updated" });

    await mod.guidanceNoteReAiSessionHistory("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });

  it("candidateMealReAiSessionHistory re-enriches stored docs by child id", async () => {
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
                proposedMealDate: "x",
                proposedSlotName: "x",
                totalCalories: "x",
                confirmationRequired: "x",
                warningText: "x",
              },
            },
          ],
        },
      });
    esStub.index.resolves({ result: "updated" });

    await mod.candidateMealReAiSessionHistory("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });
});
