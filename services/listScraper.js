const cheerio = require("cheerio");
const config = require("../config");
const { fetchHtml } = require("../lib/http");
const { extractField, parseList } = require("../lib/parser");
const { getOrScrape } = require("./scrapeWithCache");

/**
 * @param {string} url
 * @param {object} listConfig
 */
async function scrapeListPage(url, listConfig) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  return parseList($, listConfig);
}

async function scrapeHome(page = 1) {
  const { cacheKey, getUrl, ...listConfig } = config.endpoints.home;
  const key = cacheKey(page);
  const url = getUrl(page);
  return getOrScrape(key, () => scrapeListPage(url, listConfig));
}

async function scrapeModelList() {
  const { listCacheKey, listUrl, ...listConfig } = config.endpoints.model;
  return getOrScrape(listCacheKey, () => scrapeListPage(listUrl, listConfig));
}

async function scrapeModelSection(id, page = 1) {
  const { sectionCacheKey, section } = config.endpoints.model;
  const key = sectionCacheKey(id, page);
  const url = section.getUrl(id, page);
  return getOrScrape(key, () => scrapeListPage(url, section));
}

async function scrapeChannelList() {
  const { listCacheKey, listUrl, ...listConfig } = config.endpoints.channel;
  return getOrScrape(listCacheKey, () => scrapeListPage(listUrl, listConfig));
}

async function scrapeChannelSection(id, page = 1) {
  const { sectionCacheKey, section } = config.endpoints.channel;
  const key = sectionCacheKey(id, page);
  const url = section.getUrl(id, page);
  return getOrScrape(key, () => scrapeListPage(url, section));
}

async function scrapeTagList() {
  const { listCacheKey, listUrl, list, title, link } = config.endpoints.tag;
  return getOrScrape(listCacheKey, async () => {
    const html = await fetchHtml(listUrl);
    const $ = cheerio.load(html);
    const items = [];

    $(list).each((_, el) => {
      const $el = $(el);
      const titleVal = extractField($, $el, title);
      const linkVal = extractField($, $el, link);
      if (!titleVal && !linkVal) return;
      items.push({
        title: titleVal || "",
        img: "",
        watch_url: linkVal || "",
      });
    });

    return items;
  });
}

async function scrapeTagSection(id, page = 1) {
  const { sectionCacheKey, section } = config.endpoints.tag;
  const key = sectionCacheKey(id, page);
  const url = section.getUrl(id, page);
  return getOrScrape(key, () => scrapeListPage(url, section));
}

module.exports = {
  scrapeListPage,
  scrapeHome,
  scrapeModelList,
  scrapeModelSection,
  scrapeChannelList,
  scrapeChannelSection,
  scrapeTagList,
  scrapeTagSection,
};
