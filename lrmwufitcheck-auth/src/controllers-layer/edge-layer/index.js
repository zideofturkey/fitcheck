const express = require("express");

const { KafkaListener } = require("common");

// Edge functions Rest Api Router
const edgeRouter = express.Router();

edgeRouter.post("/m2m/user/create", require("./m2mCreateUser-rest"));

edgeRouter.post("/m2m/user/bulk-create", require("./m2mBulkCreateUser-rest"));

edgeRouter.patch("/m2m/user/update/:id", require("./m2mUpdateUserById-rest"));

edgeRouter.delete("/m2m/user/delete/:id", require("./m2mDeleteUserById-rest"));

edgeRouter.patch(
  "/m2m/user/update-by-query",
  require("./m2mUpdateUserByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/user/delete-by-query",
  require("./m2mDeleteUserByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/user/update-by-id-list",
  require("./m2mUpdateUserByIdList-rest"),
);

edgeRouter.post(
  "/m2m/useravatarsfile/create",
  require("./m2mCreateUserAvatarsFile-rest"),
);

edgeRouter.post(
  "/m2m/useravatarsfile/bulk-create",
  require("./m2mBulkCreateUserAvatarsFile-rest"),
);

edgeRouter.patch(
  "/m2m/useravatarsfile/update/:id",
  require("./m2mUpdateUserAvatarsFileById-rest"),
);

edgeRouter.delete(
  "/m2m/useravatarsfile/delete/:id",
  require("./m2mDeleteUserAvatarsFileById-rest"),
);

edgeRouter.patch(
  "/m2m/useravatarsfile/update-by-query",
  require("./m2mUpdateUserAvatarsFileByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/useravatarsfile/delete-by-query",
  require("./m2mDeleteUserAvatarsFileByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/useravatarsfile/update-by-id-list",
  require("./m2mUpdateUserAvatarsFileByIdList-rest"),
);

// Edge functions Kafka Handlers

const m2mCreateUserHandler = require("./m2mCreateUser-kafka");

const m2mBulkCreateUserHandler = require("./m2mBulkCreateUser-kafka");

const m2mUpdateUserByIdHandler = require("./m2mUpdateUserById-kafka");

const m2mDeleteUserByIdHandler = require("./m2mDeleteUserById-kafka");

const m2mUpdateUserByQueryHandler = require("./m2mUpdateUserByQuery-kafka");

const m2mDeleteUserByQueryHandler = require("./m2mDeleteUserByQuery-kafka");

const m2mUpdateUserByIdListHandler = require("./m2mUpdateUserByIdList-kafka");

const m2mCreateUserAvatarsFileHandler = require("./m2mCreateUserAvatarsFile-kafka");

const m2mBulkCreateUserAvatarsFileHandler = require("./m2mBulkCreateUserAvatarsFile-kafka");

const m2mUpdateUserAvatarsFileByIdHandler = require("./m2mUpdateUserAvatarsFileById-kafka");

const m2mDeleteUserAvatarsFileByIdHandler = require("./m2mDeleteUserAvatarsFileById-kafka");

const m2mUpdateUserAvatarsFileByQueryHandler = require("./m2mUpdateUserAvatarsFileByQuery-kafka");

const m2mDeleteUserAvatarsFileByQueryHandler = require("./m2mDeleteUserAvatarsFileByQuery-kafka");

const m2mUpdateUserAvatarsFileByIdListHandler = require("./m2mUpdateUserAvatarsFileByIdList-kafka");

const startKafkaListenersForEdge = async () => {
  const m2mCreateUserListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-user-create-request",
    m2mCreateUserHandler,
  );
  await m2mCreateUserListener.listen();

  const m2mBulkCreateUserListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-user-bulk-create-request",
    m2mBulkCreateUserHandler,
  );
  await m2mBulkCreateUserListener.listen();

  const m2mUpdateUserByIdListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-user-update-request",
    m2mUpdateUserByIdHandler,
  );
  await m2mUpdateUserByIdListener.listen();

  const m2mDeleteUserByIdListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-user-delete-request",
    m2mDeleteUserByIdHandler,
  );
  await m2mDeleteUserByIdListener.listen();

  const m2mUpdateUserByQueryListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-user-update-by-query-request",
    m2mUpdateUserByQueryHandler,
  );
  await m2mUpdateUserByQueryListener.listen();

  const m2mDeleteUserByQueryListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-user-delete-by-query-request",
    m2mDeleteUserByQueryHandler,
  );
  await m2mDeleteUserByQueryListener.listen();

  const m2mUpdateUserByIdListListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-user-update-by-id-list-request",
    m2mUpdateUserByIdListHandler,
  );
  await m2mUpdateUserByIdListListener.listen();

  const m2mCreateUserAvatarsFileListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-useravatarsfile-create-request",
    m2mCreateUserAvatarsFileHandler,
  );
  await m2mCreateUserAvatarsFileListener.listen();

  const m2mBulkCreateUserAvatarsFileListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-useravatarsfile-bulk-create-request",
    m2mBulkCreateUserAvatarsFileHandler,
  );
  await m2mBulkCreateUserAvatarsFileListener.listen();

  const m2mUpdateUserAvatarsFileByIdListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-useravatarsfile-update-request",
    m2mUpdateUserAvatarsFileByIdHandler,
  );
  await m2mUpdateUserAvatarsFileByIdListener.listen();

  const m2mDeleteUserAvatarsFileByIdListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-useravatarsfile-delete-request",
    m2mDeleteUserAvatarsFileByIdHandler,
  );
  await m2mDeleteUserAvatarsFileByIdListener.listen();

  const m2mUpdateUserAvatarsFileByQueryListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-useravatarsfile-update-by-query-request",
    m2mUpdateUserAvatarsFileByQueryHandler,
  );
  await m2mUpdateUserAvatarsFileByQueryListener.listen();

  const m2mDeleteUserAvatarsFileByQueryListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-useravatarsfile-delete-by-query-request",
    m2mDeleteUserAvatarsFileByQueryHandler,
  );
  await m2mDeleteUserAvatarsFileByQueryListener.listen();

  const m2mUpdateUserAvatarsFileByIdListListener = new KafkaListener(
    "lrmwufitcheck-auth-service-m2m-useravatarsfile-update-by-id-list-request",
    m2mUpdateUserAvatarsFileByIdListHandler,
  );
  await m2mUpdateUserAvatarsFileByIdListListener.listen();
};

module.exports = {
  edgeRouter,

  startKafkaListenersForEdge,
};
