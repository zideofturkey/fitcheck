const { TriggerDailySummaryManager } = require("apiLayer");

const MealTrackerServiceRestController = require("../../MealTrackerServiceRestController");

class TriggerDailySummaryRestController extends MealTrackerServiceRestController {
  constructor(req, res) {
    super("triggerDailySummary", "triggerdailysummary", req, res);
    this.dataName = "nutritionDay";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new TriggerDailySummaryManager(this._req, "rest");
  }
}

const triggerDailySummary = async (req, res, next) => {
  // Set loginRequired flag on request for tenant mismatch check
  req.loginRequired = true;
  const controller = new TriggerDailySummaryRestController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = triggerDailySummary;
