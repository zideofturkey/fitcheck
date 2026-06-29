const {
  foodItemsRePresetMealWithLines,
} = require("aggregates/presetMealWithLines.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_fooditem-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await foodItemsRePresetMealWithLines(referenceValue);
    console.log("elastic-index-lrmwufitcheck_fooditem-created:", event);
  },
};
