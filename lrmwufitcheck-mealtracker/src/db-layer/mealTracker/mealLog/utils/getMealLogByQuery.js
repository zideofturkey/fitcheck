const { HttpServerError, BadRequestError } = require("common");

const { MealLog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getMealLogByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getMealLogByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const mealLog = await MealLog.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!mealLog) return null;
    return mealLog.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingMealLogByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLogByQuery",
      err,
    );
  }
};

module.exports = getMealLogByQuery;
