const env = process.env.NODE_ENV ?? "prod";
require("dotenv").config({ path: `.${env}.env` });

const app = require("./express-app");
const { startListener, shutdownListener } = require("listeners");
const { startRepairJobs } = require("crons");
const { repairService } = require("services");
let expressServer = null;

const start = async () => {
  const servicePort = process.env.HTTP_PORT ? process.env.HTTP_PORT : 3000;
  expressServer = app.listen(servicePort);
  console.log("Listening port " + servicePort.toString());

  await repairService.runAllRepair();
  await startRepairJobs();

  try {
    await startListener();
  } catch (err) {
    // No Kafka broker reachable in this environment (e.g. local dev without
    // a Kafka container) - degrade gracefully instead of crashing the whole
    // process. The REST API still works; only live event aggregation is lost.
    console.warn(
      "Kafka listener failed to start, continuing without event consumption:",
      err.message,
    );
  }
};

const shutdown = async () => {
  console.log("Shutting down gracefully...");

  await expressServer.close();

  await shutdownListener();

  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
