const { HttpServerError, BadRequestError } = require("common");

const { MealLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getMealLineByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getMealLineByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const whereClause = query;

    const mealLine = await MealLine.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!mealLine) return null;
    return mealLine.getData();
  } catch (err) {
    console.log("errMsg_dbErrorWhenRequestingMealLineByQuery", err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMealLineByQuery",
      err,
    );
  }
};

module.exports = getMealLineByQuery;
