const security = require("../config/security");

/**
 * SSRF guard: only scrape URLs on configured hostnames.
 * @param {string} url
 */
function isAllowedScrapeUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (url.length > security.maxWatchUrlLength) return false;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) return false;

  const host = parsed.hostname.toLowerCase();
  const allowed = security.allowedScrapeHosts;

  if (!allowed.length) return false;

  return allowed.some((allowedHost) => {
    const h = allowedHost.toLowerCase();
    return host === h || host.endsWith(`.${h}`);
  });
}

/**
 * @param {string} id
 */
function isValidSectionId(id) {
  if (!id || typeof id !== "string") return false;
  if (id.length > security.maxIdLength) return false;
  if (/[\0\r\n]/.test(id)) return false;
  return true;
}

module.exports = {
  isAllowedScrapeUrl,
  isValidSectionId,
};
