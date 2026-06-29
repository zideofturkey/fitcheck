const { HttpServerError, BadRequestError } = require("common");

const { Sys_agentExecution } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

/**
 * @deprecated Use getSys_agentExecutionStatsByMQuery instead, which accepts database-agnostic MScript Query format.
 */
const getSys_agentExecutionStatsByQuery = async (query, stats) => {
  const promises = [];
  const statLabels = [];
  try {
    const queryWithSoftDelete = query;

    if (!stats || stats.length === 0) {
      stats = ["count"];
    }

    for (const stat of stats) {
      let statParts = stat.replace("(", "-").replace(")", "").split("-");
      if (stat === "count") {
        promises.push(Sys_agentExecution.count({ where: queryWithSoftDelete }));
        statLabels.push("count");
      } else if (statParts.length == 2) {
        if (statParts[0] === "sum") {
          promises.push(
            Sys_agentExecution.sum(statParts[1], {
              where: queryWithSoftDelete,
            }),
          );
          statLabels.push("sum-" + statParts[1]);
        } else if (statParts[0] === "avg") {
          // Sequelize 6 has no Model.avg() — only count/sum/min/max
          // are exposed as direct methods. Use Model.aggregate('avg')
          // which is the canonical entry point for arbitrary aggregates.
          promises.push(
            Sys_agentExecution.aggregate(statParts[1], "avg", {
              where: queryWithSoftDelete,
            }),
          );
          statLabels.push("avg-" + statParts[1]);
        } else if (statParts[0] === "min") {
          promises.push(
            Sys_agentExecution.min(statParts[1], {
              where: queryWithSoftDelete,
            }),
          );
          statLabels.push("min-" + statParts[1]);
        } else if (statParts[0] === "max") {
          promises.push(
            Sys_agentExecution.max(statParts[1], {
              where: queryWithSoftDelete,
            }),
          );
          statLabels.push("max-" + statParts[1]);
        }
      }
    }

    if (promises.length == 0) {
      return await Sys_agentExecution.count({ where: queryWithSoftDelete });
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
      "errMsg_dbErrorWhenRequestingSys_agentExecutionStatsByQuery",
      err,
    );
  }
};

module.exports = getSys_agentExecutionStatsByQuery;
