const express = require("express");

const { KafkaListener } = require("common");

// Edge functions Rest Api Router
const edgeRouter = express.Router();

edgeRouter.post("/m2m/meallog/create", require("./m2mCreateMealLog-rest"));

edgeRouter.post(
  "/m2m/meallog/bulk-create",
  require("./m2mBulkCreateMealLog-rest"),
);

edgeRouter.patch(
  "/m2m/meallog/update/:id",
  require("./m2mUpdateMealLogById-rest"),
);

edgeRouter.delete(
  "/m2m/meallog/delete/:id",
  require("./m2mDeleteMealLogById-rest"),
);

edgeRouter.patch(
  "/m2m/meallog/update-by-query",
  require("./m2mUpdateMealLogByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/meallog/delete-by-query",
  require("./m2mDeleteMealLogByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/meallog/update-by-id-list",
  require("./m2mUpdateMealLogByIdList-rest"),
);

edgeRouter.post("/m2m/mealline/create", require("./m2mCreateMealLine-rest"));

edgeRouter.post(
  "/m2m/mealline/bulk-create",
  require("./m2mBulkCreateMealLine-rest"),
);

edgeRouter.patch(
  "/m2m/mealline/update/:id",
  require("./m2mUpdateMealLineById-rest"),
);

edgeRouter.delete(
  "/m2m/mealline/delete/:id",
  require("./m2mDeleteMealLineById-rest"),
);

edgeRouter.patch(
  "/m2m/mealline/update-by-query",
  require("./m2mUpdateMealLineByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/mealline/delete-by-query",
  require("./m2mDeleteMealLineByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/mealline/update-by-id-list",
  require("./m2mUpdateMealLineByIdList-rest"),
);

edgeRouter.post(
  "/m2m/nutritionday/create",
  require("./m2mCreateNutritionDay-rest"),
);

edgeRouter.post(
  "/m2m/nutritionday/bulk-create",
  require("./m2mBulkCreateNutritionDay-rest"),
);

edgeRouter.patch(
  "/m2m/nutritionday/update/:id",
  require("./m2mUpdateNutritionDayById-rest"),
);

edgeRouter.delete(
  "/m2m/nutritionday/delete/:id",
  require("./m2mDeleteNutritionDayById-rest"),
);

edgeRouter.patch(
  "/m2m/nutritionday/update-by-query",
  require("./m2mUpdateNutritionDayByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/nutritionday/delete-by-query",
  require("./m2mDeleteNutritionDayByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/nutritionday/update-by-id-list",
  require("./m2mUpdateNutritionDayByIdList-rest"),
);

// Edge functions Kafka Handlers

const m2mCreateMealLogHandler = require("./m2mCreateMealLog-kafka");

const m2mBulkCreateMealLogHandler = require("./m2mBulkCreateMealLog-kafka");

const m2mUpdateMealLogByIdHandler = require("./m2mUpdateMealLogById-kafka");

const m2mDeleteMealLogByIdHandler = require("./m2mDeleteMealLogById-kafka");

const m2mUpdateMealLogByQueryHandler = require("./m2mUpdateMealLogByQuery-kafka");

const m2mDeleteMealLogByQueryHandler = require("./m2mDeleteMealLogByQuery-kafka");

const m2mUpdateMealLogByIdListHandler = require("./m2mUpdateMealLogByIdList-kafka");

const m2mCreateMealLineHandler = require("./m2mCreateMealLine-kafka");

const m2mBulkCreateMealLineHandler = require("./m2mBulkCreateMealLine-kafka");

const m2mUpdateMealLineByIdHandler = require("./m2mUpdateMealLineById-kafka");

const m2mDeleteMealLineByIdHandler = require("./m2mDeleteMealLineById-kafka");

const m2mUpdateMealLineByQueryHandler = require("./m2mUpdateMealLineByQuery-kafka");

const m2mDeleteMealLineByQueryHandler = require("./m2mDeleteMealLineByQuery-kafka");

const m2mUpdateMealLineByIdListHandler = require("./m2mUpdateMealLineByIdList-kafka");

const m2mCreateNutritionDayHandler = require("./m2mCreateNutritionDay-kafka");

const m2mBulkCreateNutritionDayHandler = require("./m2mBulkCreateNutritionDay-kafka");

const m2mUpdateNutritionDayByIdHandler = require("./m2mUpdateNutritionDayById-kafka");

const m2mDeleteNutritionDayByIdHandler = require("./m2mDeleteNutritionDayById-kafka");

const m2mUpdateNutritionDayByQueryHandler = require("./m2mUpdateNutritionDayByQuery-kafka");

const m2mDeleteNutritionDayByQueryHandler = require("./m2mDeleteNutritionDayByQuery-kafka");

const m2mUpdateNutritionDayByIdListHandler = require("./m2mUpdateNutritionDayByIdList-kafka");

const startKafkaListenersForEdge = async () => {
  const m2mCreateMealLogListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-meallog-create-request",
    m2mCreateMealLogHandler,
  );
  await m2mCreateMealLogListener.listen();

  const m2mBulkCreateMealLogListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-meallog-bulk-create-request",
    m2mBulkCreateMealLogHandler,
  );
  await m2mBulkCreateMealLogListener.listen();

  const m2mUpdateMealLogByIdListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-meallog-update-request",
    m2mUpdateMealLogByIdHandler,
  );
  await m2mUpdateMealLogByIdListener.listen();

  const m2mDeleteMealLogByIdListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-meallog-delete-request",
    m2mDeleteMealLogByIdHandler,
  );
  await m2mDeleteMealLogByIdListener.listen();

  const m2mUpdateMealLogByQueryListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-meallog-update-by-query-request",
    m2mUpdateMealLogByQueryHandler,
  );
  await m2mUpdateMealLogByQueryListener.listen();

  const m2mDeleteMealLogByQueryListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-meallog-delete-by-query-request",
    m2mDeleteMealLogByQueryHandler,
  );
  await m2mDeleteMealLogByQueryListener.listen();

  const m2mUpdateMealLogByIdListListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-meallog-update-by-id-list-request",
    m2mUpdateMealLogByIdListHandler,
  );
  await m2mUpdateMealLogByIdListListener.listen();

  const m2mCreateMealLineListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-mealline-create-request",
    m2mCreateMealLineHandler,
  );
  await m2mCreateMealLineListener.listen();

  const m2mBulkCreateMealLineListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-mealline-bulk-create-request",
    m2mBulkCreateMealLineHandler,
  );
  await m2mBulkCreateMealLineListener.listen();

  const m2mUpdateMealLineByIdListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-mealline-update-request",
    m2mUpdateMealLineByIdHandler,
  );
  await m2mUpdateMealLineByIdListener.listen();

  const m2mDeleteMealLineByIdListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-mealline-delete-request",
    m2mDeleteMealLineByIdHandler,
  );
  await m2mDeleteMealLineByIdListener.listen();

  const m2mUpdateMealLineByQueryListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-mealline-update-by-query-request",
    m2mUpdateMealLineByQueryHandler,
  );
  await m2mUpdateMealLineByQueryListener.listen();

  const m2mDeleteMealLineByQueryListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-mealline-delete-by-query-request",
    m2mDeleteMealLineByQueryHandler,
  );
  await m2mDeleteMealLineByQueryListener.listen();

  const m2mUpdateMealLineByIdListListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-mealline-update-by-id-list-request",
    m2mUpdateMealLineByIdListHandler,
  );
  await m2mUpdateMealLineByIdListListener.listen();

  const m2mCreateNutritionDayListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-nutritionday-create-request",
    m2mCreateNutritionDayHandler,
  );
  await m2mCreateNutritionDayListener.listen();

  const m2mBulkCreateNutritionDayListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-nutritionday-bulk-create-request",
    m2mBulkCreateNutritionDayHandler,
  );
  await m2mBulkCreateNutritionDayListener.listen();

  const m2mUpdateNutritionDayByIdListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-nutritionday-update-request",
    m2mUpdateNutritionDayByIdHandler,
  );
  await m2mUpdateNutritionDayByIdListener.listen();

  const m2mDeleteNutritionDayByIdListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-nutritionday-delete-request",
    m2mDeleteNutritionDayByIdHandler,
  );
  await m2mDeleteNutritionDayByIdListener.listen();

  const m2mUpdateNutritionDayByQueryListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-nutritionday-update-by-query-request",
    m2mUpdateNutritionDayByQueryHandler,
  );
  await m2mUpdateNutritionDayByQueryListener.listen();

  const m2mDeleteNutritionDayByQueryListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-nutritionday-delete-by-query-request",
    m2mDeleteNutritionDayByQueryHandler,
  );
  await m2mDeleteNutritionDayByQueryListener.listen();

  const m2mUpdateNutritionDayByIdListListener = new KafkaListener(
    "lrmwufitcheck-mealtracker-service-m2m-nutritionday-update-by-id-list-request",
    m2mUpdateNutritionDayByIdListHandler,
  );
  await m2mUpdateNutritionDayByIdListListener.listen();
};

module.exports = {
  edgeRouter,

  startKafkaListenersForEdge,
};
