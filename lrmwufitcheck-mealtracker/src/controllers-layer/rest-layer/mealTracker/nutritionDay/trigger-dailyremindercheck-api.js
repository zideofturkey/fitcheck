const { TriggerDailyReminderCheckManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class TriggerDailyReminderCheckRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("triggerDailyReminderCheck", "triggerdailyremindercheck", req, res);
    this.dataName = "nutritionDay";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new TriggerDailyReminderCheckManager(this._req, "rest");
  }
}

const triggerDailyReminderCheck = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new TriggerDailyReminderCheckRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = triggerDailyReminderCheck;
