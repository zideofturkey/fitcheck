const { ServicePublisher } = require("serviceCommon");

// MealLog Event Publisher Classes

// Publisher class for createMealLog api
const { MeallogCreatedTopic } = require("./topics");
class MeallogCreatedPublisher extends ServicePublisher {
  constructor(meallog, session, requestId) {
    super(MeallogCreatedTopic, meallog, session, requestId);
  }

  static async Publish(meallog, session, requestId) {
    const _publisher = new MeallogCreatedPublisher(meallog, session, requestId);
    await _publisher.publish();
  }
}

// MealLine Event Publisher Classes

// NutritionDay Event Publisher Classes

module.exports = {
  MeallogCreatedPublisher,
};
