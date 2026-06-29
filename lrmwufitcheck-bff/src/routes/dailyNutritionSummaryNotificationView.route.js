const catchAsync = require("common/catchAsync");
const validate = require("middlewares/validate");
const httpStatus = require("http-status");
const filterSchema = require("validations/index");
const { authenticationMiddleware } = require("middlewares/authentication");

const express = require("express");
const { dynamicService } = require("services");
const router = express.Router();

router
  .route("/list")
  .post(
    authenticationMiddleware,
    validate(filterSchema.filterValidation),
    catchAsync(async (req, res) => {
      const { query } = req;
      const { page, limit, sortBy, sortOrder, q } = query;
      const response = await dynamicService.handleListElasticIndex(
        "dailynutritionsummarynotificationview",
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
        "dailynutritionsummarynotificationview",
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
  .route("/count")
  .post(
    authenticationMiddleware,
    validate(filterSchema.filterValidation),
    catchAsync(async (req, res) => {
      const response = await dynamicService.handleCountElasticIndex(
        "dailynutritionsummarynotificationview",
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
        "dailynutritionsummarynotificationview",
        req.query.q,
        {},
      );
      return res.status(httpStatus.OK).json(response);
    }),
  );

router.route("/schema").get(
  authenticationMiddleware,
  catchAsync(async (req, res) => {
    const response = await dynamicService.handleElasticIndexSchema(
      "dailynutritionsummarynotificationview",
    );
    return res.status(httpStatus.OK).json(response);
  }),
);

router
  .route("/filters")
  .get(
    authenticationMiddleware,
    validate(filterSchema.getFilterValidation),
    catchAsync(async (req, res) => {
      const { query } = req;
      const { page, limit } = query;
      const response = await dynamicService.handleGetFiltersElasticIndex(
        "dailynutritionsummarynotificationview",
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
        "dailynutritionsummarynotificationview",
        "session.userId",
        req.body,
      );
      return res.status(httpStatus.OK).json(response);
    }),
  );

router.route("/filters/:filterId").delete(
  authenticationMiddleware,
  validate(filterSchema.deleteFilterValidation),
  catchAsync(async (req, res) => {
    await dynamicService.handleDeleteFiltersElasticIndex(
      "dailynutritionsummarynotificationview",
      "session.userId",
      req.params.filterId,
    );
    return res.status(httpStatus.OK).json({ message: "Filter deleted" });
  }),
);

router.route("/:id").get(
  authenticationMiddleware,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const response = await dynamicService.handleGetElasticIndex(
      "dailynutritionsummarynotificationview",
      id,
    );
    return res.status(httpStatus.OK).json(response);
  }),
);

module.exports = router;
