require("dotenv").config();

const express = require("express");
const config = require("./config");
const apiRoutes = require("./routes/api");
const { warmMainCaches } = require("./services/warmCache");
const { startCacheScheduler } = require("./cron/scheduler");
const { apiKeyAuth } = require("./middleware/apiKeyAuth");
const {
  helmetMiddleware,
  corsMiddleware,
  generalLimiter,
} = require("./middleware/securityStack");

const app = express();

if (config.security.trustProxy) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(generalLimiter);
app.use(express.json({ limit: config.security.jsonLimit }));
app.use(apiKeyAuth);
app.use(apiRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: true, message: "Not found", code: "NOT_FOUND" });
});

if (config.security.requireApiKey && !config.security.apiKey) {
  console.error(
    "[security] FATAL: API_KEY must be set when REQUIRE_API_KEY is enabled (production default).",
  );
  process.exit(1);
}

const server = app.listen(config.port, config.host, () => {
  const env = config.security.nodeEnv;
  console.log(`Scraper API [${env}] listening on http://${config.host}:${config.port}`);
  if (config.security.requireApiKey) {
    console.log("[security] API key authentication enabled");
  }
  warmMainCaches().catch((err) => {
    console.warn("[startup] Initial cache warm failed:", err.message);
  });
});

startCacheScheduler();

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;
