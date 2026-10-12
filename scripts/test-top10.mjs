// Run with: node scripts/test-top10.mjs
// Import the staged Wix ESM module as a data URL without changing this repo's module type.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const moduleText = await fs.readFile(new URL('../wix/top10-loader.js', import.meta.url), 'utf8');
const {loadRemoteTop10} = await import('data:text/javascript;base64,'+Buffer.from(moduleText).toString('base64'));
const catalog = JSON.parse(await fs.readFile(new URL('../assets/data/baits.json', import.meta.url),'utf8'));
const config = JSON.parse(await fs.readFile(new URL('../assets/data/top10.json', import.meta.url),'utf8'));
const endpoint = 'https://warrencooper10.github.io/redgrasstackle-buildabox/assets/';
const answer = (value, status=200) => ({ok:status===200,status,json:async()=>value});
function mockFetch(cfg=config,cat=catalog,broken=new Set()) {
  return async (url,opts={}) => {
    if (url === endpoint+'data/top10.json') return answer(cfg);
    if (url === endpoint+'data/baits.json') return answer(cat);
    if (opts.method === 'HEAD') return answer(null,broken.has(url)?404:200);
    throw Error('Unexpected URL '+url);
  };
}
const good = await loadRemoteTop10(mockFetch());
assert.equal(good.items.length,10);
assert.equal(good.source,'remote');
assert.equal(new Set(good.selected.map(x=>x.optionId)).size,10);
assert(good.items.every(x=>x.link.startsWith('https://')));
const invalid = {...config,optionIds:config.optionIds.slice(0,9)};
const fallback = await loadRemoteTop10(mockFetch(invalid));
assert.equal(fallback.source,'baseline');
assert.equal(fallback.items.length,10);
const cache = await loadRemoteTop10(mockFetch(invalid),good.selected);
assert.equal(cache.source,'last-known-good');
assert.equal(cache.items.length,10);
const duplicated = {...config,optionIds:config.optionIds.map((v,i)=>i===9?config.optionIds[0]:v)};
assert.equal((await loadRemoteTop10(mockFetch(duplicated))).source,'baseline');
const wrongLink = catalog.map(x=>({...x}));
wrongLink[0].bigCartelUrl='https://notredgrass.invalid/product/a';
const invalidId = {...config,optionIds:[wrongLink[0].optionId,...config.optionIds.slice(1)]};
assert.equal((await loadRemoteTop10(mockFetch(invalidId,wrongLink))).source,'baseline');
const missingUrl=endpoint+'images/'+good.selected[0].imageFilename;
const missing = await loadRemoteTop10(mockFetch(config,catalog,new Set([missingUrl])),null,{preflightImages:true});
assert.equal(missing.items.length,10);
assert.equal(missing.missingImages.length,1);
assert(missing.items[0].src.endsWith('/logo-redgrass.png'));
assert(missing.items[1].src.includes(good.selected[1].imageFilename));
console.log('PASS Top 10: remote, exact count, duplicate reject, invalid links, cache, baseline, missing image');
