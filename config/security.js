/**
 * Security settings (loaded from environment).
 * Copy .env.example to .env on the server and set strong secrets.
 */

const BASE_URL = process.env.SCRAPE_BASE_URL || "https://www.tubev.sex";

function parseHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

const defaultScrapeHost = parseHostname(BASE_URL);
const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

function parseList(envValue, fallback = []) {
  if (!envValue || !String(envValue).trim()) return fallback;
  return String(envValue)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = {
  nodeEnv,
  isProduction,
  isDevelopment: !isProduction,

  /** Bind to localhost in production; nginx terminates TLS/public traffic */
  host: process.env.HOST || (isProduction ? "127.0.0.1" : "0.0.0.0"),
  port: Number(process.env.PORT) || 3000,

  apiKey: process.env.API_KEY || "",
  requireApiKey:
    process.env.REQUIRE_API_KEY === "true" ||
    (process.env.REQUIRE_API_KEY !== "false" && isProduction),

  trustProxy: process.env.TRUST_PROXY === "true" || isProduction,

  corsOrigins: parseList(process.env.CORS_ORIGINS),
  corsCredentials: process.env.CORS_CREDENTIALS === "true",

  allowedScrapeHosts: parseList(process.env.ALLOWED_SCRAPE_HOSTS, defaultScrapeHost ? [defaultScrapeHost] : []),

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 120,
    watchMax: Number(process.env.RATE_LIMIT_WATCH_MAX) || 25,
  },

  jsonLimit: process.env.JSON_BODY_LIMIT || "16kb",
  maxPage: Math.min(Number(process.env.MAX_PAGE) || 500, 10_000),
  maxIdLength: Number(process.env.MAX_ID_LENGTH) || 2048,
  maxWatchUrlLength: Number(process.env.MAX_WATCH_URL_LENGTH) || 4096,
};
