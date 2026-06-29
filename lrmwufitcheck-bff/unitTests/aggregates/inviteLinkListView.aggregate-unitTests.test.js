const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("inviteLinkListView.aggregate", () => {
  let sandbox;
  let esStub;
  let mod; // module under test

  const MAIN_INDEX = "lrmwufitcheck_invitelink";
  const STORED_INDEX = "lrmwufitcheck_invitelinklistview";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    esStub = {
      search: sandbox.stub(),
      index: sandbox.stub(),
    };

    mod = proxyquire("../../src/aggregates/inviteLinkListView.aggregate", {
      "common/elasticsearch": { elasticClient: esStub },
    });
  });

  afterEach(() => sandbox.restore());

  // ==========================================================
  // STORED VIEW: inviteLinkListViewAggregateData
  // ==========================================================
  it("inviteLinkListViewAggregateData indexes enriched docs to stored index", async () => {
    const baseSource = {
      id: "p1",
      inviteCode: "inviteCodeVal",
      invitedEmail: "invitedEmailVal",
      usageMode: "usageModeVal",
      usageLimit: "usageLimitVal",
      usageCount: "usageCountVal",
      inviteState: "inviteStateVal",
      expiresAt: "expiresAtVal",
      lastUsedAt: "lastUsedAtVal",
      registeredUserId: "registeredUserIdVal",
      deliveryRequestedAt: "deliveryRequestedAtVal",
      lastDeliveredAt: "lastDeliveredAtVal",
      createdAt: "createdAtVal",
      updatedAt: "updatedAtVal",
      isActive: "isActiveVal",
    };

    if ("registeredUserId" !== "id") {
      baseSource["registeredUserId"] = "dummyParent";
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
    await mod.inviteLinkListViewAggregateData("p1");

    expect(esStub.index.calledOnce).to.be.true;
    const idxArgs = esStub.index.getCall(0).args[0];
    expect(idxArgs.index).to.equal(STORED_INDEX);
    expect(idxArgs.id).to.equal("p1");
    expect(idxArgs.body).to.be.an("object");

    expect(idxArgs.body).to.have.property("registeredUser");
  });

  it("registeredUserAggregateDataFromIndex enriches source (stored view)", async () => {
    const source = { registeredUserId: "v1", id: "p1" };
    esStub.search.resolves({
      hits: { hits: [{ _source: { id: "x", fullname: "x", email: "x" } }] },
    });
    await mod.registeredUserAggregateDataFromIndex(source);

    expect(source).to.have.property("registeredUser");
  });

  it("registeredUserReInviteLinkListView re-enriches stored docs by child id", async () => {
    esStub.search
      .onCall(0)
      .resolves({
        hits: {
          hits: [{ id: "p1", _source: { id: "p1", registeredUserId: "v1" } }],
        },
      });
    esStub.search
      .onCall(1)
      .resolves({
        hits: { hits: [{ _source: { id: "x", fullname: "x", email: "x" } }] },
      });
    esStub.index.resolves({ result: "updated" });

    await mod.registeredUserReInviteLinkListView("child-1");
    expect(esStub.index.calledOnce).to.be.true;
    const args = esStub.index.getCall(0).args[0];
    expect(args.index).to.equal(STORED_INDEX);
  });
});
