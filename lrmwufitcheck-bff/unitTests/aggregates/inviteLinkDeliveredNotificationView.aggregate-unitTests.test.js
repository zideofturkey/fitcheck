const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("inviteLinkDeliveredNotificationView.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_invitelink";
  const STORED_INDEX = "lrmwufitcheck_invitelinkdeliverednotificationview";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire(
      "../../src/aggregates/inviteLinkDeliveredNotificationView.aggregate",
      {
        "common/elasticsearch": { elasticClient: esStub },
      },
    );
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: inviteLinkDeliveredNotificationViewAggregateData
  // ==========================================================
  it("inviteLinkDeliveredNotificationViewAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = {
      id: "p1",
      inviteCode: "inviteCodeVal",
      invitedEmail: "invitedEmailVal",
      usageMode: "usageModeVal",
      usageLimit: "usageLimitVal",
      inviteState: "inviteStateVal",
      expiresAt: "expiresAtVal",
    };

    esStub.search
      .onCall(0)
      .resolves({ hits: { hits: [{ _source: baseSource }] } });
    let call = 1;

    esStub.index.resolves({ result: "created" });
    await mod.inviteLinkDeliveredNotificationViewAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");
  });
});
