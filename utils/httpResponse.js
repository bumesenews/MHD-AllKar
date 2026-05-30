const security = require("../config/security");

function parsePage(query) {
  const page = parseInt(String(query.page || "1"), 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, security.maxPage);
}

function sendList(res, data) {
  res.json(Array.isArray(data) ? data : []);
}

function handleError(res, err) {
  const status =
    err.code === "WATCH_NOT_FOUND"
      ? 404
      : err.response?.status === 404
        ? 404
        : err.code === "ENOTFOUND" || err.code === "ECONNREFUSED"
          ? 502
          : 500;

  const payload = {
    error: true,
    code: err.code || "INTERNAL_ERROR",
  };

  if (security.isProduction) {
    payload.message =
      status === 500 ? "Internal server error" : err.message || "Request failed";
  } else {
    payload.message = err.message || "Request failed";
  }

  res.status(status).json(payload);
}

module.exports = {
  parsePage,
  sendList,
  handleError,
};
