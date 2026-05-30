const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const security = require("../config/security");

const generalLimiter = rateLimit({
  windowMs: security.rateLimit.windowMs,
  max: security.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: "Too many requests",
    code: "RATE_LIMITED",
  },
});

const watchLimiter = rateLimit({
  windowMs: security.rateLimit.windowMs,
  max: security.rateLimit.watchMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: "Too many watch requests",
    code: "RATE_LIMITED",
  },
});

function buildCorsOptions() {
  const origins = security.corsOrigins;

  if (security.isProduction && origins.length === 0) {
    return {
      origin: false,
      credentials: security.corsCredentials,
    };
  }

  if (origins.length === 0) {
    return {
      origin: true,
      credentials: security.corsCredentials,
    };
  }

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (origins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    credentials: security.corsCredentials,
  };
}

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

const corsMiddleware = cors(buildCorsOptions());

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  generalLimiter,
  watchLimiter,
};
