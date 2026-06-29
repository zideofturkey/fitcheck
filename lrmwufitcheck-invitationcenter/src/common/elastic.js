const { Client } = require("@elastic/elasticsearch");

let elasticClient = null;
let _elasticAvailable = false;
let _healthCheckTimer = null;

const HEALTH_CHECK_INTERVAL_MS = 30000;

const getElasticParams = (secure = false) => {
  const elasticUri = process.env.ELASTIC_URI || "http://localhost:9200";
  const elasticUser = process.env.ELASTIC_USER || "elastic";
  const elasticPwd = process.env.ELASTIC_PWD || "zci+imLCfkbSC=RxLHjH";
  const elasticApiKey = null; // process.env.ELASTIC_API_KEY || null;

  const password = elasticApiKey ? undefined : elasticPwd;
  const apiKey = elasticApiKey;
  return {
    node: elasticUri,
    requestTimeout: 5000,
    auth: {
      username: elasticApiKey ? undefined : elasticUser,
      password: secure ? (password ? "***" : undefined) : password,
      apiKey: secure ? (apiKey ? "***" : undefined) : apiKey,
    },
    // ssl: {
    //   ca: process.env.ELASTIC_CERT,
    //   rejectUnauthorized: false,
    // },
    tls: {
      ca: process.env.ELASTIC_CERT,
      rejectUnauthorized: false,
    },
  };
};

try {
  elasticClient = new Client(getElasticParams());
} catch (err) {
  elasticClient = null;
  console.log("elasticClient can not be created", err.message);
  //**errorLog
}

const isElasticAvailable = () => _elasticAvailable;

const _startHealthCheck = () => {
  if (_healthCheckTimer) return;
  _healthCheckTimer = setInterval(async () => {
    if (!elasticClient) return;
    try {
      await elasticClient.ping();
      if (!_elasticAvailable) {
        console.log(
          "[Elastic] Connection recovered - Elasticsearch is available again",
        );
      }
      _elasticAvailable = true;
    } catch {
      if (_elasticAvailable) {
        console.log(
          "[Elastic] Connection lost - Elasticsearch operations will be skipped",
        );
      }
      _elasticAvailable = false;
    }
  }, HEALTH_CHECK_INTERVAL_MS);
  _healthCheckTimer.unref();
};

const connectToElastic = async () => {
  if (elasticClient) {
    try {
      const info = await elasticClient.info();
      _elasticAvailable = true;
      console.log("elasticClient connected:", info);
    } catch (err) {
      _elasticAvailable = false;
      console.log(
        "[Elastic] Not connected (operations will be skipped until available):",
        err.message,
      );
      //**errorLog
    }
  } else {
    _elasticAvailable = false;
    console.log("elasticClient not connected:null client");
  }
  _startHealthCheck();
};

const closeElastic = () => {
  if (_healthCheckTimer) {
    clearInterval(_healthCheckTimer);
    _healthCheckTimer = null;
  }
  if (elasticClient) {
    elasticClient.close();
  }
};

module.exports = {
  connectToElastic,
  closeElastic,
  elasticClient,
  getElasticParams,
  isElasticAvailable,
};
