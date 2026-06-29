const { StreamTestManager } = require("apiLayer");

const AuthServiceSseController = require("../../AuthServiceSseController");

class StreamTestSseController extends AuthServiceSseController {
  constructor(req, res) {
    super("streamTest", "streamtest", req, res);
    this.dataName = "user";
    this.crudType = "get";
    this.httpMethod = "GET";
    this.responseMode = "stream";
    this.sseTimeout = 300000;
    this.chunkSize = 100;

    this.streamSourceConfig = {
      sourceType: "iteratorAction",

      iteratorAction: "simulateStream",
    };
  }

  createApiManager() {
    return new StreamTestManager(this._req, "sse");
  }
}

const streamTestSse = async (req, res, next) => {
  req.loginRequired = true;
  const controller = new StreamTestSseController(req, res);
  try {
    await controller.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = streamTestSse;
