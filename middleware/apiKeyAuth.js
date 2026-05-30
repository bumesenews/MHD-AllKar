const security = require("../config/security");

/** Paths that stay public (load balancers / monitoring). */
const PUBLIC_PATHS = new Set(["/health"]);

function apiKeyAuth(req, res, next) {
  if (!security.requireApiKey) return next();
  if (PUBLIC_PATHS.has(req.path)) return next();

  if (!security.apiKey) {
    console.error("[security] API_KEY is required but not set");
    return res.status(503).json({
      error: true,
      message: "Service misconfigured",
      code: "SERVICE_UNAVAILABLE",
    });
  }

  const provided =
    req.get("x-api-key") ||
    req.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (!provided || provided !== security.apiKey) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  return next();
}

module.exports = { apiKeyAuth };
