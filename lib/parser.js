const config = require("../config");

/**
 * @param {import('cheerio').CheerioAPI} $
 * @param {import('cheerio').Cheerio<import('cheerio').AnyNode>} $el
 * @param {{ selector?: string | null, attr?: string, text?: boolean }} field
 */
function extractField($, $el, field) {
  if (!field) return "";

  if (field.attr === "href" && !field.selector) {
    const href = $el.attr("href");
    return href ? config.resolveUrl(href) : "";
  }

  const target = field.selector ? $el.find(field.selector).first() : $el;

  if (field.text) {
    return target.text().trim();
  }

  if (field.attr) {
    const val =
      target.attr(field.attr) ||
      target.attr("src") ||
      target.attr("data-src") ||
      target.attr("data-original") ||
      "";
    if (field.attr === "href" && val) {
      return config.resolveUrl(val);
    }
    if (val && !/^https?:\/\//i.test(val) && (field.attr.includes("src") || field.attr.includes("original"))) {
      return config.resolveUrl(val);
    }
    return val;
  }

  return target.text().trim();
}

/**
 * @param {import('cheerio').CheerioAPI} $
 * @param {object} listConfig
 * @returns {Array<{ title: string, img: string, watch_url: string }>}
 */
function parseList($, listConfig) {
  const items = [];
  const { list, title, img, link } = listConfig;

  $(list).each((_, el) => {
    const $el = $(el);

    const titleVal = extractField($, $el, title);
    const linkVal = extractField($, $el, link);
    let imgVal = img ? extractField($, $el, img) : "";

    if (imgVal && !/^https?:\/\//i.test(imgVal)) {
      imgVal = config.resolveUrl(imgVal);
    }

    if (!titleVal && !linkVal) return;

    items.push({
      title: titleVal || "",
      img: imgVal || "",
      watch_url: linkVal || "",
    });
  });

  return items;
}

module.exports = {
  extractField,
  parseList,
};
