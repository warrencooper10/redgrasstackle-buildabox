#!/usr/bin/env node
// Read-only validator for the Redgrass Tackle Top 10. Does not publish changes.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const load = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const config = load('assets/data/top10.json');
const baits = load('assets/data/baits.json');
const errors = [], warnings = [];
const ids = config.optionIds;
const imageDir = path.resolve(ROOT, 'assets/images');
const safeImage = name => typeof name === 'string' && /^[A-Za-z0-9_.-]+$/.test(name);
if (config.schemaVersion !== 1) errors.push('Unsupported schemaVersion');
if (config.testMissingImageSlot !== undefined && config.testMissingImageSlot !== 1) errors.push('Image test is allowed only on slot 1');
if (config.testMissingImageSlot === 1 && config.optionIds?.[0] !== 480354642) errors.push('Image test requires Monkey Milk in slot 1');
if (config.testMissingImageSlot === 1) warnings.push('Temporary slot 1 image fallback test enabled');
if (!Array.isArray(ids) || ids.length !== 10) errors.push('Exactly ten optionIds are required');
if (Array.isArray(ids) && new Set(ids).size !== 10) errors.push('Duplicate featured optionId');
if (!Array.isArray(baits)) errors.push('Catalog must be an array');
const byId = new Map(baits.map(x => [Number(x.optionId), x]));
if (byId.size !== baits.length) errors.push('Duplicate option IDs in catalog');
if (typeof config.fallbackImage !== 'string' || !/^assets\/images\/[A-Za-z0-9_.-]+$/.test(config.fallbackImage))
  errors.push('Invalid fallbackImage path');
else if (!fs.existsSync(path.join(ROOT, config.fallbackImage)))
  errors.push('Fallback image file missing');
const choices = [];
for (const [index, id] of (Array.isArray(ids) ? ids : []).entries()) {
  if (!Number.isSafeInteger(id) || id <= 0) { errors.push('Invalid ID at slot '+(index+1)); continue; }
  const bait = byId.get(id);
  if (!bait) { errors.push('Missing catalog entry for '+id); continue; }
  const filename = bait.imageFilename;
  if (!safeImage(filename) || !fs.existsSync(path.join(imageDir, filename)))
    errors.push('Missing/unsafe image for '+id+': '+filename);
  if (!bait.image || bait.image !== 'assets/images/'+filename)
    warnings.push('Image fields differ for '+id);
  let u;
  try { u = new URL(bait.bigCartelUrl); } catch {}
  if (!u || u.protocol !== 'https:' || !['www.redgrasstackle.com','redgrasstackle.bigcartel.com','store.redgrasstackle.com'].includes(u.hostname)
    || !u.pathname.startsWith('/product/'))
    errors.push('Invalid product URL for '+id);
  choices.push({id, product:bait.profile+' — '+bait.color, image:filename, link:bait.bigCartelUrl});
}
const selectedUrls = new Map();
for (const c of choices) {
  if (selectedUrls.has(c.link))
    warnings.push('Same product URL for '+selectedUrls.get(c.link)+' and '+c.product);
  else selectedUrls.set(c.link, c.product);
}
console.log(JSON.stringify({valid: errors.length===0, campaign:config.campaign, selected:choices.length, choices, errors, warnings},null,2));
if (errors.length) process.exitCode=1;
