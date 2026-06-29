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

  await startListener();
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
