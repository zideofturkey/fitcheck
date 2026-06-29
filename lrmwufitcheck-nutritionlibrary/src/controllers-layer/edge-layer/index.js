const express = require("express");

const { KafkaListener } = require("common");

// Edge functions Rest Api Router
const edgeRouter = express.Router();

edgeRouter.post(
  "/m2m/macrotarget/create",
  require("./m2mCreateMacroTarget-rest"),
);

edgeRouter.post(
  "/m2m/macrotarget/bulk-create",
  require("./m2mBulkCreateMacroTarget-rest"),
);

edgeRouter.patch(
  "/m2m/macrotarget/update/:id",
  require("./m2mUpdateMacroTargetById-rest"),
);

edgeRouter.delete(
  "/m2m/macrotarget/delete/:id",
  require("./m2mDeleteMacroTargetById-rest"),
);

edgeRouter.patch(
  "/m2m/macrotarget/update-by-query",
  require("./m2mUpdateMacroTargetByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/macrotarget/delete-by-query",
  require("./m2mDeleteMacroTargetByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/macrotarget/update-by-id-list",
  require("./m2mUpdateMacroTargetByIdList-rest"),
);

edgeRouter.post("/m2m/fooditem/create", require("./m2mCreateFoodItem-rest"));

edgeRouter.post(
  "/m2m/fooditem/bulk-create",
  require("./m2mBulkCreateFoodItem-rest"),
);

edgeRouter.patch(
  "/m2m/fooditem/update/:id",
  require("./m2mUpdateFoodItemById-rest"),
);

edgeRouter.delete(
  "/m2m/fooditem/delete/:id",
  require("./m2mDeleteFoodItemById-rest"),
);

edgeRouter.patch(
  "/m2m/fooditem/update-by-query",
  require("./m2mUpdateFoodItemByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/fooditem/delete-by-query",
  require("./m2mDeleteFoodItemByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/fooditem/update-by-id-list",
  require("./m2mUpdateFoodItemByIdList-rest"),
);

edgeRouter.post(
  "/m2m/presetmeal/create",
  require("./m2mCreatePresetMeal-rest"),
);

edgeRouter.post(
  "/m2m/presetmeal/bulk-create",
  require("./m2mBulkCreatePresetMeal-rest"),
);

edgeRouter.patch(
  "/m2m/presetmeal/update/:id",
  require("./m2mUpdatePresetMealById-rest"),
);

edgeRouter.delete(
  "/m2m/presetmeal/delete/:id",
  require("./m2mDeletePresetMealById-rest"),
);

edgeRouter.patch(
  "/m2m/presetmeal/update-by-query",
  require("./m2mUpdatePresetMealByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/presetmeal/delete-by-query",
  require("./m2mDeletePresetMealByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/presetmeal/update-by-id-list",
  require("./m2mUpdatePresetMealByIdList-rest"),
);

edgeRouter.post(
  "/m2m/presetline/create",
  require("./m2mCreatePresetLine-rest"),
);

edgeRouter.post(
  "/m2m/presetline/bulk-create",
  require("./m2mBulkCreatePresetLine-rest"),
);

edgeRouter.patch(
  "/m2m/presetline/update/:id",
  require("./m2mUpdatePresetLineById-rest"),
);

edgeRouter.delete(
  "/m2m/presetline/delete/:id",
  require("./m2mDeletePresetLineById-rest"),
);

edgeRouter.patch(
  "/m2m/presetline/update-by-query",
  require("./m2mUpdatePresetLineByQuery-rest"),
);

edgeRouter.delete(
  "/m2m/presetline/delete-by-query",
  require("./m2mDeletePresetLineByQuery-rest"),
);

edgeRouter.patch(
  "/m2m/presetline/update-by-id-list",
  require("./m2mUpdatePresetLineByIdList-rest"),
);

// Edge functions Kafka Handlers

const m2mCreateMacroTargetHandler = require("./m2mCreateMacroTarget-kafka");

const m2mBulkCreateMacroTargetHandler = require("./m2mBulkCreateMacroTarget-kafka");

const m2mUpdateMacroTargetByIdHandler = require("./m2mUpdateMacroTargetById-kafka");

const m2mDeleteMacroTargetByIdHandler = require("./m2mDeleteMacroTargetById-kafka");

const m2mUpdateMacroTargetByQueryHandler = require("./m2mUpdateMacroTargetByQuery-kafka");

const m2mDeleteMacroTargetByQueryHandler = require("./m2mDeleteMacroTargetByQuery-kafka");

const m2mUpdateMacroTargetByIdListHandler = require("./m2mUpdateMacroTargetByIdList-kafka");

const m2mCreateFoodItemHandler = require("./m2mCreateFoodItem-kafka");

const m2mBulkCreateFoodItemHandler = require("./m2mBulkCreateFoodItem-kafka");

const m2mUpdateFoodItemByIdHandler = require("./m2mUpdateFoodItemById-kafka");

const m2mDeleteFoodItemByIdHandler = require("./m2mDeleteFoodItemById-kafka");

const m2mUpdateFoodItemByQueryHandler = require("./m2mUpdateFoodItemByQuery-kafka");

const m2mDeleteFoodItemByQueryHandler = require("./m2mDeleteFoodItemByQuery-kafka");

const m2mUpdateFoodItemByIdListHandler = require("./m2mUpdateFoodItemByIdList-kafka");

const m2mCreatePresetMealHandler = require("./m2mCreatePresetMeal-kafka");

const m2mBulkCreatePresetMealHandler = require("./m2mBulkCreatePresetMeal-kafka");

const m2mUpdatePresetMealByIdHandler = require("./m2mUpdatePresetMealById-kafka");

const m2mDeletePresetMealByIdHandler = require("./m2mDeletePresetMealById-kafka");

const m2mUpdatePresetMealByQueryHandler = require("./m2mUpdatePresetMealByQuery-kafka");

const m2mDeletePresetMealByQueryHandler = require("./m2mDeletePresetMealByQuery-kafka");

const m2mUpdatePresetMealByIdListHandler = require("./m2mUpdatePresetMealByIdList-kafka");

const m2mCreatePresetLineHandler = require("./m2mCreatePresetLine-kafka");

const m2mBulkCreatePresetLineHandler = require("./m2mBulkCreatePresetLine-kafka");

const m2mUpdatePresetLineByIdHandler = require("./m2mUpdatePresetLineById-kafka");

const m2mDeletePresetLineByIdHandler = require("./m2mDeletePresetLineById-kafka");

const m2mUpdatePresetLineByQueryHandler = require("./m2mUpdatePresetLineByQuery-kafka");

const m2mDeletePresetLineByQueryHandler = require("./m2mDeletePresetLineByQuery-kafka");

const m2mUpdatePresetLineByIdListHandler = require("./m2mUpdatePresetLineByIdList-kafka");

const startKafkaListenersForEdge = async () => {
  const m2mCreateMacroTargetListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-macrotarget-create-request",
    m2mCreateMacroTargetHandler,
  );
  await m2mCreateMacroTargetListener.listen();

  const m2mBulkCreateMacroTargetListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-macrotarget-bulk-create-request",
    m2mBulkCreateMacroTargetHandler,
  );
  await m2mBulkCreateMacroTargetListener.listen();

  const m2mUpdateMacroTargetByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-macrotarget-update-request",
    m2mUpdateMacroTargetByIdHandler,
  );
  await m2mUpdateMacroTargetByIdListener.listen();

  const m2mDeleteMacroTargetByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-macrotarget-delete-request",
    m2mDeleteMacroTargetByIdHandler,
  );
  await m2mDeleteMacroTargetByIdListener.listen();

  const m2mUpdateMacroTargetByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-macrotarget-update-by-query-request",
    m2mUpdateMacroTargetByQueryHandler,
  );
  await m2mUpdateMacroTargetByQueryListener.listen();

  const m2mDeleteMacroTargetByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-macrotarget-delete-by-query-request",
    m2mDeleteMacroTargetByQueryHandler,
  );
  await m2mDeleteMacroTargetByQueryListener.listen();

  const m2mUpdateMacroTargetByIdListListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-macrotarget-update-by-id-list-request",
    m2mUpdateMacroTargetByIdListHandler,
  );
  await m2mUpdateMacroTargetByIdListListener.listen();

  const m2mCreateFoodItemListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-fooditem-create-request",
    m2mCreateFoodItemHandler,
  );
  await m2mCreateFoodItemListener.listen();

  const m2mBulkCreateFoodItemListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-fooditem-bulk-create-request",
    m2mBulkCreateFoodItemHandler,
  );
  await m2mBulkCreateFoodItemListener.listen();

  const m2mUpdateFoodItemByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-fooditem-update-request",
    m2mUpdateFoodItemByIdHandler,
  );
  await m2mUpdateFoodItemByIdListener.listen();

  const m2mDeleteFoodItemByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-fooditem-delete-request",
    m2mDeleteFoodItemByIdHandler,
  );
  await m2mDeleteFoodItemByIdListener.listen();

  const m2mUpdateFoodItemByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-fooditem-update-by-query-request",
    m2mUpdateFoodItemByQueryHandler,
  );
  await m2mUpdateFoodItemByQueryListener.listen();

  const m2mDeleteFoodItemByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-fooditem-delete-by-query-request",
    m2mDeleteFoodItemByQueryHandler,
  );
  await m2mDeleteFoodItemByQueryListener.listen();

  const m2mUpdateFoodItemByIdListListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-fooditem-update-by-id-list-request",
    m2mUpdateFoodItemByIdListHandler,
  );
  await m2mUpdateFoodItemByIdListListener.listen();

  const m2mCreatePresetMealListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetmeal-create-request",
    m2mCreatePresetMealHandler,
  );
  await m2mCreatePresetMealListener.listen();

  const m2mBulkCreatePresetMealListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetmeal-bulk-create-request",
    m2mBulkCreatePresetMealHandler,
  );
  await m2mBulkCreatePresetMealListener.listen();

  const m2mUpdatePresetMealByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetmeal-update-request",
    m2mUpdatePresetMealByIdHandler,
  );
  await m2mUpdatePresetMealByIdListener.listen();

  const m2mDeletePresetMealByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetmeal-delete-request",
    m2mDeletePresetMealByIdHandler,
  );
  await m2mDeletePresetMealByIdListener.listen();

  const m2mUpdatePresetMealByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetmeal-update-by-query-request",
    m2mUpdatePresetMealByQueryHandler,
  );
  await m2mUpdatePresetMealByQueryListener.listen();

  const m2mDeletePresetMealByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetmeal-delete-by-query-request",
    m2mDeletePresetMealByQueryHandler,
  );
  await m2mDeletePresetMealByQueryListener.listen();

  const m2mUpdatePresetMealByIdListListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetmeal-update-by-id-list-request",
    m2mUpdatePresetMealByIdListHandler,
  );
  await m2mUpdatePresetMealByIdListListener.listen();

  const m2mCreatePresetLineListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetline-create-request",
    m2mCreatePresetLineHandler,
  );
  await m2mCreatePresetLineListener.listen();

  const m2mBulkCreatePresetLineListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetline-bulk-create-request",
    m2mBulkCreatePresetLineHandler,
  );
  await m2mBulkCreatePresetLineListener.listen();

  const m2mUpdatePresetLineByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetline-update-request",
    m2mUpdatePresetLineByIdHandler,
  );
  await m2mUpdatePresetLineByIdListener.listen();

  const m2mDeletePresetLineByIdListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetline-delete-request",
    m2mDeletePresetLineByIdHandler,
  );
  await m2mDeletePresetLineByIdListener.listen();

  const m2mUpdatePresetLineByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetline-update-by-query-request",
    m2mUpdatePresetLineByQueryHandler,
  );
  await m2mUpdatePresetLineByQueryListener.listen();

  const m2mDeletePresetLineByQueryListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetline-delete-by-query-request",
    m2mDeletePresetLineByQueryHandler,
  );
  await m2mDeletePresetLineByQueryListener.listen();

  const m2mUpdatePresetLineByIdListListener = new KafkaListener(
    "lrmwufitcheck-nutritionlibrary-service-m2m-presetline-update-by-id-list-request",
    m2mUpdatePresetLineByIdListHandler,
  );
  await m2mUpdatePresetLineByIdListListener.listen();
};

module.exports = {
  edgeRouter,

  startKafkaListenersForEdge,
};
