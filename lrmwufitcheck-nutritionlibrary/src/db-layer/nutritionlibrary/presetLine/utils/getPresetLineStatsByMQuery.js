const { HttpServerError, BadRequestError, convertUserQueryToSequelizeQuery } =
  require("common");

const { PresetLine } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * Calculates statistics on PresetLine records matching an MScript Query.
 * @param {Object} mQuery - MScript Query object (database-agnostic format)
 * @param {Array<string>} stats - Statistics to calculate (e.g. ["count", "sum(amount)", "avg(price)"])
 * @returns {Promise<number|Object>} Statistics result
 */
const getPresetLineStatsByMQuery = async (mQuery, stats) => {
  const promises = [];
  const statLabels = [];
  try {
    if (!mQuery || typeof mQuery !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const query = convertUserQueryToSequelizeQuery(mQuery);

    // Default soft-delete filter only when the caller did not explicitly set isActive
    const queryWithSoftDelete = Object.prototype.hasOwnProperty.call(
      query,
      "isActive",
    )
      ? query
      : { [Op.and]: [query, { isActive: true }] };

    if (!stats || stats.length === 0) {
      stats = ["count"];
    }

    for (const stat of stats) {
      let statParts = stat.replace("(", "-").replace(")", "").split("-");
      if (stat === "count") {
        promises.push(PresetLine.count({ where: queryWithSoftDelete }));
        statLabels.push("count");
      } else if (statParts.length == 2) {
        if (statParts[0] === "sum") {
          promises.push(
            PresetLine.sum(statParts[1], { where: queryWithSoftDelete }),
          );
          statLabels.push("sum-" + statParts[1]);
        } else if (statParts[0] === "avg") {
          // Sequelize 6 has no Model.avg() — only count/sum/min/max are
          // exposed as direct methods. Use the canonical Model.aggregate
          // entry point with 'avg' as the function name; the result is
          // the same numeric scalar.
          promises.push(
            PresetLine.aggregate(statParts[1], "avg", {
              where: queryWithSoftDelete,
            }),
          );
          statLabels.push("avg-" + statParts[1]);
        } else if (statParts[0] === "min") {
          promises.push(
            PresetLine.min(statParts[1], { where: queryWithSoftDelete }),
          );
          statLabels.push("min-" + statParts[1]);
        } else if (statParts[0] === "max") {
          promises.push(
            PresetLine.max(statParts[1], { where: queryWithSoftDelete }),
          );
          statLabels.push("max-" + statParts[1]);
        }
      }
    }

    if (promises.length == 0) {
      return await PresetLine.count({ where: queryWithSoftDelete });
    } else if (promises.length == 1) {
      return await promises[0];
    } else {
      const results = await Promise.all(promises);
      return results.reduce((acc, val, index) => {
        acc[statLabels[index]] = val;
        return acc;
      }, {});
    }
  } catch (err) {
    //**errorLog
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingPresetLineStatsByMQuery",
      err,
    );
  }
};

module.exports = getPresetLineStatsByMQuery;
