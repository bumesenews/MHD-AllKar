function parsePage(query) {
  const page = parseInt(String(query.page || "1"), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
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

  res.status(status).json({
    error: true,
    message: err.message || "Request failed",
    code: err.code || "INTERNAL_ERROR",
  });
}

module.exports = {
  parsePage,
  sendList,
  handleError,
};
