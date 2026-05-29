const cheerio = require("cheerio");
const config = require("../config");
const { fetchHtml } = require("../lib/http");

/**
 * Live scrape — never cached.
 * @param {string} watchPageUrl
 */
async function scrapeWatch(watchPageUrl) {
  const html = await fetchHtml(watchPageUrl);
  const $ = cheerio.load(html);

  for (const rule of config.watch.sources) {
    const el = $(rule.selector).first();
    if (!el.length) continue;
    const val = el.attr(rule.attr);
    if (val && val.trim()) {
      const streamUrl = /^https?:\/\//i.test(val) ? val : config.resolveUrl(val);
      return {
        watch_url: config.resolveUrl(watchPageUrl),
        stream_url: streamUrl,
        type: rule.selector.includes("iframe") ? "iframe" : "direct",
      };
    }
  }

  for (const pattern of config.watch.htmlPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const streamUrl = match[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/");
      return {
        watch_url: config.resolveUrl(watchPageUrl),
        stream_url: streamUrl,
        type: streamUrl.includes(".m3u8") ? "hls" : "direct",
      };
    }
  }

  const err = new Error("No video source found on watch page");
  err.code = "WATCH_NOT_FOUND";
  throw err;
}

module.exports = { scrapeWatch };
