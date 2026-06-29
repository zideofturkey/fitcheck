const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const httpStatus = require("http-status");

describe("lrmwufitcheck elasticHandlers", () => {
  let sandbox;
  let elasticStub;
  let ApiErrorStub;
  let handlers;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    elasticStub = {
      checkIndexExists: sandbox.stub(),
      queryBuilder: sandbox.stub(),
      aggBuilder: sandbox.stub(),
      searchBuilder: sandbox.stub(),
      search: sandbox.stub(),
      count: sandbox.stub(),
      checkIndexMapping: sandbox.stub(),
      fieldBuilder: sandbox.stub(),
      createDocument: sandbox.stub(),
      deleteDocument: sandbox.stub(),
      getAllIndices: sandbox.stub(),
    };

    ApiErrorStub = sandbox.stub();

    handlers = proxyquire("../../src/services/dynamic.service", {
      "common/elasticsearch": elasticStub,
      "common/ApiError": ApiErrorStub,
    });
  });

  afterEach(() => sandbox.restore());

  describe("handleGetAllIndices", () => {
    it("filters indices by project codename prefix", async () => {
      elasticStub.getAllIndices.resolves([
        { index: "lrmwufitcheck_a" },
        { index: "other_index" },
      ]);

      const result = await handlers.handleGetAllIndices();
      expect(result).to.deep.equal(["lrmwufitcheck_a"]);
    });
  });

  describe("handleGetElasticIndex", () => {
    it("throws NOT_FOUND if index does not exist", async () => {
      elasticStub.checkIndexExists.resolves(false);

      try {
        await handlers.handleGetElasticIndex("products", "123");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
      }
    });

    it("throws NOT_FOUND if no hits returned", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.search.resolves({ hits: { total: { value: 0 } } });

      try {
        await handlers.handleGetElasticIndex("products", "123");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
      }
    });

    it("returns first hit source when found", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.search.resolves({
        hits: { total: { value: 1 }, hits: [{ _source: { id: 1 } }] },
      });

      const result = await handlers.handleGetElasticIndex("products", "123");
      expect(result).to.deep.equal({ id: 1 });
    });
  });

  describe("handleListElasticIndex", () => {
    it("throws NOT_FOUND when index missing", async () => {
      elasticStub.checkIndexExists.resolves(false);

      try {
        await handlers.handleListElasticIndex("x");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
      }
    });

    it("returns paginated data when found", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.queryBuilder.returns({ q: 1 });
      elasticStub.searchBuilder.returns({ match_all: {} });
      elasticStub.aggBuilder.returns({});
      elasticStub.search.resolves({
        hits: {
          hits: [{ _source: { id: 1 } }],
          total: { value: 1 },
        },
        aggregations: {},
      });

      const result = await handlers.handleListElasticIndex(
        "p",
        1,
        10,
        "",
        null,
        {},
        [],
      );
      expect(result.items).to.deep.equal([{ id: 1 }]);
      expect(result.total).to.equal(1);
    });

    it("builds filters from aggregations", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.queryBuilder.returns({});
      elasticStub.searchBuilder.returns({});
      elasticStub.aggBuilder.returns({});
      elasticStub.search.resolves({
        hits: { hits: [], total: { value: 0 } },
        aggregations: {
          category: {
            buckets: [
              { key: "A", doc_count: 5 },
              { key_as_string: "B", doc_count: 3 },
            ],
          },
        },
      });

      const res = await handlers.handleListElasticIndex(
        "p",
        1,
        10,
        "",
        null,
        {},
        ["category"],
      );
      expect(res.filters[0].items.length).to.equal(2);
    });
  });

  describe("handleCountElasticIndex", () => {
    it("throws if index not exist", async () => {
      elasticStub.checkIndexExists.resolves(false);

      try {
        await handlers.handleCountElasticIndex("x");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
      }
    });

    it("throws if count = 0", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.queryBuilder.returns({});
      elasticStub.searchBuilder.returns({});
      elasticStub.count.resolves({ count: 0 });

      try {
        await handlers.handleCountElasticIndex("p");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
      }
    });

    it("returns total when count > 0", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.queryBuilder.returns({});
      elasticStub.searchBuilder.returns({});
      elasticStub.count.resolves({ count: 42 });

      const result = await handlers.handleCountElasticIndex("p");
      expect(result).to.deep.equal({ total: 42 });
    });
  });

  describe("handleElasticIndexSchema", () => {
    it("throws if index missing", async () => {
      elasticStub.checkIndexExists.resolves(false);

      try {
        await handlers.handleElasticIndexSchema("p");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
      }
    });

    it("throws if mapping missing", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.checkIndexMapping.resolves(null);

      try {
        await handlers.handleElasticIndexSchema("p");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
      }
    });

    it("returns filtirable and sortable fields", async () => {
      elasticStub.checkIndexExists.resolves(true);
      elasticStub.checkIndexMapping.resolves({
        lrmwufitcheck_p: {
          mappings: { properties: { name: { type: "text" } } },
        },
      });
      elasticStub.fieldBuilder.returns(["name"]);
      const result = await handlers.handleElasticIndexSchema("p");
      expect(result.filtirableFields).to.deep.equal(["name"]);
      expect(result.sortableFields).to.deep.equal(["name"]);
    });
  });

  describe("handleGetFiltersElasticIndex", () => {
    it("returns paginated filter results", async () => {
      elasticStub.search.resolves({
        hits: {
          hits: [{ _source: { key: "a" } }],
          total: { value: 1 },
        },
      });

      const result = await handlers.handleGetFiltersElasticIndex(
        "p",
        "u1",
        1,
        10,
      );
      expect(result.items[0]).to.deep.equal({ key: "a" });
      expect(result.total).to.equal(1);
    });
  });

  describe("handleSaveFiltersElasticIndex", () => {
    it("creates filter document", async () => {
      elasticStub.createDocument.resolves({ id: "1" });
      const result = await handlers.handleSaveFiltersElasticIndex("p", "u1", {
        f: 1,
      });
      expect(result).to.deep.equal({ id: "1" });
      expect(elasticStub.createDocument.calledOnce).to.be.true;
    });
  });

  describe("handleDeleteFiltersElasticIndex", () => {
    it("throws if filter not found", async () => {
      elasticStub.search.resolves({ hits: { total: { value: 0 } } });

      try {
        await handlers.handleDeleteFiltersElasticIndex("p", "u1", "f1");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
      }
    });

    it("calls deleteDocument if filter found", async () => {
      elasticStub.search.resolves({
        hits: { total: { value: 1 }, hits: [{ _id: "f1" }] },
      });
      elasticStub.deleteDocument.resolves();

      await handlers.handleDeleteFiltersElasticIndex("p", "u1", "f1");
      expect(elasticStub.deleteDocument.calledOnceWith("filter_indexs", "f1"))
        .to.be.true;
    });
  });
});
