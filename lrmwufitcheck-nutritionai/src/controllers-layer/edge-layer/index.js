const express = require("express");

const { KafkaListener } = require("common");

// Edge functions Rest Api Router
const edgeRouter = express.Router();

edgeRouter.post("/m2m/aisession/create", require("./m2mCreateAiSession-rest"));

edgeRouter.post(
  "/m2m/aisession/bulk-create",
  require("./m2mBulkCreateAiSession-rest"),
);

edgeRouter.patch(
  "/m2m/aisession/update/:id",
  require("./m2mUpdateAiSessionById-rest"),
);

edgeRouter.delete(
  "/m2m/aisession/delete/:id",
  require("./m2mDeleteAiSessionById-rest"),
);

edgeRouter.patch(
  "/m2m/aisession/update-by-query",
  require("./m2mUpdateAiSessionByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/aisession/delete-by-query",
  require("./m2mDeleteAiSessionByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/aisession/update-by-id-list",
  require("./m2mUpdateAiSessionByIdList-rest"),
);

edgeRouter.post(
  "/m2m/aicandidatemeal/create",
  require("./m2mCreateAiCandidateMeal-rest"),
);

edgeRouter.post(
  "/m2m/aicandidatemeal/bulk-create",
  require("./m2mBulkCreateAiCandidateMeal-rest"),
);

edgeRouter.patch(
  "/m2m/aicandidatemeal/update/:id",
  require("./m2mUpdateAiCandidateMealById-rest"),
);

edgeRouter.delete(
  "/m2m/aicandidatemeal/delete/:id",
  require("./m2mDeleteAiCandidateMealById-rest"),
);

edgeRouter.patch(
  "/m2m/aicandidatemeal/update-by-query",
  require("./m2mUpdateAiCandidateMealByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/aicandidatemeal/delete-by-query",
  require("./m2mDeleteAiCandidateMealByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/aicandidatemeal/update-by-id-list",
  require("./m2mUpdateAiCandidateMealByIdList-rest"),
);

edgeRouter.post(
  "/m2m/aicandidateline/create",
  require("./m2mCreateAiCandidateLine-rest"),
);

edgeRouter.post(
  "/m2m/aicandidateline/bulk-create",
  require("./m2mBulkCreateAiCandidateLine-rest"),
);

edgeRouter.patch(
  "/m2m/aicandidateline/update/:id",
  require("./m2mUpdateAiCandidateLineById-rest"),
);

edgeRouter.delete(
  "/m2m/aicandidateline/delete/:id",
  require("./m2mDeleteAiCandidateLineById-rest"),
);

edgeRouter.patch(
  "/m2m/aicandidateline/update-by-query",
  require("./m2mUpdateAiCandidateLineByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/aicandidateline/delete-by-query",
  require("./m2mDeleteAiCandidateLineByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/aicandidateline/update-by-id-list",
  require("./m2mUpdateAiCandidateLineByIdList-rest"),
);

edgeRouter.post(
  "/m2m/aiguidancenote/create",
  require("./m2mCreateAiGuidanceNote-rest"),
);

edgeRouter.post(
  "/m2m/aiguidancenote/bulk-create",
  require("./m2mBulkCreateAiGuidanceNote-rest"),
);

edgeRouter.patch(
  "/m2m/aiguidancenote/update/:id",
  require("./m2mUpdateAiGuidanceNoteById-rest"),
);

edgeRouter.delete(
  "/m2m/aiguidancenote/delete/:id",
  require("./m2mDeleteAiGuidanceNoteById-rest"),
);

edgeRouter.patch(
  "/m2m/aiguidancenote/update-by-query",
  require("./m2mUpdateAiGuidanceNoteByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/aiguidancenote/delete-by-query",
  require("./m2mDeleteAiGuidanceNoteByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/aiguidancenote/update-by-id-list",
  require("./m2mUpdateAiGuidanceNoteByIdList-rest"),
);

// Edge functions Kafka Handlers

const m2mCreateAiSessionHandler = require("./m2mCreateAiSession-kafka");

const m2mBulkCreateAiSessionHandler = require("./m2mBulkCreateAiSession-kafka");

const m2mUpdateAiSessionByIdHandler = require("./m2mUpdateAiSessionById-kafka");

const m2mDeleteAiSessionByIdHandler = require("./m2mDeleteAiSessionById-kafka");

const m2mUpdateAiSessionByQueryHandler = require("./m2mUpdateAiSessionByQuery-kafka");

const m2mDeleteAiSessionByQueryHandler = require("./m2mDeleteAiSessionByQuery-kafka");

const m2mUpdateAiSessionByIdListHandler = require("./m2mUpdateAiSessionByIdList-kafka");

const m2mCreateAiCandidateMealHandler = require("./m2mCreateAiCandidateMeal-kafka");

const m2mBulkCreateAiCandidateMealHandler = require("./m2mBulkCreateAiCandidateMeal-kafka");

const m2mUpdateAiCandidateMealByIdHandler = require("./m2mUpdateAiCandidateMealById-kafka");

const m2mDeleteAiCandidateMealByIdHandler = require("./m2mDeleteAiCandidateMealById-kafka");

const m2mUpdateAiCandidateMealByQueryHandler = require("./m2mUpdateAiCandidateMealByQuery-kafka");

const m2mDeleteAiCandidateMealByQueryHandler = require("./m2mDeleteAiCandidateMealByQuery-kafka");

const m2mUpdateAiCandidateMealByIdListHandler = require("./m2mUpdateAiCandidateMealByIdList-kafka");

const m2mCreateAiCandidateLineHandler = require("./m2mCreateAiCandidateLine-kafka");

const m2mBulkCreateAiCandidateLineHandler = require("./m2mBulkCreateAiCandidateLine-kafka");

const m2mUpdateAiCandidateLineByIdHandler = require("./m2mUpdateAiCandidateLineById-kafka");

const m2mDeleteAiCandidateLineByIdHandler = require("./m2mDeleteAiCandidateLineById-kafka");

const m2mUpdateAiCandidateLineByQueryHandler = require("./m2mUpdateAiCandidateLineByQuery-kafka");

const m2mDeleteAiCandidateLineByQueryHandler = require("./m2mDeleteAiCandidateLineByQuery-kafka");

const m2mUpdateAiCandidateLineByIdListHandler = require("./m2mUpdateAiCandidateLineByIdList-kafka");

const m2mCreateAiGuidanceNoteHandler = require("./m2mCreateAiGuidanceNote-kafka");

const m2mBulkCreateAiGuidanceNoteHandler = require("./m2mBulkCreateAiGuidanceNote-kafka");

const m2mUpdateAiGuidanceNoteByIdHandler = require("./m2mUpdateAiGuidanceNoteById-kafka");

const m2mDeleteAiGuidanceNoteByIdHandler = require("./m2mDeleteAiGuidanceNoteById-kafka");

const m2mUpdateAiGuidanceNoteByQueryHandler = require("./m2mUpdateAiGuidanceNoteByQuery-kafka");

const m2mDeleteAiGuidanceNoteByQueryHandler = require("./m2mDeleteAiGuidanceNoteByQuery-kafka");

const m2mUpdateAiGuidanceNoteByIdListHandler = require("./m2mUpdateAiGuidanceNoteByIdList-kafka");

const startKafkaListenersForEdge = async () => {
  const m2mCreateAiSessionListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aisession-create-request",
    m2mCreateAiSessionHandler,
  );
  await m2mCreateAiSessionListener.listen();

  const m2mBulkCreateAiSessionListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aisession-bulk-create-request",
    m2mBulkCreateAiSessionHandler,
  );
  await m2mBulkCreateAiSessionListener.listen();

  const m2mUpdateAiSessionByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aisession-update-request",
    m2mUpdateAiSessionByIdHandler,
  );
  await m2mUpdateAiSessionByIdListener.listen();

  const m2mDeleteAiSessionByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aisession-delete-request",
    m2mDeleteAiSessionByIdHandler,
  );
  await m2mDeleteAiSessionByIdListener.listen();

  const m2mUpdateAiSessionByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aisession-update-by-query-request",
    m2mUpdateAiSessionByQueryHandler,
  );
  await m2mUpdateAiSessionByQueryListener.listen();

  const m2mDeleteAiSessionByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aisession-delete-by-query-request",
    m2mDeleteAiSessionByQueryHandler,
  );
  await m2mDeleteAiSessionByQueryListener.listen();

  const m2mUpdateAiSessionByIdListListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aisession-update-by-id-list-request",
    m2mUpdateAiSessionByIdListHandler,
  );
  await m2mUpdateAiSessionByIdListListener.listen();

  const m2mCreateAiCandidateMealListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidatemeal-create-request",
    m2mCreateAiCandidateMealHandler,
  );
  await m2mCreateAiCandidateMealListener.listen();

  const m2mBulkCreateAiCandidateMealListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidatemeal-bulk-create-request",
    m2mBulkCreateAiCandidateMealHandler,
  );
  await m2mBulkCreateAiCandidateMealListener.listen();

  const m2mUpdateAiCandidateMealByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidatemeal-update-request",
    m2mUpdateAiCandidateMealByIdHandler,
  );
  await m2mUpdateAiCandidateMealByIdListener.listen();

  const m2mDeleteAiCandidateMealByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidatemeal-delete-request",
    m2mDeleteAiCandidateMealByIdHandler,
  );
  await m2mDeleteAiCandidateMealByIdListener.listen();

  const m2mUpdateAiCandidateMealByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidatemeal-update-by-query-request",
    m2mUpdateAiCandidateMealByQueryHandler,
  );
  await m2mUpdateAiCandidateMealByQueryListener.listen();

  const m2mDeleteAiCandidateMealByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidatemeal-delete-by-query-request",
    m2mDeleteAiCandidateMealByQueryHandler,
  );
  await m2mDeleteAiCandidateMealByQueryListener.listen();

  const m2mUpdateAiCandidateMealByIdListListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidatemeal-update-by-id-list-request",
    m2mUpdateAiCandidateMealByIdListHandler,
  );
  await m2mUpdateAiCandidateMealByIdListListener.listen();

  const m2mCreateAiCandidateLineListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidateline-create-request",
    m2mCreateAiCandidateLineHandler,
  );
  await m2mCreateAiCandidateLineListener.listen();

  const m2mBulkCreateAiCandidateLineListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidateline-bulk-create-request",
    m2mBulkCreateAiCandidateLineHandler,
  );
  await m2mBulkCreateAiCandidateLineListener.listen();

  const m2mUpdateAiCandidateLineByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidateline-update-request",
    m2mUpdateAiCandidateLineByIdHandler,
  );
  await m2mUpdateAiCandidateLineByIdListener.listen();

  const m2mDeleteAiCandidateLineByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidateline-delete-request",
    m2mDeleteAiCandidateLineByIdHandler,
  );
  await m2mDeleteAiCandidateLineByIdListener.listen();

  const m2mUpdateAiCandidateLineByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidateline-update-by-query-request",
    m2mUpdateAiCandidateLineByQueryHandler,
  );
  await m2mUpdateAiCandidateLineByQueryListener.listen();

  const m2mDeleteAiCandidateLineByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidateline-delete-by-query-request",
    m2mDeleteAiCandidateLineByQueryHandler,
  );
  await m2mDeleteAiCandidateLineByQueryListener.listen();

  const m2mUpdateAiCandidateLineByIdListListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aicandidateline-update-by-id-list-request",
    m2mUpdateAiCandidateLineByIdListHandler,
  );
  await m2mUpdateAiCandidateLineByIdListListener.listen();

  const m2mCreateAiGuidanceNoteListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aiguidancenote-create-request",
    m2mCreateAiGuidanceNoteHandler,
  );
  await m2mCreateAiGuidanceNoteListener.listen();

  const m2mBulkCreateAiGuidanceNoteListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aiguidancenote-bulk-create-request",
    m2mBulkCreateAiGuidanceNoteHandler,
  );
  await m2mBulkCreateAiGuidanceNoteListener.listen();

  const m2mUpdateAiGuidanceNoteByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aiguidancenote-update-request",
    m2mUpdateAiGuidanceNoteByIdHandler,
  );
  await m2mUpdateAiGuidanceNoteByIdListener.listen();

  const m2mDeleteAiGuidanceNoteByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aiguidancenote-delete-request",
    m2mDeleteAiGuidanceNoteByIdHandler,
  );
  await m2mDeleteAiGuidanceNoteByIdListener.listen();

  const m2mUpdateAiGuidanceNoteByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aiguidancenote-update-by-query-request",
    m2mUpdateAiGuidanceNoteByQueryHandler,
  );
  await m2mUpdateAiGuidanceNoteByQueryListener.listen();

  const m2mDeleteAiGuidanceNoteByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aiguidancenote-delete-by-query-request",
    m2mDeleteAiGuidanceNoteByQueryHandler,
  );
  await m2mDeleteAiGuidanceNoteByQueryListener.listen();

  const m2mUpdateAiGuidanceNoteByIdListListener = new KafkaListener(
    "lrmwufitcheck-nutritionai-service-m2m-aiguidancenote-update-by-id-list-request",
    m2mUpdateAiGuidanceNoteByIdListHandler,
  );
  await m2mUpdateAiGuidanceNoteByIdListListener.listen();
};

module.exports = {
  edgeRouter,

  startKafkaListenersForEdge,
};
