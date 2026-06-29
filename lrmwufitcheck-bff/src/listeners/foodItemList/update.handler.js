const {
  foodItemListAggregateData,
} = require("aggregates/foodItemList.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_fooditem-updated",
  handle: async (event) => {
    const referenceValue = _.get(event, "id");
    await foodItemListAggregateData(referenceValue);
    console.log("elastic-index-lrmwufitcheck_fooditem-updated:", event);
  },
};
