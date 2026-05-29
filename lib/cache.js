const fs = require("fs");
const path = require("path");
const NodeCache = require("node-cache");
const config = require("../config");

const memoryCache = new NodeCache({
  stdTTL: config.cache.ttlSeconds,
  checkperiod: config.cache.checkperiodSeconds,
  useClones: false,
});

let persistLoaded = false;

function ensureCacheDir() {
  const dir = path.dirname(path.resolve(config.cache.persistPath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadPersistedCache() {
  if (persistLoaded) return;
  persistLoaded = true;
  const filePath = path.resolve(config.cache.persistPath);
  if (!fs.existsSync(filePath)) return;

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const stored = JSON.parse(raw);
    if (stored && typeof stored === "object") {
      for (const [key, entry] of Object.entries(stored)) {
        if (!entry || typeof entry.exp !== "number") continue;
        const ttl = Math.max(1, Math.floor((entry.exp - Date.now()) / 1000));
        if (ttl > 0 && entry.value !== undefined) {
          memoryCache.set(key, entry.value, ttl);
        }
      }
    }
  } catch (err) {
    console.warn("[cache] Failed to load persisted cache:", err.message);
  }
}

function persistCache() {
  try {
    ensureCacheDir();
    const keys = memoryCache.keys();
    const payload = {};
    for (const key of keys) {
      const ttl = memoryCache.getTtl(key);
      payload[key] = {
        value: memoryCache.get(key),
        exp: ttl || Date.now() + config.cache.ttlSeconds * 1000,
      };
    }
    fs.writeFileSync(path.resolve(config.cache.persistPath), JSON.stringify(payload), "utf8");
  } catch (err) {
    console.warn("[cache] Failed to persist cache:", err.message);
  }
}

function setCache(key, value) {
  loadPersistedCache();
  memoryCache.set(key, value);
  persistCache();
}

function getCache(key) {
  loadPersistedCache();
  return memoryCache.get(key);
}

function hasCache(key) {
  loadPersistedCache();
  return memoryCache.has(key);
}

module.exports = {
  setCache,
  getCache,
  hasCache,
};
