const listScraper = require("./listScraper");

/** Pre-warm main listing caches (cron + startup). */
async function warmMainCaches() {
  const tasks = [
    { name: "home:1", fn: () => listScraper.scrapeHome(1) },
    { name: "model:list", fn: () => listScraper.scrapeModelList() },
    { name: "tags:list", fn: () => listScraper.scrapeTagList() },
    { name: "channel:list", fn: () => listScraper.scrapeChannelList() },
  ];

  for (const task of tasks) {
    try {
      await task.fn();
      console.log(`[cron] Cache warmed: ${task.name}`);
    } catch (err) {
      console.error(`[cron] Failed to warm ${task.name}:`, err.message);
    }
  }
}

module.exports = { warmMainCaches };
