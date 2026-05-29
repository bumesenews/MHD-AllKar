const express = require("express");
const config = require("../config");
const listScraper = require("../services/listScraper");
const { scrapeWatch } = require("../services/watchScraper");
const { parsePage, sendList, handleError } = require("../utils/httpResponse");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

router.get("/api/home", async (req, res) => {
  try {
    const page = parsePage(req.query);
    const data = await listScraper.scrapeHome(page);
    sendList(res, data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/api/model", async (_req, res) => {
  try {
    const data = await listScraper.scrapeModelList();
    sendList(res, data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/api/model/:id", async (req, res) => {
  try {
    const page = parsePage(req.query);
    const data = await listScraper.scrapeModelSection(req.params.id, page);
    sendList(res, data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/api/tags", async (_req, res) => {
  try {
    const data = await listScraper.scrapeTagList();
    sendList(res, data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/api/tags/:id", async (req, res) => {
  try {
    const page = parsePage(req.query);
    const data = await listScraper.scrapeTagSection(req.params.id, page);
    sendList(res, data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/api/channel", async (_req, res) => {
  try {
    const data = await listScraper.scrapeChannelList();
    sendList(res, data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/api/channel/:id", async (req, res) => {
  try {
    const page = parsePage(req.query);
    const data = await listScraper.scrapeChannelSection(req.params.id, page);
    sendList(res, data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/api/watch", async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl || typeof rawUrl !== "string") {
      return res.status(400).json({
        error: true,
        message: "Query parameter `url` is required (URL-encoded watch page URL)",
        code: "MISSING_URL",
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

    if (!/^https?:\/\//i.test(watchPageUrl)) {
      watchPageUrl = config.resolveUrl(watchPageUrl);
    }

    const data = await scrapeWatch(watchPageUrl);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
