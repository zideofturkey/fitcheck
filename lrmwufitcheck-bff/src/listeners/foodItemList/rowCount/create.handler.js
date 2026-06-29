const { rowCountReFoodItemList } = require("aggregates/foodItemList.aggregate");
const _ = require("lodash");

module.exports = {
  topic: "elastic-index-lrmwufitcheck_foodItem-created",
  handle: async (event) => {
    const referenceValue = _.get(event, "userId");
    await rowCountReFoodItemList(referenceValue);
    console.log("elastic-index-lrmwufitcheck_foodItem-created:", event);
  },
};
