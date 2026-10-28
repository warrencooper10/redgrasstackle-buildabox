const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const repo=path.resolve(__dirname,'../..');const output=path.resolve(repo,'../verification');fs.mkdirSync(output,{recursive:true});
 for(const viewport of [{width:1536,height:690},{width:390,height:660},{width:320,height:640}]){
  const page=await browser.newPage({viewport});
  await page.route('https://raw.githubusercontent.com/warrencooper10/redgrasstackle-buildabox/feature/the-rotation-2026-10-28/**',async route=>{const name=new URL(route.request().url()).pathname.split('/feature/the-rotation-2026-10-28/')[1];const p=path.join(repo,name);await route.fulfill({headers:{'access-control-allow-origin':'*'},status:fs.existsSync(p)?200:404,body:fs.existsSync(p)?fs.readFileSync(p):'missing',contentType:p.endsWith('.webp')?'image/webp':p.endsWith('.json')?'application/json':'text/html'});});
  await page.goto('file://'+path.join(repo,'rotation/index.html'));await page.locator('.product').first().waitFor();
  await page.waitForFunction(()=>document.querySelector('.showroom').dataset.source==='remote');
  assert.equal(await page.locator('.product').count(),10);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight),false);
  assert.equal(await page.locator('.photo img').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0)),true);
  const seen=new Set();for(let i=0;i<10;i++){seen.add(await page.locator('.product.active').getAttribute('href'));await page.locator('.next').click();}assert.equal(seen.size,10);
  await page.locator('.next').focus();await page.keyboard.press('End');assert.match(await page.locator('#counter').innerText(),/10/);await page.keyboard.press('Home');assert.match(await page.locator('#counter').innerText(),/01/);
  await page.waitForTimeout(750);
  await page.screenshot({path:path.join(output,`rotation-${viewport.width}.png`)});
  const stage=await page.locator('.stage').boundingBox();await page.mouse.move(stage.x+stage.width*.5,stage.y+stage.height*.5);await page.mouse.down();await page.mouse.move(stage.x+stage.width*.2,stage.y+stage.height*.5,{steps:10});await page.mouse.up();assert.notEqual(await page.locator('#counter').innerText(),'01 / 10');
  await page.locator('.fallback-toggle').click();assert.equal(await page.locator('.flat').count(),1);await page.locator('.next').click();
  await page.emulateMedia({reducedMotion:'reduce'});assert.match(await page.locator('.product.active').evaluate(x=>getComputedStyle(x).transitionDuration),/^0s/);
  console.log('PASS browser',viewport.width,'ten products/images/links, no overflow, controls, drag, keyboard, fallback, reduced motion');await page.close();
 }
 await browser.close();
})();
