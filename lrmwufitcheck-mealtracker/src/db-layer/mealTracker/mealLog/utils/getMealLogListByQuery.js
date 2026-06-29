const { HttpServerError, BadRequestError } = require("common");

const { MealLog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getMealLogListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getMealLogListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const mealLog = await MealLog.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!mealLog || mealLog.length === 0) return [];

    return mealLog.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLogListByQuery",
      err,
    );
  }
};

module.exports = getMealLogListByQuery;
