const express = require("express");

const cors = require("cors");
const { getDomain } = require("tldts");

const cookieParser = require("cookie-parser");
const {
  boolQueryParser,
  errorHandler,
  hexaLogger,
  requestIdStamper,
  logRequestIPs,
  getRestData,
} = require("common");
const path = require("path");
const fs = require("fs");
const apiFace = require("./api-face");
const requestIp = require("request-ip");
const { parseClientInfo } = require("./utils");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const {
  getLoginRouter,
  getVerificationServicesRouter,
  getSocialLoginRouter,
} = require("restLayer");
const sessionRouter = getLoginRouter();
const verificationServicesRouter = getVerificationServicesRouter();
const socialLoginRouter = getSocialLoginRouter();

const { version } = require("../package.json");

const { edgeRouter } = require("edgeLayer");

const { integrationRouter } = require("apiLayer");

const app = express();

const unless = function (paths, middleware) {
  return function (req, res, next) {
    const filtered = paths.find((path) => req.path.endsWith(path));
    return filtered ? next() : middleware(req, res, next);
  };
};

const CORS_CONTROL_ACTIVE = process.env.CORS_CONTROL_ACTIVE === "true";
const corsOrigins = process.env.ALLOWED_ORIGINS ?? "";
const allowAllSubdomains = process.env.ALLOW_SUBDOMAINS === "true";

const parseOrigins = (str) =>
  (str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const envOrigins = new Set(parseOrigins(corsOrigins));

const sameBaseDomain = (origin) => {
  try {
    const serviceUrl = process.env.SERVICE_URL;
    const { hostname, protocol } = new URL(serviceUrl);
    const { hostname: oHost, protocol: oProto } = new URL(origin);
    if (protocol !== oProto) return false;
    const base = getDomain(hostname);
    const apiBase = getDomain(oHost);
    return base && apiBase && base === apiBase;
  } catch {
    return false;
  }
};

// Dev localhost range (Vite default ports)
for (let p = 5170; p <= 5190; p++) {
  envOrigins.add(`http://localhost:${p}`);
  envOrigins.add(`http://127.0.0.1:${p}`);
  envOrigins.add(`https://localhost:${p}`);
  envOrigins.add(`https://127.0.0.1:${p}`);
}

const exposedHeaders = ["lrmwufitcheck-access-token"];

const corsOptions = {
  origin(origin, cb) {
    if (!CORS_CONTROL_ACTIVE) return cb(null, true);

    // allow server-to-server, curl, Postman (no Origin header)
    if (!origin) return cb(null, true);

    // quick exact-match allowlist
    if (envOrigins.has(origin)) return cb(null, true);

    const subdomainOK = allowAllSubdomains && sameBaseDomain(origin);
    if (subdomainOK) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "lrmwufitcheck-access-token",
  ],
  exposedHeaders,
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

app.set("trust proxy", true); // important if behind a proxy/CDN for secure cookies

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());

app.use(requestIp.mw());
// read client ip from req.clientIp whenever needed

app.use((req, res, next) => {
  // read authroization headder to the request
  const authHeader = req.headers.authorization || req.headers.Authorization;
  req.authorization = authHeader;
  next();
});

app.use(
  express.json({
    limit: "5mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: true }));

const isLocal = process.env.NODE_ENV == "development";

app.use((req, res, next) => {
  req.appVersion = version;
  next();
});

app.use(requestIdStamper);
app.use(boolQueryParser);

// /health responds with project + service identity AND the version
// stamp of the build this container was started from. The build
// stamp lets a poller distinguish "container is up but on the OLD
// build" from "container is up on the NEW build" — without it,
// waitForPreviewReady reports ready as soon as routing works, well
// before the latest buildServiceRepo's bytes are actually serving
// (the build-deploy gap that drove a confirmed test-fix burn cycle).
//
// REPO_VERSION / BUILD_COMMIT_SHA / BUILD_AT are populated by the
// build pipeline when the container image is stamped; absent values
// emit `null` so callers can detect they're running an unstamped /
// dev image.
const _buildStamp = {
  repoVersion: process.env.REPO_VERSION ?? process.env.SERVICE_VERSION ?? null,
  commitSha: process.env.BUILD_COMMIT_SHA ?? null,
  builtAt: process.env.BUILD_AT ?? null,
};

app.get("/health", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send({
    projectName: process.env.PROJECT_FULLNAME,
    serviceName: process.env.SERVICE_NAME,
    projectVersion: process.env.PROJECT_VERSION,
    serviceVersion: process.env.SERVICE_VERSION,
    buildStamp: _buildStamp,
    notice: "This service is generated by MindBricks",
  });
});

app.get("/admin/health", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send({
    projectName: process.env.PROJECT_FULLNAME,
    serviceName: process.env.SERVICE_NAME,
    projectVersion: process.env.PROJECT_VERSION,
    serviceVersion: process.env.SERVICE_VERSION,
    buildStamp: _buildStamp,
    notice: "This service is generated by MindBricks",
  });
});

// Framework routers are mounted at "" (canonical) AND at "/v1" (default-version
// alias). Clients can call either /login or /v1/login and hit the same
// handler. The bare path remains the documented surface for framework routes;
// /v1/<route> is a forgiveness alias for callers that prefix everything with
// the version segment. (Default version is pinned to v1 for stability —
// adding a /v2 service would mount its router separately at /v2.)
app.use("", sessionRouter);
app.use("/v1", sessionRouter);

app.use("/verification-services", verificationServicesRouter);
app.use("/v1/verification-services", verificationServicesRouter);
app.use("", socialLoginRouter);
app.use("/v1", socialLoginRouter);

app.use("", edgeRouter);
app.use("/v1", edgeRouter);

app.use("/integrations", integrationRouter);
app.use("/v1/integrations", integrationRouter);

const {
  // main Database Crud Object Rest Api Routers
  userRouter,
  userAvatarsFileRouter,
} = require("restLayer");

const sseLayerExports = require("sseLayer");
if (sseLayerExports.userSseRouter) {
  app.use("", sseLayerExports.userSseRouter);
}

app.use("", userRouter);
app.use("", userAvatarsFileRouter);

const registerWithInviteRouter = require("./routes/register-with-invite");
app.use("", registerWithInviteRouter);
app.use("/v1", registerWithInviteRouter);

const bucketRouter = require("bucketLayer/bucket-router");
app.use("", bucketRouter);

// swagger

const serviceUrl = process.env.SERVICE_URL;
let serverDescription = "Development Server";
if (process.env.NODE_ENV == "production") {
  serverDescription = "Production Server";
}

swaggerDocument.servers = [
  {
    url: serviceUrl,
    description: serverDescription,
  },
];

const forwardSwagger = async (req, res, next) => {
  // swagger has a bug when the microservice url has a path suffix
  // it only works when there is a trailing slash
  if (
    req.originalUrl.endsWith("/swagger") ||
    req.originalUrl.endsWith("/swagger/index.html")
  ) {
    res.redirect(serviceUrl + "/swagger/");
    return;
  }
  req.swaggerDoc = swaggerDocument;
  next();
};

// Add api face to the app
apiFace(app);

app.use(
  "/swagger",
  forwardSwagger,
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument),
);

const { geoRouter } = require("restLayer");
app.use("/geo", geoRouter);

const { dbAdminRouter } = require("restLayer");
app.use("", dbAdminRouter);

const mcpToolsRoutes = require("./mcp-tools-routes");
app.use("/api/mcp-tools", mcpToolsRoutes);

app.get("/favicon.ico", (req, res) => {
  const iconUrl = "https://minioapi.masaupp.com/mindbricks/favico.ico";
  res.redirect(iconUrl);
});

app.get("/ipcheck", async (req, res, next) => {
  try {
    const ipCheck = logRequestIPs(req);
    ipCheck.selectedIp = req.clientIp;
    const geoData = await getRestData(
      `https://api.ipapi.com/api/${req.clientIp}?access_key=${process.env.API_STACK_KEY}`,
    );
    ipCheck.geoData = geoData;
    const agent = parseClientInfo(req.headers).summary;
    ipCheck["user-agent"] = req.headers["user-agent"];
    ipCheck.agent = agent;
    res.send(ipCheck);
  } catch (err) {
    next(err);
  }
});

app.get("/useragent", async (req, res, next) => {
  try {
    const agent = parseClientInfo(req.headers);
    res.send(agent);
  } catch (err) {
    next(err);
  }
});

app.get("/getPostmanCollection", (req, res) => {
  const filePath = path.join(
    __dirname,
    "fitcheck-auth-postman-collection.json",
  );
  console.log("Downloading Postman Collection from:", filePath);
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="fitcheck-auth-postman-collection.json"',
  );

  res.download(filePath);
});

const loadMenu = (req) => {
  const fs = require("fs");
  const loginInfo = req.session
    ? `<p id="loginInfo">Logged in as: ${req.session.email} \n <a href="#" onclick="logout()">Logout</a></p>`
    : `<p>-- No login found --</p>`;
  const data = fs.readFileSync(path.join(__dirname, "welcome.html"), "utf8");
  return data.replace("$loginInfo", loginInfo);
};

app.get("/admin/logs", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const logCount = req.query?.count ?? 20;
  const allServices = req.query?.allServices ?? false;
  const onlyErrors = req.query?.onlyErrors ?? false;
  let logs = null;
  try {
    logs = await hexaLogger.getLastLogs(logCount, allServices, onlyErrors);
  } catch (err) {
    res
      .status(500)
      .send({ error: "Logs can not be fetched", message: err.message });
    return;
  }
  res.status(200).send(logs);
});

// ===== Elasticsearch Index Rebuild API =====
const {
  rebuildIndexByName,
  syncIndexByName,
  getAvailableDataObjects,
  syncElasticIndexData,
  rebuildAllIndexes,
} = require("./utils");

// GET available DataObjects for rebuild
app.get("/admin/elastic/objects", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const objects = getAvailableDataObjects();
    res.status(200).send({
      success: true,
      objects,
      totalCount: objects.length,
    });
  } catch (err) {
    hexaLogger.insertError(
      "GetElasticObjectsError",
      {},
      "express-app->admin/elastic/objects",
      err,
    );
    res.status(500).send({ success: false, error: err.message });
  }
});

// POST rebuild index for a specific DataObject (deletes old index)
app.post("/admin/elastic/rebuild/:dataObjectName", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { dataObjectName } = req.params;
  const { deleteOldIndex = true } = req.body || {};

  console.log(`[ADMIN API] Starting index rebuild for: ${dataObjectName}`);
  hexaLogger.insertInfo(
    "ElasticRebuildStarted",
    { dataObjectName },
    "express-app->admin/elastic/rebuild",
  );

  try {
    const result = await rebuildIndexByName(dataObjectName, { deleteOldIndex });

    if (result.success) {
      hexaLogger.insertInfo(
        "ElasticRebuildCompleted",
        {
          dataObjectName,
          indexed: result.indexed,
          durationMs: result.durationMs,
        },
        "express-app->admin/elastic/rebuild",
      );
    } else {
      hexaLogger.insertError(
        "ElasticRebuildFailed",
        {
          dataObjectName,
          error: result.error,
        },
        "express-app->admin/elastic/rebuild",
      );
    }

    res.status(result.success ? 200 : 400).send(result);
  } catch (err) {
    hexaLogger.insertError(
      "ElasticRebuildError",
      { dataObjectName },
      "express-app->admin/elastic/rebuild",
      err,
    );
    res.status(500).send({
      success: false,
      error: err.message,
      dataObjectName,
    });
  }
});

// POST sync index for a specific DataObject (keeps old index, adds new data)
app.post("/admin/elastic/sync/:dataObjectName", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { dataObjectName } = req.params;

  console.log(`[ADMIN API] Starting index sync for: ${dataObjectName}`);
  hexaLogger.insertInfo(
    "ElasticSyncStarted",
    { dataObjectName },
    "express-app->admin/elastic/sync",
  );

  try {
    const result = await syncIndexByName(dataObjectName);

    if (result.success) {
      hexaLogger.insertInfo(
        "ElasticSyncCompleted",
        {
          dataObjectName,
          indexed: result.indexed,
          durationMs: result.durationMs,
        },
        "express-app->admin/elastic/sync",
      );
    }

    res.status(result.success ? 200 : 400).send(result);
  } catch (err) {
    hexaLogger.insertError(
      "ElasticSyncError",
      { dataObjectName },
      "express-app->admin/elastic/sync",
      err,
    );
    res.status(500).send({
      success: false,
      error: err.message,
      dataObjectName,
    });
  }
});

// POST rebuild all indexes (deletes and recreates all)
app.post("/admin/elastic/rebuild-all", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  console.log("[ADMIN API] Starting full index rebuild for all DataObjects");
  hexaLogger.insertInfo(
    "ElasticRebuildAllStarted",
    {},
    "express-app->admin/elastic/rebuild-all",
  );

  try {
    const result = await rebuildAllIndexes();

    if (result.success) {
      hexaLogger.insertInfo(
        "ElasticRebuildAllCompleted",
        {
          totalIndexed: result.totalIndexed,
          durationMs: result.durationMs,
        },
        "express-app->admin/elastic/rebuild-all",
      );
    }

    res.status(result.success ? 200 : 500).send(result);
  } catch (err) {
    hexaLogger.insertError(
      "ElasticRebuildAllError",
      {},
      "express-app->admin/elastic/rebuild-all",
      err,
    );
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});

// POST sync all indexes (adds data without deleting indexes)
app.post("/admin/elastic/sync-all", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  console.log("[ADMIN API] Starting full index sync for all DataObjects");
  hexaLogger.insertInfo(
    "ElasticSyncAllStarted",
    {},
    "express-app->admin/elastic/sync-all",
  );

  try {
    const result = await syncElasticIndexData();

    if (result.success) {
      hexaLogger.insertInfo(
        "ElasticSyncAllCompleted",
        {
          totalIndexed: result.totalIndexed,
          durationMs: result.durationMs,
        },
        "express-app->admin/elastic/sync-all",
      );
    }

    res.status(result.success ? 200 : 500).send(result);
  } catch (err) {
    hexaLogger.insertError(
      "ElasticSyncAllError",
      {},
      "express-app->admin/elastic/sync-all",
      err,
    );
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});

app.get("/*name", (req, res) => {
  const result = loadMenu(req);
  res.setHeader("Content-Type", "text/html");
  res.send(result);
});

app.use(errorHandler);

module.exports = app;
