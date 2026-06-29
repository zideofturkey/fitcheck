const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("PostgreSQL Utilities", () => {
  let syncStub, closeStub, authenticateStub;
  let startPostgres, syncModels, closePostgres;
  let clientStub;

  beforeEach(() => {
    syncStub = sinon.stub().resolves();
    closeStub = sinon.stub().resolves();
    authenticateStub = sinon.stub();

    const SequelizeFake = function () {
      return {
        sync: syncStub,
        close: closeStub,
        authenticate: authenticateStub,
      };
    };

    clientStub = {
      connect: sinon.stub().resolves(),
      query: sinon.stub().resolves(),
      end: sinon.stub().resolves(),
    };

    ({ startPostgres, syncModels, closePostgres } = proxyquire(
      "../../src/common/postgres",
      {
        sequelize: { Sequelize: SequelizeFake },
        pg: { Client: sinon.stub().returns(clientStub) },
      },
    ));
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call syncModels()", async () => {
    await syncModels();
    expect(syncStub.calledOnce).to.be.true;
  });

  it("should call closePostgres()", async () => {
    await closePostgres();
    expect(closeStub.calledOnce).to.be.true;
  });

  it("should attempt to create DB when startPostgres() fails with missing db error", async () => {
    authenticateStub
      .onFirstCall()
      .rejects(new Error('database "test" does not exist'));
    authenticateStub.onSecondCall().resolves();

    await startPostgres();

    expect(clientStub.connect.called).to.be.true;
    expect(clientStub.query.called).to.be.true;
    expect(clientStub.query.calledWithMatch(/CREATE DATABASE/)).to.be.true;
    expect(clientStub.end.called).to.be.true;
    expect(syncStub.called).to.be.true;
  });

  it("should log and continue if startPostgres() fails with unrelated error", async () => {
    authenticateStub.rejects(new Error("something else"));

    await startPostgres();

    expect(clientStub.connect.called).to.be.true;
    expect(syncStub.called).to.be.true;
  });

  it("should handle and log sync error", async () => {
    const err = new Error("sync fail");
    syncStub.rejects(err);

    await syncModels();
    expect(syncStub.calledOnce).to.be.true; // error logged but does not throw
  });
});
