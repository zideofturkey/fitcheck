const {
  linesRePresetMealWithLines,
} = require("aggregates/presetMealWithLines.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_presetline-deleted",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await linesRePresetMealWithLines(referenceValue);
    console.log("elastic-index-lrmwufitcheck_presetline-deleted:", event);
  },
};
