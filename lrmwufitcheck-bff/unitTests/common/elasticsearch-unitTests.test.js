const { expect } = require("chai");

// import only pure functions, not the client
const {
  queryBuilder,
  aggBuilder,
  searchBuilder,
  filterBuilder,
  fieldBuilder,
  multiSearchBuilder,
} = require("../../src/common/elasticsearch");

describe("Elasticsearch query builders", () => {
  describe("queryBuilder", () => {
    it("builds eq and noteq correctly", () => {
      const filters = {
        name: { operator: "eq", value: "john" },
        status: { operator: "noteq", value: "inactive" },
      };
      const q = queryBuilder(filters);
      expect(q.bool.must[0]).to.deep.equal({ match: { name: "john" } });
      expect(q.bool.must_not[0]).to.deep.equal({
        match: { status: "inactive" },
      });
    });

    it("adds range query when two values given", () => {
      const filters = {
        age: { operator: "range", values: [18, 30] },
      };
      const q = queryBuilder(filters);
      expect(q.bool.filter[0]).to.have.property("range");
      expect(q.bool.filter[0].range.age).to.deep.equal({ gte: 18, lte: 30 });
    });

    it("handles exists and missing correctly", () => {
      const filters = {
        title: { operator: "exists" },
        description: { operator: "missing" },
      };
      const q = queryBuilder(filters);
      expect(q.bool.filter[0]).to.deep.equal({ exists: { field: "title" } });
      expect(q.bool.must_not[0]).to.deep.equal({
        exists: { field: "description" },
      });
    });

    it("adds wildcard and regexp correctly", () => {
      const filters = {
        text: { operator: "wildcard", value: "test" },
        code: { operator: "regexp", value: "[0-9]+" },
      };
      const q = queryBuilder(filters);
      expect(q.bool.filter[0].wildcard.text).to.equal("*test*");
      expect(q.bool.filter[1].regexp.code).to.equal("[0-9]+");
    });

    it("ignores invalid operators gracefully", () => {
      const filters = {
        something: { operator: "invalid", value: "x" },
      };
      const q = queryBuilder(filters);
      expect(q.bool.must).to.be.empty;
      expect(q.bool.filter).to.be.empty;
    });
  });

  describe("aggBuilder", () => {
    it("creates term aggregations for each field", () => {
      const aggs = ["status", "category"];
      const result = aggBuilder(aggs);
      expect(result).to.have.keys(["status", "category"]);
      expect(result.status.terms.field).to.equal("status");
      expect(result.category.terms.field).to.equal("category");
    });

    it("returns empty object for empty array", () => {
      const result = aggBuilder([]);
      expect(result).to.deep.equal({});
    });
  });

  describe("searchBuilder", () => {
    it("adds multi_match, match_phrase, and match queries when text provided", () => {
      const base = { bool: { must: [], filter: [], should: [], must_not: [] } };
      const q = searchBuilder(base, "hello");
      const should = q.bool.should;
      expect(should).to.have.length(3);
      expect(should[0]).to.have.property("multi_match");
      expect(should[1]).to.have.property("match_phrase");
      expect(should[2]).to.have.property("match");
    });

    it("returns same query when text is empty", () => {
      const base = { bool: { must: [], filter: [], should: [], must_not: [] } };
      const q = searchBuilder(base, "");
      expect(q.bool.should).to.be.empty;
    });
  });

  describe("filterBuilder", () => {
    it("creates filters and skips negative params", () => {
      const query = {
        q: "ignore",
        page: 1,
        name: "john",
        age: 25,
      };
      const filters = filterBuilder(query);
      expect(filters).to.have.keys(["name", "age"]);
      expect(filters.name).to.deep.equal({ operator: "eq", value: "john" });
    });

    it("returns empty object when no valid filters", () => {
      const filters = filterBuilder({ q: "only" });
      expect(filters).to.deep.equal({});
    });
  });

  describe("fieldBuilder", () => {
    it("returns flat list of fields for allowed types", () => {
      const properties = {
        name: { type: "keyword" },
        price: { type: "float" },
      };
      const fields = fieldBuilder(properties);
      expect(fields).to.include.members(["name", "price"]);
    });

    it("recursively handles nested properties", () => {
      const props = {
        user: {
          properties: {
            name: { type: "keyword" },
            address: {
              properties: {
                city: { type: "text" },
                zip: { type: "integer" },
              },
            },
          },
        },
      };
      const result = fieldBuilder(props);
      expect(result).to.include("user.name");
      expect(result).to.include("user.address.zip");
      expect(result).to.not.include("user.address.city"); // text not allowed
    });

    it("returns empty array if properties is falsy", () => {
      expect(fieldBuilder(null)).to.deep.equal([]);
    });
  });

  describe("multiSearchBuilder", () => {
    it("creates should queries and indices_boost", () => {
      const settings = [
        { index: "a", fields: ["title"], boost: 2 },
        { index: "b", fields: ["name"], boost: 1 },
      ];
      const q = multiSearchBuilder(settings, "term");
      expect(q.query.bool.should).to.have.length(2);
      expect(q.indices_boost).to.deep.equal([{ a: 2 }, { b: 1 }]);
    });
  });
});
