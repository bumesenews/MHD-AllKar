const { getCache, setCache, hasCache } = require("../lib/cache");

/**
 * @param {string} cacheKey
 * @param {() => Promise<Array>} fetcher
 */
async function getOrScrape(cacheKey, fetcher) {
  if (hasCache(cacheKey)) {
    return getCache(cacheKey);
  }

  const data = await fetcher();
  setCache(cacheKey, data);
  return data;
}

module.exports = { getOrScrape };
