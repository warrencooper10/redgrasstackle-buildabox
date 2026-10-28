import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateLineup,resolveFeed} from '../model.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('../lineup.json',import.meta.url))),catalog=JSON.parse(fs.readFileSync(new URL('../../assets/data/baits.json',import.meta.url)));
assert.equal(validateLineup(baseline,catalog).length,10);
for(const mutate of [c=>c.products.pop(),c=>c.products[1]=c.products[0],c=>c.products[0].profile='Wrong',c=>c.products[0].color='',c=>c.products[0].originalImage='assets/images/other.jpg',c=>c.products[0].url='https://example.com/product/no',c=>c.products[0].url=c.products[1].url,c=>c.products[0].image='https://example.com/pic',c=>c.products[0].verifiedAt='',c=>c.products[0].id=1.2]){const c=structuredClone(baseline);mutate(c);assert.throws(()=>validateLineup(c,catalog));}
const fetcher=async()=>({ok:true,json:async()=>baseline});
assert.equal((await resolveFeed(fetcher,{baseline,catalog})).source,'remote');
assert.equal((await resolveFeed(async()=>{throw Error('offline')},{baseline,catalog})).source,'bundled');
const cached=structuredClone(baseline);cached.products.reverse();
const bad=await resolveFeed(async()=>({ok:true,json:async()=>({})}),{baseline,catalog,cached});assert.equal(bad.source,'last-known-good');assert.equal(bad.products[0].id,cached.products[0].id);
const imageFail=await resolveFeed(fetcher,{baseline,catalog,cached,preflight:async()=>{throw Error('404 image')}});assert.equal(imageFail.source,'last-known-good');
assert.equal((await resolveFeed(fetcher,{baseline,catalog,cached:{invalid:true}})).source,'remote');
console.log('PASS: valid ten; incomplete/duplicate/incorrect/malformed rejected; feed/image failure preserves LKG; corrupt cache rejected.');
