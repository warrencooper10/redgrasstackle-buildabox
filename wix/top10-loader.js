// Staged Wix Velo integration module. NOT installed on Wix yet.
// This source can be adapted to Wix public modules in a single reviewed integration.
// A weekly lineup change edits ONLY assets/data/top10.json, never this file.
const BASE = "https://warrencooper10.github.io/redgrasstackle-buildabox/assets/";
const TOP10_URL = BASE + 'data/top10.json';
const CATALOG_URL = BASE + 'data/baits.json';
const IMAGE_BASE = BASE + 'images/';
const FALLBACK_IMAGE = IMAGE_BASE + 'logo-redgrass.png';
const BASELINE = [
  {
    "optionId": 480359580,
    "profile": "2\" BA Split Tail",
    "color": "Cookies N Cream",
    "imageFilename": "ba_cookies.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/2-ba-split-tail-cookies-n-cream",
    "tier": "core"
  },
  {
    "optionId": 480359547,
    "profile": "2\" BA Split Tail",
    "color": "Red Belly",
    "imageFilename": "ba_redbelly.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/2-ba-split-tail-red-belly",
    "tier": "core"
  },
  {
    "optionId": 480359577,
    "profile": "2.5\" Skinny Minnow",
    "color": "Cookies N Cream",
    "imageFilename": "skinny_cookies.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/25-skinny-minnow-cookies-n-cream",
    "tier": "core"
  },
  {
    "optionId": 480359544,
    "profile": "2.5\" Skinny Minnow",
    "color": "Red Belly",
    "imageFilename": "skinny_redbelly.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/25-skinny-minnow-red-belly",
    "tier": "core"
  },
  {
    "optionId": 480359574,
    "profile": "3\" Chubby Minnow",
    "color": "Cookies N Cream",
    "imageFilename": "chubby_cookies.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/3-chubby-cookies-n-cream",
    "tier": "core"
  },
  {
    "optionId": 480359541,
    "profile": "3\" Chubby Minnow",
    "color": "Red Belly",
    "imageFilename": "chubby_redbelly.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/3-chubby-minnow-red-belly",
    "tier": "core"
  },
  {
    "optionId": 480359586,
    "profile": "2\" Flicker Minnow",
    "color": "Cookies N Cream",
    "imageFilename": "flicker_cookies.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/2-flicker-cookies-n-cream",
    "tier": "core"
  },
  {
    "optionId": 480359553,
    "profile": "2\" Flicker Minnow",
    "color": "Red Belly",
    "imageFilename": "flicker_redbelly.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/2-flicker-minnow-red-belly",
    "tier": "core"
  },
  {
    "optionId": 480359583,
    "profile": "2\" Ribbed Paddletail",
    "color": "Cookies N Cream",
    "imageFilename": "paddle_cookies.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/2-ribbed-paddletail-cookies-n-cream",
    "tier": "core"
  },
  {
    "optionId": 480359550,
    "profile": "2\" Ribbed Paddletail",
    "color": "Red Belly",
    "imageFilename": "paddle_redbelly.PNG",
    "bigCartelUrl": "https://www.redgrasstackle.com/product/2-ribbed-paddletail-red-belly",
    "tier": "core"
  }
];

function validateAndResolve(config, catalog) {
  if (config?.schemaVersion !== 1) throw Error('Unsupported Top 10 schema');
  const ids = config?.optionIds;
  if (!Array.isArray(ids) || ids.length !== 10 || new Set(ids).size !== 10)
    throw Error('Top 10 must contain exactly ten distinct product IDs');
  if (!Array.isArray(catalog)) throw Error('Product catalog unavailable');
  const byId = new Map(catalog.map(x => [Number(x.optionId), x]));
  const selected = ids.map(id => {
    if (!Number.isSafeInteger(id) || id < 1) throw Error('Invalid product ID');
    const item = byId.get(id);
    if (!item) throw Error('Unknown product ID: ' + id);
    if (!/^[A-Za-z0-9_.-]+$/.test(item.imageFilename || ''))
      throw Error('Invalid image filename for '+id);
    let dest;
    try { dest = new URL(item.bigCartelUrl); } catch { throw Error('Invalid product link for '+id); }
    if (dest.protocol !== 'https:' || !['www.redgrasstackle.com','redgrasstackle.bigcartel.com','store.redgrasstackle.com'].includes(dest.hostname) || !dest.pathname.startsWith('/product/'))
      throw Error('Unapproved product link for '+id);
    return item;
  });
  if (selected.length !== 10) throw Error('Featured count was not ten');
  return selected;
}

function toGalleryItems(selected, brokenImageNames = new Set()) {
  return selected.map((item) => ({
    type: 'image',
    src: brokenImageNames.has(item.imageFilename) ? FALLBACK_IMAGE : IMAGE_BASE + item.imageFilename,
    title: item.profile + ' - ' + item.color,
    description: item.tier === 'seasonal' ? 'Seasonal Color' : 'Core Color',
    link: item.bigCartelUrl,
    target: '_blank'
  }));
}

// Optional image HEAD checks. Pro Gallery doesn't expose an individual image.onerror;
// these checks must run BEFORE handing the items to Wix's gallery.
// A timeout/opaque/CORS/network error is 'unknown', not automatically broken.
async function findMissingImages(items, fetcher, timeoutMs = 3000) {
  const missing = new Set();
  await Promise.all(items.map(async item => {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    let timer;
    try {
      if (controller && typeof setTimeout === 'function')
        timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetcher(IMAGE_BASE + item.imageFilename, {method: 'HEAD', ...(controller ? {signal:controller.signal}: {})});
      if (response.status === 404 || response.status === 410) missing.add(item.imageFilename);
    } catch (_) {
      // Do not substitute fallback for an unverified image on temporary network failure.
    } finally { if (timer) clearTimeout(timer); }
  }));
  return missing;
}

// Pass Wix's fetch to avoid coupling this module to any specific version of wix-fetch.
// Keep lastGood outside this module (Wix storage or page state). Only a fully validated
// 10-item lineup can be saved as lastGood.
export async function loadRemoteTop10(fetcher, lastGood = null, options = {}) {
  let selected, source = 'remote', warning = null;
  try {
    const [configResponse, catalogResponse] = await Promise.all([fetcher(TOP10_URL),fetcher(CATALOG_URL)]);
    if (!configResponse.ok || !catalogResponse.ok) throw Error('GitHub data feed unavailable');
    const [config, catalog] = await Promise.all([configResponse.json(),catalogResponse.json()]);
    selected = validateAndResolve(config,catalog);
  } catch (e) {
    warning = String(e?.message || e);
    if (Array.isArray(lastGood) && lastGood.length === 10) {
      try {
        selected = validateAndResolve({schemaVersion:1,optionIds:lastGood.map(x=>x.optionId)},lastGood);
        source = 'last-known-good';
      } catch (_) { /* Ignore corrupted cache */ }
    }
    if (!selected) {selected = BASELINE;source = 'baseline';}
  }
  let broken = new Set();
  if (options.preflightImages) broken = await findMissingImages(selected,fetcher,options.imageTimeoutMs || 3000);
  const items = toGalleryItems(selected,broken);
  if (items.length !== 10) throw Error('Invariant violation: gallery must have 10 items');
  return {items,selected,source,warning,missingImages:[...broken],fallbackImage:FALLBACK_IMAGE};
}
