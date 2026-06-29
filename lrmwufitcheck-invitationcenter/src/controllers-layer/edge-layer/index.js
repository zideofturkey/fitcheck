const express = require("express");

const { KafkaListener } = require("common");

// Edge functions Rest Api Router
const edgeRouter = express.Router();

edgeRouter.post(
  "/m2m/invitelink/create",
  require("./m2mCreateInviteLink-rest"),
);

edgeRouter.post(
  "/m2m/invitelink/bulk-create",
  require("./m2mBulkCreateInviteLink-rest"),
);

edgeRouter.patch(
  "/m2m/invitelink/update/:id",
  require("./m2mUpdateInviteLinkById-rest"),
);

edgeRouter.delete(
  "/m2m/invitelink/delete/:id",
  require("./m2mDeleteInviteLinkById-rest"),
);

edgeRouter.patch(
  "/m2m/invitelink/update-by-query",
  require("./m2mUpdateInviteLinkByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/invitelink/delete-by-query",
  require("./m2mDeleteInviteLinkByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/invitelink/update-by-id-list",
  require("./m2mUpdateInviteLinkByIdList-rest"),
);

edgeRouter.post(
  "/m2m/inviteaudit/create",
  require("./m2mCreateInviteAudit-rest"),
);

edgeRouter.post(
  "/m2m/inviteaudit/bulk-create",
  require("./m2mBulkCreateInviteAudit-rest"),
);

edgeRouter.patch(
  "/m2m/inviteaudit/update/:id",
  require("./m2mUpdateInviteAuditById-rest"),
);

edgeRouter.delete(
  "/m2m/inviteaudit/delete/:id",
  require("./m2mDeleteInviteAuditById-rest"),
);

edgeRouter.patch(
  "/m2m/inviteaudit/update-by-query",
  require("./m2mUpdateInviteAuditByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/inviteaudit/delete-by-query",
  require("./m2mDeleteInviteAuditByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/inviteaudit/update-by-id-list",
  require("./m2mUpdateInviteAuditByIdList-rest"),
);

// Edge functions Kafka Handlers

const m2mCreateInviteLinkHandler = require("./m2mCreateInviteLink-kafka");

const m2mBulkCreateInviteLinkHandler = require("./m2mBulkCreateInviteLink-kafka");

const m2mUpdateInviteLinkByIdHandler = require("./m2mUpdateInviteLinkById-kafka");

const m2mDeleteInviteLinkByIdHandler = require("./m2mDeleteInviteLinkById-kafka");

const m2mUpdateInviteLinkByQueryHandler = require("./m2mUpdateInviteLinkByQuery-kafka");

const m2mDeleteInviteLinkByQueryHandler = require("./m2mDeleteInviteLinkByQuery-kafka");

const m2mUpdateInviteLinkByIdListHandler = require("./m2mUpdateInviteLinkByIdList-kafka");

const m2mCreateInviteAuditHandler = require("./m2mCreateInviteAudit-kafka");

const m2mBulkCreateInviteAuditHandler = require("./m2mBulkCreateInviteAudit-kafka");

const m2mUpdateInviteAuditByIdHandler = require("./m2mUpdateInviteAuditById-kafka");

const m2mDeleteInviteAuditByIdHandler = require("./m2mDeleteInviteAuditById-kafka");

const m2mUpdateInviteAuditByQueryHandler = require("./m2mUpdateInviteAuditByQuery-kafka");

const m2mDeleteInviteAuditByQueryHandler = require("./m2mDeleteInviteAuditByQuery-kafka");

const m2mUpdateInviteAuditByIdListHandler = require("./m2mUpdateInviteAuditByIdList-kafka");

const startKafkaListenersForEdge = async () => {
  const m2mCreateInviteLinkListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-invitelink-create-request",
    m2mCreateInviteLinkHandler,
  );
  await m2mCreateInviteLinkListener.listen();

  const m2mBulkCreateInviteLinkListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-invitelink-bulk-create-request",
    m2mBulkCreateInviteLinkHandler,
  );
  await m2mBulkCreateInviteLinkListener.listen();

  const m2mUpdateInviteLinkByIdListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-invitelink-update-request",
    m2mUpdateInviteLinkByIdHandler,
  );
  await m2mUpdateInviteLinkByIdListener.listen();

  const m2mDeleteInviteLinkByIdListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-invitelink-delete-request",
    m2mDeleteInviteLinkByIdHandler,
  );
  await m2mDeleteInviteLinkByIdListener.listen();

  const m2mUpdateInviteLinkByQueryListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-invitelink-update-by-query-request",
    m2mUpdateInviteLinkByQueryHandler,
  );
  await m2mUpdateInviteLinkByQueryListener.listen();

  const m2mDeleteInviteLinkByQueryListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-invitelink-delete-by-query-request",
    m2mDeleteInviteLinkByQueryHandler,
  );
  await m2mDeleteInviteLinkByQueryListener.listen();

  const m2mUpdateInviteLinkByIdListListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-invitelink-update-by-id-list-request",
    m2mUpdateInviteLinkByIdListHandler,
  );
  await m2mUpdateInviteLinkByIdListListener.listen();

  const m2mCreateInviteAuditListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-inviteaudit-create-request",
    m2mCreateInviteAuditHandler,
  );
  await m2mCreateInviteAuditListener.listen();

  const m2mBulkCreateInviteAuditListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-inviteaudit-bulk-create-request",
    m2mBulkCreateInviteAuditHandler,
  );
  await m2mBulkCreateInviteAuditListener.listen();

  const m2mUpdateInviteAuditByIdListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-inviteaudit-update-request",
    m2mUpdateInviteAuditByIdHandler,
  );
  await m2mUpdateInviteAuditByIdListener.listen();

  const m2mDeleteInviteAuditByIdListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-inviteaudit-delete-request",
    m2mDeleteInviteAuditByIdHandler,
  );
  await m2mDeleteInviteAuditByIdListener.listen();

  const m2mUpdateInviteAuditByQueryListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-inviteaudit-update-by-query-request",
    m2mUpdateInviteAuditByQueryHandler,
  );
  await m2mUpdateInviteAuditByQueryListener.listen();

  const m2mDeleteInviteAuditByQueryListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-inviteaudit-delete-by-query-request",
    m2mDeleteInviteAuditByQueryHandler,
  );
  await m2mDeleteInviteAuditByQueryListener.listen();

  const m2mUpdateInviteAuditByIdListListener = new KafkaListener(
    "lrmwufitcheck-invitationcenter-service-m2m-inviteaudit-update-by-id-list-request",
    m2mUpdateInviteAuditByIdListHandler,
  );
  await m2mUpdateInviteAuditByIdListListener.listen();
};

module.exports = {
  edgeRouter,

  startKafkaListenersForEdge,
};
