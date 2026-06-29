const Joi = require("joi");
const { pick } = require("common/pick");

const searchLogsPost = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(100),
    sortBy: Joi.string()
      .valid(
        "date",
        "subject",
        "logSource",
        "data.method",
        "data.httpStatus",
        "data.elapsedMs",
      )
      .default("date"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
  body: Joi.object().keys({
    q: Joi.string().allow("").max(1000),
    subject: Joi.string().valid(
      "RestRequestReceived",
      "RestRequestResponded",
      "HttpError",
      "ListeningHttpPort",
      "LoadingService",
    ),
    method: Joi.string().valid(
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "HEAD",
      "OPTIONS",
    ),
    status: Joi.number().integer().min(100).max(599),
    logSource: Joi.string().max(100),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")),
    url: Joi.string().max(2000),
    requestId: Joi.string().guid({ version: ["uuidv4"] }),
    minResponseTime: Joi.number().integer().min(0),
    maxResponseTime: Joi.number().integer().min(Joi.ref("minResponseTime")),
    logType: Joi.number().integer().min(1).max(10),
    userAgent: Joi.string().max(500),
    filters: Joi.array().items(
      Joi.object()
        .keys({
          field: Joi.string().required(),
          operator: Joi.string()
            .valid(
              "eq",
              "noteq",
              "range",
              "exists",
              "missing",
              "prefix",
              "wildcard",
              "regexp",
              "match_phrase",
              "match_phrase_prefix",
            )
            .required(),
          value: Joi.alternatives().try(
            Joi.string(),
            Joi.number(),
            Joi.boolean(),
          ),
          values: Joi.array()
            .items(
              Joi.alternatives().try(Joi.string(), Joi.number(), Joi.date()),
            )
            .length(2),
        })
        .when("operator", {
          is: "range",
          then: Joi.object()
            .required()
            .keys({
              field: Joi.string().required(),
              operator: Joi.string().valid("range").required(),
              values: Joi.array()
                .items(
                  Joi.alternatives().try(
                    Joi.string(),
                    Joi.number(),
                    Joi.date(),
                  ),
                )
                .length(2)
                .required(),
            }),
          otherwise: Joi.object().when("operator", {
            is: Joi.string().valid("exists", "missing"),
            then: Joi.object().keys({
              field: Joi.string().required(),
              operator: Joi.string().valid("exists", "missing").required(),
            }),
            otherwise: Joi.object().keys({
              field: Joi.string().required(),
              operator: Joi.string()
                .valid(
                  "eq",
                  "noteq",
                  "prefix",
                  "wildcard",
                  "regexp",
                  "match_phrase",
                  "match_phrase_prefix",
                )
                .required(),
              value: Joi.alternatives()
                .try(Joi.string(), Joi.number(), Joi.boolean())
                .required(),
            }),
          }),
        }),
    ),
  }),
};

const getPairedLogs = {
  params: Joi.object().keys({
    requestId: Joi.string()
      .guid({ version: ["uuidv4"] })
      .required(),
  }),
};

module.exports = {
  searchLogsPost,
  getPairedLogs,
};
