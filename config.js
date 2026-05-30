/**
 * Central configuration: base URL, selectors, pagination, cache, and watch-page rules.
 * Update selectors here when the target site changes layout — no core code edits needed.
 */

require("dotenv").config();

const security = require("./config/security");

const BASE_URL = process.env.SCRAPE_BASE_URL || "https://www.tubev.sex";
/** @param {string} pathOrUrl */
function resolveUrl(pathOrUrl) {
  if (!pathOrUrl) return BASE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  try {
    return new URL(pathOrUrl, BASE_URL).href;
  } catch {
    return `${BASE_URL.replace(/\/$/, "")}/${String(pathOrUrl).replace(/^\//, "")}`;
  }
}

/** @param {string} url @param {number} page */
function withPage(url, page) {
  const p = Math.max(1, parseInt(String(page), 10) || 1);
  if (p === 1) return url;
  const u = new URL(url);
  u.searchParams.set("page", String(p));
  return u.href;
}

/** @param {string} id — URL-encoded relative path from list link (e.g. %2Fpornstars%2Fname) */
/** @param {string} url @param {string} id — URL-encoded relative path or absolute URL */
function sectionUrl(listUrl, id, page) {
  let cleanId = decodeURIComponent(id).trim();

  // 1. Flutter UI ကနေ URL အပြည့်ကြီး လှမ်းပို့လိုက်ရင် Base URL ကြီးကို ဖြုတ်ပစ်မယ့်စနစ်
  if (cleanId.startsWith("http://") || cleanId.startsWith("https://")) {
    try {
      const parsedUrl = new URL(cleanId);
      cleanId = parsedUrl.pathname; // "/categories/1176/teen" သို့မဟုတ် "/pornstars/name" ပဲ ကျန်ပါမယ်
    } catch (e) {
      // JSON syntax error မတက်အောင် fallback ထားခြင်း
    }
  }

  // 2. target endpoints ရဲ့ path စာသားတွေ (ဥပမာ- /categories/, /pornstars/) ပါမပါ စစ်ဆေးပြီး သန့်စင်မယ်
  // listUrl ထဲက လမ်းကြောင်းကို ယူပါတယ် (ဥပမာ- "https://www.tubev.sex/categories" ကနေ "/categories" ရအောင် လုပ်တာပါ)
  const listPath = new URL(listUrl).pathname; // "/categories" သို့မဟုတ် "/pornstars"
  
  if (cleanId.includes(listPath)) {
    const parts = cleanId.split(listPath);
    cleanId = parts[parts.length - 1]; // "1176/teen" သို့မဟုတ် "/1176/teen"
  }

  // 3. အရှေ့ဆုံးမှာ / ပါနေရင် လမ်းကြောင်းတွေ မထပ်အောင် ဖြုတ်ပစ်ပါတယ်
  if (cleanId.startsWith('/')) {
    cleanId = cleanId.substring(1); // "1176/teen" သန့်သန့်လေး ဖြစ်သွားပါပြီ
  }

  // 4. listUrl ရဲ့ အနောက်မှာ သန့်စင်ပြီးသား cleanId ကို ကွက်တိ သွားကပ်ပေးလိုက်ပါတယ်
  const baseUrlWithId = `${listUrl.replace(/\/$/, "")}/${cleanId}`;
  
  // 5. စာမျက်နှာ Pagination အတွက် withPage ထဲ ထည့်ပြီး Return ပြန်ပါတယ်
  return withPage(baseUrlWithId, page);
}
/*function sectionUrl(listUrl, id, page) {
  const path = decodeURIComponent(id);
  const base = resolveUrl(path.startsWith("/") ? path : `/${path}`);
  return withPage(base, page);
}*/

module.exports = {
  port: security.port,
  host: security.host,
  security,

  baseUrl: BASE_URL,

  http: {
    timeoutMs: 30_000,
    maxRedirects: 5,
    userAgent:
      process.env.SCRAPER_USER_AGENT ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    acceptLanguage: "en-US,en;q=0.9",
  },

  cache: {
    ttlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 8 * 60 * 60,
    checkperiodSeconds: Number(process.env.CACHE_CHECK_PERIOD) || 600,
    cronExpression: process.env.CACHE_CRON || "0 */8 * * *",
    persistPath: process.env.CACHE_PATH || "./cache/store.json",
  },

  pagination: {
    withPage,
    sectionUrl,
  },

  endpoints: {
    home: {
      cacheKey: (page) => `home:${page}`,
      getUrl: (page) => withPage("https://www.tubev.sex/videos", page),
      list: "figure.drop-label_else",
      title: { selector: "a.i.tur", attr: "title" },
      img: { selector: "img", attr: "data-src" },
      link: { selector: "a.i.tur", attr: "href" },
    },

    model: {
      listCacheKey: "model:list",
      sectionCacheKey: (id, page) => `model:section:${id}:${page}`,
      listUrl: "https://www.tubev.sex/",
      list: ".thumbs-layout figure",
      title: { selector: "img", attr: "alt" },
      img: { selector: "img", attr: "src" },
      link: { selector: "a", attr: "href" },
      section: {
        getUrl: (id, page) => sectionUrl("https://www.tubev.sex/", id, page),
        list: "figure.drop-label_else",
        title: { selector: "a.i.tur", attr: "title" },
        img: { selector: "img", attr: "data-src" },
        link: { selector: "a.i.tur", attr: "href" },
      },
    },

    channel: {
      listCacheKey: "channel:list",
      sectionCacheKey: (id, page) => `channel:section:${id}:${page}`,
      listUrl: "https://www.tubev.sex/channels",
      list: "#all_list figure",
      title: { selector: "a.i", attr: "title" },
      img: { selector: "img", attr: "data-src" },
      link: { selector: "a.i", attr: "href" },
      section: {
        getUrl: (id, page) => sectionUrl("https://www.tubev.sex/channels", id, page),
        list: "figure.drop-label_else",
        title: { selector: "a.i.tur", attr: "title" },
        img: { selector: "img", attr: "data-src" },
        link: { selector: "a.i.tur", attr: "href" },
      },
    },

    tag: {
      listCacheKey: "tags:list",
      sectionCacheKey: (id, page) => `tags:section:${id}:${page}`,
      listUrl: "https://www.tubev.sex/categories",
      list: "#all_list li a",
      title: { selector: null, text: true },
      link: { attr: "href" },
      section: {
        getUrl: (id, page) => sectionUrl("https://www.tubev.sex/categories", id, page),
        list: "figure.drop-label_else",
        title: { selector: "a.i.tur", attr: "title" },
        img: { selector: "img", attr: "data-src" },
        link: { selector: "a.i.tur", attr: "href" },
      },
    },
  },

  watch: {
    /** Tried in order until a non-empty stream URL is found */
    sources: [
      { selector: "video source", attr: "src" },
      { selector: "video", attr: "src" },
      { selector: "iframe#player, iframe.player, .player iframe, iframe", attr: "src" },
      { selector: "source[type='video/mp4']", attr: "src" },
      { selector: "[data-video], [data-src]", attr: "data-video" },
      { selector: "[data-video], [data-src]", attr: "data-src" },
    ],
    /** Optional regexes run against raw HTML (e.g. embedded JSON or m3u8 in scripts) */
    htmlPatterns: [
      /"(?:file|src|video_url|videoUrl|hls_url|hlsUrl)"\s*:\s*"([^"]+)"/i,
      /(?:src|file)\s*[:=]\s*['"](https?:\/\/[^'"]+\.(?:mp4|m3u8)[^'"]*)['"]/i,
      /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i,
    ],
  },

  resolveUrl,
  withPage,
  sectionUrl,
};
