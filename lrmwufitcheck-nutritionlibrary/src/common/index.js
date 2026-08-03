const {
  createJWT,
  validateJWT,
  createJWT_RSA,
  validateJWT_RSA,
  decodeJWT,
  encodeToken,
  decodeToken,
  randomCode,
  hashString,
  hashCompare,
  md5,
  intHash,
  createM2MToken,
  validateM2MToken,
} = require("./crypto-utils");

const EntityCache = require("./entity-cache");
const ElasticIndexer = require("./elastic-index");
const { QueryCache, QueryCacheInvalidator } = require("./query-cache");

const boolQueryParser = require("./bool-queryparser");

const { foldTurkish, turkishInsensitiveCondition } = require("./turkish-search");

const KafkaPublisher = require("./kafka-publisher");
const KafkaListener = require("./kafka-listener");

const {
  NotificationSender,
  EmailSender,
  SmsSender,
  DataSender,
} = require("./notification-senders");

const requestIdStamper = require("./requestIdStamper");

const {
  connectToKafka,
  sendMessageToKafka,
  createConsumer,
  closeKafka,
  registerTopicAliasResolver,
  resolveTopic,
} = require("./kafka");

const {
  connectToElastic,
  closeElastic,
  elasticClient,
  isElasticAvailable,
} = require("./elastic");
const {
  redisClient,
  connectToRedis,
  getRedisData,
  setRedisData,
  ttlToHuman,
  checkKeyExists,
  getKeyTTL,
} = require("./redis");

const {
  getRestData,
  sendRestRequest,
  downloadFile,
} = require("./getRemoteData");

const { HexaLogTypes, hexaLogger } = require("./hexa-logger");

const {
  mongoose,
  connectToMongoDb,
  startMongoDb,
  closeMongoDbConnection,
} = require("./hexa-mongo");

const {
  startPostgres,
  syncModels,
  closePostgres,
  sequelize,
} = require("./postgres");

const {
  errorHandler,
  HttpError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnprocessableEntityError,
  HttpServerError,
  ForbiddenError,
  NotAuthenticatedError,
  ErrorCodes,
} = require("./error");

const {
  newUUID,
  newObjectId,
  objectIdToUUID,
  UUIDtoObjectId,
  shortUUID,
  longUUID,
  isValidUUID,
  isValidObjectId,
  createHexCode,
} = require("./hexa-id");

const {
  concatListResults,
  mapArrayItems,
  normalizeElasticSearchResult,
  logRequestIPs,
  checkSame,
} = require("./utils");

const {
  buildSequelizeClause,
  buildMongooseClause,
  buildElasticClause,
} = require("./build-clause");

const { renderTemplate, renderTemplateSource } = require("./render");

const getCookieOptions = require("./cookieOptions");

const {
  PaymentGate,
  createPaymentGate,
  registerPaymentGate,
  getPaymentGate,
  paymentGatePool,
  PaymentGateError,
} = require("./paymentGate");

const stripeGateWay = require("./stripeGate");
const sendSmptEmail = require("./send-smtp-mail");

const {
  convertUserQueryToSequelizeQuery,
  convertUserQueryToElasticQuery,
  convertUserQueryToMongoDbQuery,
} = require("./queryBuilder");

const {
  OpenAiFetchManager,
  AnthropicFetchManager,
} = require("./AiFetchManager");

const {
  initConsoleCapture,
  getConsoleLogChannel,
  CONSOLE_LOG_RETENTION_DAYS,
  CONSOLE_LOG_CHANNEL,
} = require("./console-capture");

const {
  setupConsoleStreamWebSocket,
  getConsoleStreamStatus,
  closeConsoleStream,
} = require("./console-stream");

const {
  evaluateExpression,
  evaluateExpressionBool,
  runMScript,
} = require("./evaluate-expression");

const {
  ARRAY_MUTATION_KEYS,
  isArrayMutationObject,
  hasArrayMutations,
  resolveArrayMutationsInClause,
} = require("./array-mutations");

module.exports = {
  checkUserHasRightForObject: require("./permission"),
  createJWT,
  validateJWT,
  createJWT_RSA,
  validateJWT_RSA,
  decodeJWT,
  encodeToken,
  decodeToken,
  randomCode,
  hashString,
  hashCompare,
  md5,
  intHash,
  createM2MToken,
  validateM2MToken,
  EntityCache,
  QueryCache,
  QueryCacheInvalidator,
  boolQueryParser,
  newUUID,
  ElasticIndexer,
  connectToKafka,
  sendMessageToKafka,
  createConsumer,
  closeKafka,
  registerTopicAliasResolver,
  resolveTopic,
  KafkaPublisher,
  KafkaListener,
  connectToElastic,
  closeElastic,
  elasticClient,
  isElasticAvailable,
  getRedisData,
  setRedisData,
  getRestData,
  sendRestRequest,
  downloadFile,
  redisClient,
  connectToRedis,
  ttlToHuman,
  checkKeyExists,
  getKeyTTL,
  newUUID,
  newObjectId,
  objectIdToUUID,
  UUIDtoObjectId,
  shortUUID,
  longUUID,
  isValidUUID,
  isValidObjectId,
  createHexCode,
  mongoose,
  connectToMongoDb,
  startMongoDb,
  closeMongoDbConnection,
  hexaLogger,
  HexaLogTypes,
  startPostgres,
  syncModels,
  closePostgres,
  sequelize,
  errorHandler,
  HttpError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnprocessableEntityError,
  HttpServerError,
  ForbiddenError,
  NotAuthenticatedError,
  ErrorCodes,
  concatListResults,
  mapArrayItems,
  normalizeElasticSearchResult,
  requestIdStamper,
  logRequestIPs,
  checkSame,
  NotificationSender,
  EmailSender,
  SmsSender,
  DataSender,
  renderTemplate,
  renderTemplateSource,
  buildSequelizeClause,
  buildMongooseClause,
  buildElasticClause,
  paymentGatePool,
  PaymentGate,
  PaymentGateError,
  createPaymentGate,
  registerPaymentGate,
  getPaymentGate,
  stripeGateWay,
  stripeGateway: stripeGateWay,
  sendSmptEmail: require("./send-smtp-mail"),
  convertUserQueryToSequelizeQuery,
  convertUserQueryToElasticQuery,
  convertUserQueryToMongoDbQuery,
  OpenAiFetchManager,
  AnthropicFetchManager,
  getCookieOptions,
  ...require("./imageUtils"),
  dateFilters: require("./dateFilters"),
  geoFilters: require("./geoFilters"),
  // Console capture for streaming logs to MCP-BFF
  initConsoleCapture,
  getConsoleLogChannel,
  CONSOLE_LOG_RETENTION_DAYS,
  CONSOLE_LOG_CHANNEL,
  // Console stream WebSocket server
  setupConsoleStreamWebSocket,
  getConsoleStreamStatus,
  closeConsoleStream,
  // Expression evaluation
  evaluateExpression,
  evaluateExpressionBool,
  runMScript,
  ARRAY_MUTATION_KEYS,
  isArrayMutationObject,
  hasArrayMutations,
  resolveArrayMutationsInClause,
  foldTurkish,
  turkishInsensitiveCondition,
};
