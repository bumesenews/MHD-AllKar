const express = require("express");
const listScraper = require("../services/listScraper");
const { scrapeWatch } = require("../services/watchScraper");
const { parsePage, sendList, handleError } = require("../utils/httpResponse");
const { watchLimiter } = require("../middleware/securityStack");
const {
  validateSectionId,
  validateWatchUrl,
} = require("../middleware/validateInput");

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

router.get("/api/model/:id", validateSectionId, async (req, res) => {
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

router.get("/api/tags/:id", validateSectionId, async (req, res) => {
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

router.get("/api/channel/:id", validateSectionId, async (req, res) => {
  try {
    const page = parsePage(req.query);
    const data = await listScraper.scrapeChannelSection(req.params.id, page);
    sendList(res, data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/api/watch", watchLimiter, validateWatchUrl, async (req, res) => {
  try {
    const data = await scrapeWatch(req.watchPageUrl);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
