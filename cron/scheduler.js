const cron = require("node-cron");
const config = require("../config");
const { warmMainCaches } = require("../services/warmCache");

function startCacheScheduler() {
  if (!cron.validate(config.cache.cronExpression)) {
    console.warn("[cron] Invalid cron expression:", config.cache.cronExpression);
    return;
  }

  cron.schedule(config.cache.cronExpression, () => {
    console.log("[cron] Starting scheduled cache refresh...");
    warmMainCaches();
  });
}

module.exports = { startCacheScheduler };
