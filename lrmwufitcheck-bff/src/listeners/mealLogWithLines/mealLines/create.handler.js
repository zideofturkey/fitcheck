const {
  mealLinesReMealLogWithLines,
} = require("aggregates/mealLogWithLines.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_mealline-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await mealLinesReMealLogWithLines(referenceValue);
    console.log("elastic-index-lrmwufitcheck_mealline-created:", event);
  },
};
