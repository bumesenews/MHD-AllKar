const express = require("express");
const config = require("./config");
const apiRoutes = require("./routes/api");
const { warmMainCaches } = require("./services/warmCache");
const { startCacheScheduler } = require("./cron/scheduler");

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(apiRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: true, message: "Not found", code: "NOT_FOUND" });
});

const server = app.listen(config.port, config.host, () => {
  console.log(`Scraper API listening on http://${config.host}:${config.port}`);
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
