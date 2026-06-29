const httpStatus = require("http-status");
const ApiError = require("common/ApiError");
const {
  checkIndexExists,
  queryBuilder,
  aggBuilder,
  searchBuilder,
  search,
  count,
  checkIndexMapping,
  fieldBuilder,
  createDocument,
  deleteDocument,
  getAllIndices,
  elasticClient,
} = require("common/elasticsearch");

const handleGetAllIndices = async () => {
  const indices = await getAllIndices();
  const filteredIndices = indices.filter((index) =>
    index.index.startsWith(`lrmwufitcheck_`),
  );
  return filteredIndices.map((index) => index.index);
};

const handleGetElasticIndex = async (indexName, id) => {
  const _index = `lrmwufitcheck_${indexName}`;
  const indexExists = await checkIndexExists(_index);
  if (!indexExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Index not found");
  }

  const body = await search(_index, { query: { match: { _id: id } } });

  if (body.hits.total.value === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Data not found");
  }

  return body.hits.hits[0]._source;
};

const handleListElasticIndex = async (
  indexName,
  page = 1,
  limit = 50,
  q = "",
  sort = null,
  filter = {},
  aggs = [],
) => {
  const _index = `lrmwufitcheck_${indexName}`;
  const indexExists = await checkIndexExists(_index);
  if (!indexExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Index not found");
  }

  const generatedQuery = queryBuilder(filter);
  const filterQuery = searchBuilder(generatedQuery, q);
  let aggregateQuery = {};
  if (aggs.length > 0) {
    aggregateQuery = aggBuilder(aggs);
  }

  const sortQuery = [];
  if (sort && sort.by) {
    sortQuery.push({ [sort.by]: { order: sort.order || "asc" } });
  }

  const body = await search(
    _index,
    { query: filterQuery, sort: sortQuery, aggs: aggregateQuery },
    page,
    limit,
  );

  const hits = body.hits.hits.map((hit) => hit._source);
  const total = body.hits.total.value;
  const totalPage = Math.ceil(total / limit);
  const currentPage = page;
  const nextPage = currentPage < totalPage ? currentPage + 1 : null;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const pageItem = hits.length;

  const filters =
    aggs.length > 0
      ? Object.keys(body.aggregations).map((key) => {
          return {
            key,
            items: body.aggregations[key].buckets.map((bucket) => {
              return {
                key: bucket.key_as_string || bucket.key,
                quantity: bucket.doc_count,
              };
            }),
          };
        })
      : [];

  return {
    total,
    totalPage,
    currentPage,
    nextPage,
    prevPage,
    pageItem,
    items: hits,
    filters,
  };
};

const handleCountElasticIndex = async (indexName, q = "", filter = {}) => {
  const _index = `lrmwufitcheck_${indexName}`;
  const indexExists = await checkIndexExists(_index);
  if (!indexExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Index not found");
  }

  const generatedQuery = queryBuilder(filter);
  const filterQuery = searchBuilder(generatedQuery, q);

  const body = await count(_index, { query: filterQuery });
  return { total: body.count ?? 0 };
};

const handleElasticIndexSchema = async (indexName) => {
  const _index = `lrmwufitcheck_${indexName}`;
  const indexExists = await checkIndexExists(_index);
  if (!indexExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Index not found");
  }

  const mapping = await checkIndexMapping(_index);
  if (!mapping) {
    throw new ApiError(httpStatus.NOT_FOUND, "Mapping not found");
  }

  const filtirableFields = fieldBuilder(mapping[_index].mappings.properties);

  const sortableFields = fieldBuilder(mapping[_index].mappings.properties);

  return { filtirableFields, sortableFields };
};

const handleGetFiltersElasticIndex = async (
  indexName,
  userId,
  page = 1,
  limit = 50,
) => {
  const _index = `lrmwufitcheck_${indexName}`;
  const body = await search(
    "filter_indexs",
    {
      query: {
        bool: {
          must: [{ match: { userId: userId } }, { match: { key: _index } }],
        },
      },
    },
    page,
    limit,
  );

  const hits = body.hits.hits.map((hit) => hit._source);
  const total = body.hits.total.value;
  const totalPage = Math.ceil(total / limit);
  const currentPage = page;
  const nextPage = currentPage < totalPage ? currentPage + 1 : null;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const pageItem = hits.length;
  return {
    total,
    totalPage,
    currentPage,
    nextPage,
    prevPage,
    pageItem,
    items: hits,
  };
};

const handleSaveFiltersElasticIndex = async (indexName, userId, filters) => {
  const _index = `lrmwufitcheck_${indexName}`;
  const savedFilter = await createDocument("filter_indexs", {
    userId,
    key: _index,
    ...filters,
  });
  return savedFilter;
};

const handleDeleteFiltersElasticIndex = async (indexName, userId, filterId) => {
  const _index = `lrmwufitcheck_${indexName}`;
  const body = await search("filter_indexs", {
    query: {
      bool: {
        must: [
          { match: { userId: userId } },
          { match: { key: _index } },
          { match: { _id: filterId } },
        ],
      },
    },
  });

  if (body.hits.total.value === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Filter not found");
  }

  await deleteDocument("filter_indexs", filterId);
};

/**
 * Raw search in Elasticsearch - allows arbitrary ES queries
 * @param {string} indexName - The index name (without project prefix)
 * @param {object} queryBody - The raw Elasticsearch query body
 * @returns {object} - Normalized search results
 */
const handleRawSearchElasticIndex = async (indexName, queryBody) => {
  const _index = `lrmwufitcheck_${indexName}`;
  const indexExists = await checkIndexExists(_index);
  if (!indexExists) {
    throw new ApiError(httpStatus.NOT_FOUND, `Index '${indexName}' not found`);
  }

  try {
    // Build the search request
    const searchParams = {
      index: _index,
      body: queryBody.query ? queryBody : { query: queryBody },
    };

    // Add size/from if provided
    if (queryBody.size !== undefined) {
      searchParams.size = queryBody.size;
    }
    if (queryBody.from !== undefined) {
      searchParams.from = queryBody.from;
    }

    // Execute raw search
    const response = await elasticClient.search(searchParams);

    // Normalize the result
    const hits = response.hits?.hits || [];
    const total = response.hits?.total?.value ?? response.hits?.total ?? 0;
    const aggregations = response.aggregations || null;

    return {
      total,
      hits: hits.map((hit) => ({
        _id: hit._id,
        _index: hit._index,
        _score: hit._score,
        _source: hit._source,
      })),
      aggregations,
      took: response.took,
      timed_out: response.timed_out,
    };
  } catch (error) {
    if (error.meta?.body?.error) {
      const esError = error.meta.body.error;
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Elasticsearch error: ${esError.type} - ${esError.reason}`,
      );
    }
    throw error;
  }
};

module.exports = {
  handleGetAllIndices,
  handleGetElasticIndex,
  handleListElasticIndex,
  handleCountElasticIndex,
  handleElasticIndexSchema,

  handleGetFiltersElasticIndex,
  handleSaveFiltersElasticIndex,
  handleDeleteFiltersElasticIndex,
  handleRawSearchElasticIndex,
};
