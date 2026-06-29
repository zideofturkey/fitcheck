const { HttpServerError, BadRequestError } = require("common");

const { MealLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getMealLineListByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getMealLineListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const mealLine = await MealLine.findAll({
      where: query,
    });

    //should i add not found error or only return empty array?
    if (!mealLine || mealLine.length === 0) return [];

    return mealLine.map((item) => item.getData());
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLineListByQuery",
      err,
    );
  }
};

module.exports = getMealLineListByQuery;
