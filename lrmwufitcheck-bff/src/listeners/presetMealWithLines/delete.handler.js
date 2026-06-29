const {
  presetMealWithLinesAggregateData,
} = require("aggregates/presetMealWithLines.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_presetmeal-deleted",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await presetMealWithLinesAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_presetmeal-deleted:", event);
  },
};
