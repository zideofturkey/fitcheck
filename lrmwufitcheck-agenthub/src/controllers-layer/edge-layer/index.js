const express = require("express");

const { KafkaListener } = require("common");

// Edge functions Rest Api Router
const edgeRouter = express.Router();

edgeRouter.post(
  "/m2m/sys_agentoverride/create",
  require("./m2mCreateSys_agentOverride-rest"),
);

edgeRouter.post(
  "/m2m/sys_agentoverride/bulk-create",
  require("./m2mBulkCreateSys_agentOverride-rest"),
);

edgeRouter.patch(
  "/m2m/sys_agentoverride/update/:id",
  require("./m2mUpdateSys_agentOverrideById-rest"),
);

edgeRouter.delete(
  "/m2m/sys_agentoverride/delete/:id",
  require("./m2mDeleteSys_agentOverrideById-rest"),
);

edgeRouter.patch(
  "/m2m/sys_agentoverride/update-by-query",
  require("./m2mUpdateSys_agentOverrideByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/sys_agentoverride/delete-by-query",
  require("./m2mDeleteSys_agentOverrideByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/sys_agentoverride/update-by-id-list",
  require("./m2mUpdateSys_agentOverrideByIdList-rest"),
);

edgeRouter.post(
  "/m2m/sys_agentexecution/create",
  require("./m2mCreateSys_agentExecution-rest"),
);

edgeRouter.post(
  "/m2m/sys_agentexecution/bulk-create",
  require("./m2mBulkCreateSys_agentExecution-rest"),
);

edgeRouter.patch(
  "/m2m/sys_agentexecution/update/:id",
  require("./m2mUpdateSys_agentExecutionById-rest"),
);

edgeRouter.delete(
  "/m2m/sys_agentexecution/delete/:id",
  require("./m2mDeleteSys_agentExecutionById-rest"),
);

edgeRouter.patch(
  "/m2m/sys_agentexecution/update-by-query",
  require("./m2mUpdateSys_agentExecutionByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/sys_agentexecution/delete-by-query",
  require("./m2mDeleteSys_agentExecutionByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/sys_agentexecution/update-by-id-list",
  require("./m2mUpdateSys_agentExecutionByIdList-rest"),
);

edgeRouter.post(
  "/m2m/sys_toolcatalog/create",
  require("./m2mCreateSys_toolCatalog-rest"),
);

edgeRouter.post(
  "/m2m/sys_toolcatalog/bulk-create",
  require("./m2mBulkCreateSys_toolCatalog-rest"),
);

edgeRouter.patch(
  "/m2m/sys_toolcatalog/update/:id",
  require("./m2mUpdateSys_toolCatalogById-rest"),
);

edgeRouter.delete(
  "/m2m/sys_toolcatalog/delete/:id",
  require("./m2mDeleteSys_toolCatalogById-rest"),
);

edgeRouter.patch(
  "/m2m/sys_toolcatalog/update-by-query",
  require("./m2mUpdateSys_toolCatalogByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/sys_toolcatalog/delete-by-query",
  require("./m2mDeleteSys_toolCatalogByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/sys_toolcatalog/update-by-id-list",
  require("./m2mUpdateSys_toolCatalogByIdList-rest"),
);

edgeRouter.post(
  "/m2m/sys_agentconversation/create",
  require("./m2mCreateSys_agentConversation-rest"),
);

edgeRouter.post(
  "/m2m/sys_agentconversation/bulk-create",
  require("./m2mBulkCreateSys_agentConversation-rest"),
);

edgeRouter.patch(
  "/m2m/sys_agentconversation/update/:id",
  require("./m2mUpdateSys_agentConversationById-rest"),
);

edgeRouter.delete(
  "/m2m/sys_agentconversation/delete/:id",
  require("./m2mDeleteSys_agentConversationById-rest"),
);

edgeRouter.patch(
  "/m2m/sys_agentconversation/update-by-query",
  require("./m2mUpdateSys_agentConversationByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/sys_agentconversation/delete-by-query",
  require("./m2mDeleteSys_agentConversationByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/sys_agentconversation/update-by-id-list",
  require("./m2mUpdateSys_agentConversationByIdList-rest"),
);

// Edge functions Kafka Handlers

const m2mCreateSys_agentOverrideHandler = require("./m2mCreateSys_agentOverride-kafka");

const m2mBulkCreateSys_agentOverrideHandler = require("./m2mBulkCreateSys_agentOverride-kafka");

const m2mUpdateSys_agentOverrideByIdHandler = require("./m2mUpdateSys_agentOverrideById-kafka");

const m2mDeleteSys_agentOverrideByIdHandler = require("./m2mDeleteSys_agentOverrideById-kafka");

const m2mUpdateSys_agentOverrideByQueryHandler = require("./m2mUpdateSys_agentOverrideByQuery-kafka");

const m2mDeleteSys_agentOverrideByQueryHandler = require("./m2mDeleteSys_agentOverrideByQuery-kafka");

const m2mUpdateSys_agentOverrideByIdListHandler = require("./m2mUpdateSys_agentOverrideByIdList-kafka");

const m2mCreateSys_agentExecutionHandler = require("./m2mCreateSys_agentExecution-kafka");

const m2mBulkCreateSys_agentExecutionHandler = require("./m2mBulkCreateSys_agentExecution-kafka");

const m2mUpdateSys_agentExecutionByIdHandler = require("./m2mUpdateSys_agentExecutionById-kafka");

const m2mDeleteSys_agentExecutionByIdHandler = require("./m2mDeleteSys_agentExecutionById-kafka");

const m2mUpdateSys_agentExecutionByQueryHandler = require("./m2mUpdateSys_agentExecutionByQuery-kafka");

const m2mDeleteSys_agentExecutionByQueryHandler = require("./m2mDeleteSys_agentExecutionByQuery-kafka");

const m2mUpdateSys_agentExecutionByIdListHandler = require("./m2mUpdateSys_agentExecutionByIdList-kafka");

const m2mCreateSys_toolCatalogHandler = require("./m2mCreateSys_toolCatalog-kafka");

const m2mBulkCreateSys_toolCatalogHandler = require("./m2mBulkCreateSys_toolCatalog-kafka");

const m2mUpdateSys_toolCatalogByIdHandler = require("./m2mUpdateSys_toolCatalogById-kafka");

const m2mDeleteSys_toolCatalogByIdHandler = require("./m2mDeleteSys_toolCatalogById-kafka");

const m2mUpdateSys_toolCatalogByQueryHandler = require("./m2mUpdateSys_toolCatalogByQuery-kafka");

const m2mDeleteSys_toolCatalogByQueryHandler = require("./m2mDeleteSys_toolCatalogByQuery-kafka");

const m2mUpdateSys_toolCatalogByIdListHandler = require("./m2mUpdateSys_toolCatalogByIdList-kafka");

const m2mCreateSys_agentConversationHandler = require("./m2mCreateSys_agentConversation-kafka");

const m2mBulkCreateSys_agentConversationHandler = require("./m2mBulkCreateSys_agentConversation-kafka");

const m2mUpdateSys_agentConversationByIdHandler = require("./m2mUpdateSys_agentConversationById-kafka");

const m2mDeleteSys_agentConversationByIdHandler = require("./m2mDeleteSys_agentConversationById-kafka");

const m2mUpdateSys_agentConversationByQueryHandler = require("./m2mUpdateSys_agentConversationByQuery-kafka");

const m2mDeleteSys_agentConversationByQueryHandler = require("./m2mDeleteSys_agentConversationByQuery-kafka");

const m2mUpdateSys_agentConversationByIdListHandler = require("./m2mUpdateSys_agentConversationByIdList-kafka");

const startKafkaListenersForEdge = async () => {
  const m2mCreateSys_agentOverrideListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentoverride-create-request",
    m2mCreateSys_agentOverrideHandler,
  );
  await m2mCreateSys_agentOverrideListener.listen();

  const m2mBulkCreateSys_agentOverrideListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentoverride-bulk-create-request",
    m2mBulkCreateSys_agentOverrideHandler,
  );
  await m2mBulkCreateSys_agentOverrideListener.listen();

  const m2mUpdateSys_agentOverrideByIdListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentoverride-update-request",
    m2mUpdateSys_agentOverrideByIdHandler,
  );
  await m2mUpdateSys_agentOverrideByIdListener.listen();

  const m2mDeleteSys_agentOverrideByIdListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentoverride-delete-request",
    m2mDeleteSys_agentOverrideByIdHandler,
  );
  await m2mDeleteSys_agentOverrideByIdListener.listen();

  const m2mUpdateSys_agentOverrideByQueryListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentoverride-update-by-query-request",
    m2mUpdateSys_agentOverrideByQueryHandler,
  );
  await m2mUpdateSys_agentOverrideByQueryListener.listen();

  const m2mDeleteSys_agentOverrideByQueryListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentoverride-delete-by-query-request",
    m2mDeleteSys_agentOverrideByQueryHandler,
  );
  await m2mDeleteSys_agentOverrideByQueryListener.listen();

  const m2mUpdateSys_agentOverrideByIdListListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentoverride-update-by-id-list-request",
    m2mUpdateSys_agentOverrideByIdListHandler,
  );
  await m2mUpdateSys_agentOverrideByIdListListener.listen();

  const m2mCreateSys_agentExecutionListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentexecution-create-request",
    m2mCreateSys_agentExecutionHandler,
  );
  await m2mCreateSys_agentExecutionListener.listen();

  const m2mBulkCreateSys_agentExecutionListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentexecution-bulk-create-request",
    m2mBulkCreateSys_agentExecutionHandler,
  );
  await m2mBulkCreateSys_agentExecutionListener.listen();

  const m2mUpdateSys_agentExecutionByIdListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentexecution-update-request",
    m2mUpdateSys_agentExecutionByIdHandler,
  );
  await m2mUpdateSys_agentExecutionByIdListener.listen();

  const m2mDeleteSys_agentExecutionByIdListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentexecution-delete-request",
    m2mDeleteSys_agentExecutionByIdHandler,
  );
  await m2mDeleteSys_agentExecutionByIdListener.listen();

  const m2mUpdateSys_agentExecutionByQueryListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentexecution-update-by-query-request",
    m2mUpdateSys_agentExecutionByQueryHandler,
  );
  await m2mUpdateSys_agentExecutionByQueryListener.listen();

  const m2mDeleteSys_agentExecutionByQueryListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentexecution-delete-by-query-request",
    m2mDeleteSys_agentExecutionByQueryHandler,
  );
  await m2mDeleteSys_agentExecutionByQueryListener.listen();

  const m2mUpdateSys_agentExecutionByIdListListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentexecution-update-by-id-list-request",
    m2mUpdateSys_agentExecutionByIdListHandler,
  );
  await m2mUpdateSys_agentExecutionByIdListListener.listen();

  const m2mCreateSys_toolCatalogListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_toolcatalog-create-request",
    m2mCreateSys_toolCatalogHandler,
  );
  await m2mCreateSys_toolCatalogListener.listen();

  const m2mBulkCreateSys_toolCatalogListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_toolcatalog-bulk-create-request",
    m2mBulkCreateSys_toolCatalogHandler,
  );
  await m2mBulkCreateSys_toolCatalogListener.listen();

  const m2mUpdateSys_toolCatalogByIdListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_toolcatalog-update-request",
    m2mUpdateSys_toolCatalogByIdHandler,
  );
  await m2mUpdateSys_toolCatalogByIdListener.listen();

  const m2mDeleteSys_toolCatalogByIdListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_toolcatalog-delete-request",
    m2mDeleteSys_toolCatalogByIdHandler,
  );
  await m2mDeleteSys_toolCatalogByIdListener.listen();

  const m2mUpdateSys_toolCatalogByQueryListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_toolcatalog-update-by-query-request",
    m2mUpdateSys_toolCatalogByQueryHandler,
  );
  await m2mUpdateSys_toolCatalogByQueryListener.listen();

  const m2mDeleteSys_toolCatalogByQueryListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_toolcatalog-delete-by-query-request",
    m2mDeleteSys_toolCatalogByQueryHandler,
  );
  await m2mDeleteSys_toolCatalogByQueryListener.listen();

  const m2mUpdateSys_toolCatalogByIdListListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_toolcatalog-update-by-id-list-request",
    m2mUpdateSys_toolCatalogByIdListHandler,
  );
  await m2mUpdateSys_toolCatalogByIdListListener.listen();

  const m2mCreateSys_agentConversationListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentconversation-create-request",
    m2mCreateSys_agentConversationHandler,
  );
  await m2mCreateSys_agentConversationListener.listen();

  const m2mBulkCreateSys_agentConversationListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentconversation-bulk-create-request",
    m2mBulkCreateSys_agentConversationHandler,
  );
  await m2mBulkCreateSys_agentConversationListener.listen();

  const m2mUpdateSys_agentConversationByIdListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentconversation-update-request",
    m2mUpdateSys_agentConversationByIdHandler,
  );
  await m2mUpdateSys_agentConversationByIdListener.listen();

  const m2mDeleteSys_agentConversationByIdListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentconversation-delete-request",
    m2mDeleteSys_agentConversationByIdHandler,
  );
  await m2mDeleteSys_agentConversationByIdListener.listen();

  const m2mUpdateSys_agentConversationByQueryListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentconversation-update-by-query-request",
    m2mUpdateSys_agentConversationByQueryHandler,
  );
  await m2mUpdateSys_agentConversationByQueryListener.listen();

  const m2mDeleteSys_agentConversationByQueryListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentconversation-delete-by-query-request",
    m2mDeleteSys_agentConversationByQueryHandler,
  );
  await m2mDeleteSys_agentConversationByQueryListener.listen();

  const m2mUpdateSys_agentConversationByIdListListener = new KafkaListener(
    "lrmwufitcheck-agenthub-service-m2m-sys_agentconversation-update-by-id-list-request",
    m2mUpdateSys_agentConversationByIdListHandler,
  );
  await m2mUpdateSys_agentConversationByIdListListener.listen();
};

module.exports = {
  edgeRouter,

  startKafkaListenersForEdge,
};
