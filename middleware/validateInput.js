const security = require("../config/security");
const { isAllowedScrapeUrl, isValidSectionId } = require("../utils/urlValidation");

function clampPage(query) {
  const page = parseInt(String(query.page || "1"), 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, security.maxPage);
}

function validateSectionId(req, res, next) {
  if (!isValidSectionId(req.params.id)) {
    return res.status(400).json({
      error: true,
      message: "Invalid id parameter",
      code: "INVALID_ID",
    });
  }
  return next();
}

function validateWatchUrl(req, res, next) {
  const rawUrl = req.query.url;
  if (!rawUrl || typeof rawUrl !== "string") {
    return res.status(400).json({
      error: true,
      message: "Query parameter `url` is required (URL-encoded watch page URL)",
      code: "MISSING_URL",
    });
  }

  if (rawUrl.length > security.maxWatchUrlLength) {
    return res.status(400).json({
      error: true,
      message: "URL parameter too long",
      code: "URL_TOO_LONG",
    });
  }

  let watchPageUrl;
  try {
    watchPageUrl = decodeURIComponent(rawUrl.trim());
  } catch {
    return res.status(400).json({
      error: true,
      message: "Invalid URL encoding in `url` parameter",
      code: "INVALID_URL",
    });
  }

  const config = require("../config");
  if (!/^https?:\/\//i.test(watchPageUrl)) {
    watchPageUrl = config.resolveUrl(watchPageUrl);
  }

  if (!isAllowedScrapeUrl(watchPageUrl)) {
    return res.status(400).json({
      error: true,
      message: "URL host is not allowed",
      code: "URL_NOT_ALLOWED",
    });
  }

  req.watchPageUrl = watchPageUrl;
  return next();
}

module.exports = {
  clampPage,
  validateSectionId,
  validateWatchUrl,
};
