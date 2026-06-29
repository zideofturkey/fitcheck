const { HttpServerError, HttpError, BadRequestError } = require("common");

const { NutritionDay } = require("models");
const { hexaLogger, newUUID } = require("common");
const {
  indexDataToElastic,
  raiseDbEventCreate,
  createEntityCache,
  invalidateQueryCache,
} = require("./helper");

const validateData = (data) => {
  if (!data.id) {
    data.id = newUUID();
  }
};

async function checkForUniqueIndex(data) {
  const whereClause = {
    userId: data.userId ?? null,
    summaryDate: data.summaryDate ?? null,
  };
  const dbDoc = await NutritionDay.findOne({ where: whereClause });
  if (dbDoc) {
    // update existing record and continue
    delete data.id;

    await dbDoc.update(data);
    return dbDoc;
  }

  return null;
}

const createNutritionDay = async (data, context = null) => {
  try {
    validateData(data);

    const current_nutritionDay = data.id
      ? await NutritionDay.findByPk(data.id)
      : null;
    let newnutritionDay = null;

    if (current_nutritionDay) {
      delete data.id;

      await current_nutritionDay.update(data);
      newnutritionDay = current_nutritionDay;
    }

    if (!newnutritionDay) {
      //check for unique index
      newnutritionDay = await checkForUniqueIndex(data);
    }

    if (!newnutritionDay) {
      newnutritionDay = await NutritionDay.create(data);
    }

    const _data = newnutritionDay.getData();
    await createEntityCache(_data);
    await indexDataToElastic(_data, context);
    await invalidateQueryCache(_data);
    await raiseDbEventCreate(_data, context);
    return _data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingNutritionDay", err);
  }
};

module.exports = createNutritionDay;
