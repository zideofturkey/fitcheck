const catchAsync = require("common/catchAsync");
const validate = require("middlewares/validate");
const httpStatus = require("http-status");
const filterSchema = require("validations/index");
const { authenticationMiddleware } = require("middlewares/authentication");

const express = require("express");
const { dynamicService } = require("services");
const router = express.Router();

router.route("/allIndices").get(
  authenticationMiddleware,
  catchAsync(async (req, res) => {
    const response = await dynamicService.handleGetAllIndices();
    return res.status(httpStatus.OK).json(response);
  }),
);

router
  .route("/:indexName/list")
  .post(
    authenticationMiddleware,
    validate(filterSchema.filterValidation),
    catchAsync(async (req, res) => {
      const { query } = req;
      const { page, limit, sortBy, sortOrder, q } = query;
      const response = await dynamicService.handleListElasticIndex(
        req.params.indexName,
        page,
        limit,
        q,
        {
          by: sortBy,
          order: sortOrder,
        },
        req.body,
        [],
      );
      return res.status(httpStatus.OK).json(response);
    }),
  )
  .get(
    authenticationMiddleware,
    validate(filterSchema.listValidation),
    catchAsync(async (req, res) => {
      const { query } = req;
      const { page, limit, sortBy, sortOrder, q } = query;
      const response = await dynamicService.handleListElasticIndex(
        req.params.indexName,
        page,
        limit,
        q,
        {
          by: sortBy,
          order: sortOrder,
        },
        {},
        [],
      );
      return res.status(httpStatus.OK).json(response);
    }),
  );

router
  .route("/:indexName/count")
  .post(
    authenticationMiddleware,
    validate(filterSchema.filterValidation),
    catchAsync(async (req, res) => {
      const response = await dynamicService.handleCountElasticIndex(
        req.params.indexName,
        req.query.q,
        req.body,
      );
      return res.status(httpStatus.OK).json(response);
    }),
  )
  .get(
    authenticationMiddleware,
    validate(filterSchema.listValidation),
    catchAsync(async (req, res) => {
      const response = await dynamicService.handleCountElasticIndex(
        req.params.indexName,
        req.query.q,
        {},
      );
      return res.status(httpStatus.OK).json(response);
    }),
  );

router.route("/:indexName/schema").get(
  authenticationMiddleware,
  catchAsync(async (req, res) => {
    const response = await dynamicService.handleElasticIndexSchema(
      req.params.indexName,
    );
    return res.status(httpStatus.OK).json(response);
  }),
);

router
  .route("/:indexName/filters")
  .get(
    authenticationMiddleware,
    validate(filterSchema.getFilterValidation),
    catchAsync(async (req, res) => {
      const { query } = req;
      const { page, limit } = query;
      const response = await dynamicService.handleGetFiltersElasticIndex(
        req.params.indexName,
        "session.userId",
        page,
        limit,
      );
      return res.status(httpStatus.OK).json(response);
    }),
  )
  .post(
    authenticationMiddleware,
    catchAsync(async (req, res) => {
      const response = await dynamicService.handleSaveFiltersElasticIndex(
        req.params.indexName,
        "session.userId",
        req.body,
      );
      return res.status(httpStatus.OK).json(response);
    }),
  );

router.route("/:indexName/filters/:filterId").delete(
  authenticationMiddleware,
  validate(filterSchema.deleteFilterValidation),
  catchAsync(async (req, res) => {
    await dynamicService.handleDeleteFiltersElasticIndex(
      req.params.indexName,
      "session.userId",
      req.params.filterId,
    );
    return res.status(httpStatus.OK).json({ message: "Filter deleted" });
  }),
);

/**
 * Raw Elasticsearch search endpoint
 * POST /:indexName/rawsearch
 * Body: Raw Elasticsearch query
 */
router.route("/:indexName/rawsearch").post(
  authenticationMiddleware,
  catchAsync(async (req, res) => {
    const response = await dynamicService.handleRawSearchElasticIndex(
      req.params.indexName,
      req.body,
    );
    return res.status(httpStatus.OK).json(response);
  }),
);

// This route must be LAST as :id is a catch-all parameter
router.route("/:indexName/:id").get(
  authenticationMiddleware,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const response = await dynamicService.handleGetElasticIndex(
      req.params.indexName,
      id,
    );
    return res.status(httpStatus.OK).json(response);
  }),
);

module.exports = router;
