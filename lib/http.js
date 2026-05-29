const axios = require("axios");
const config = require("../config");

const httpClient = axios.create({
  timeout: config.http.timeoutMs,
  maxRedirects: config.http.maxRedirects,
  headers: {
    "User-Agent": config.http.userAgent,
    Accept: config.http.accept,
    "Accept-Language": config.http.acceptLanguage,
  },
  validateStatus: (status) => status >= 200 && status < 400,
});

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchHtml(url) {
  const target = config.resolveUrl(url);
  const { data } = await httpClient.get(target, { responseType: "text" });
  return typeof data === "string" ? data : String(data);
}

module.exports = {
  httpClient,
  fetchHtml,
};
