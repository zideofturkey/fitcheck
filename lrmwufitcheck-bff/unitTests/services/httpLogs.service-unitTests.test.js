const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const httpStatus = require("http-status");

describe("lrmwufitcheck http logs service", () => {
  let sandbox;
  let elasticStub;
  let ApiErrorStub;
  let handlers;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    elasticStub = {
      search: sandbox.stub(),
      count: sandbox.stub(),
      checkIndexExists: sandbox.stub(),
      createIndex: sandbox.stub(),
      queryBuilder: sandbox.stub(),
      searchBuilder: sandbox.stub(),
    };

    ApiErrorStub = sandbox.stub();

    handlers = proxyquire("../../src/services/httpLogs.service", {
      "common/elasticsearch": elasticStub,
      "common/ApiError": ApiErrorStub,
    });
  });

  afterEach(() => sandbox.restore());

  // --------------------------------------------------------------------
  describe("searchLogs", () => {
    it("creates index and returns empty result when index doesn't exist", async () => {
      elasticStub.checkIndexExists.resolves(false);
      elasticStub.createIndex.resolves();

      const result = await handlers.searchLogs({ page: 1, limit: 10 });
      expect(result.logs).to.deep.equal([]);
      expect(result.total).to.equal(0);
      expect(elasticStub.createIndex.calledOnce).to.be.true;
    });

    it("returns formatted logs when index exists", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.queryBuilder.returns({
        bool: { must: [], filter: [], should: [], must_not: [] },
      });
      elasticStub.searchBuilder.returns({
        bool: { must: [], filter: [], should: [], must_not: [] },
      });
      elasticStub.search.resolves({
        hits: {
          hits: [{ _id: "1", _score: 1, _source: { message: "ok" } }],
        },
      });
      elasticStub.count.resolves({ count: 1 });

      const result = await handlers.searchLogs({
        q: "test",
        page: 1,
        limit: 10,
      });
      expect(result.logs[0]).to.include({ _id: "1", _score: 1 });
      expect(result.total).to.equal(1);
      expect(result.totalPages).to.equal(1);
    });

    it("throws ApiError on search failure", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.queryBuilder.returns({
        bool: { must: [], filter: [], should: [], must_not: [] },
      });
      elasticStub.search.rejects(new Error("ES failed"));

      try {
        await handlers.searchLogs({});
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnceWith(httpStatus.INTERNAL_SERVER_ERROR)).to
          .be.true;
      }
    });
  });

  // --------------------------------------------------------------------
  describe("getLogsStats", () => {
    it("returns zero stats when index does not exist", async () => {
      elasticStub.checkIndexExists.resolves(false);

      const result = await handlers.getLogsStats();
      expect(result.totalLogs).to.equal(0);
      expect(result.totalErrors).to.equal(0);
    });

    it("returns stats aggregations when index exists", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.search.resolves({
        hits: { total: { value: 20 } },
        aggregations: {
          by_subject: { buckets: [{ key: "RestRequestReceived" }] },
          by_method: { buckets: [{ key: "GET" }] },
          by_status: { buckets: [{ key: 200 }] },
        },
      });

      const result = await handlers.getLogsStats();
      expect(result.totalLogs).to.equal(20);
      expect(result.aggregations.bySubject[0].key).to.equal(
        "RestRequestReceived",
      );
      expect(result.aggregations.byMethod[0].key).to.equal("GET");
      expect(result.aggregations.byStatus[0].key).to.equal(200);
    });

    it("throws ApiError on failure", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.search.rejects(new Error("Search failed"));

      try {
        await handlers.getLogsStats();
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnceWith(httpStatus.INTERNAL_SERVER_ERROR)).to
          .be.true;
      }
    });
  });

  // --------------------------------------------------------------------
  describe("getPairedLogs", () => {
    it("throws NOT_FOUND when index missing", async () => {
      elasticStub.checkIndexExists.resolves(false);

      try {
        await handlers.getPairedLogs("abc-123");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnceWith(httpStatus.NOT_FOUND)).to.be.true;
      }
    });

    it("throws NOT_FOUND when no logs found", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.search.resolves({ hits: { hits: [] } });

      try {
        await handlers.getPairedLogs("abc-123");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnceWith(httpStatus.NOT_FOUND)).to.be.true;
      }
    });

    it("returns paired logs grouped by logSource", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.search.resolves({
        hits: {
          hits: [
            { _source: { logSource: "api", subject: "RestRequestReceived" } },
            { _source: { logSource: "api", subject: "RestRequestResponded" } },
          ],
        },
      });

      const result = await handlers.getPairedLogs("abc-123");
      expect(result[0].logSource).to.equal("api");
      expect(result[0].request.subject).to.equal("RestRequestReceived");
      expect(result[0].response.subject).to.equal("RestRequestResponded");
    });

    it("throws internal error when unexpected error occurs", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.search.rejects(new Error("Unexpected failure"));

      try {
        await handlers.getPairedLogs("abc-123");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnceWith(httpStatus.INTERNAL_SERVER_ERROR)).to
          .be.true;
      }
    });
  });
});
