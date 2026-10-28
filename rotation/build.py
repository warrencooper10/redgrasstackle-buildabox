from pathlib import Path
import json,urllib.parse
r=Path(__file__).resolve().parent;repo=r.parent
catalog=[{k:p[k] for k in ['optionId','profile','color','image','bigCartelUrl']} for p in json.loads((repo/'assets/data/baits.json').read_text())]
ids=[p['id'] for p in json.loads((r/'lineup.json').read_text())['products']]
products=[]
for id in ids:
 p=next(x for x in catalog if x['optionId']==id)
 products.append(dict(id=id,profile=p['profile'],color=p['color'],originalImage=p['image'],image=f'rotation/assets/{id}.webp',url='https://redgrasstackle.bigcartel.com'+urllib.parse.urlparse(p['bigCartelUrl']).path,verifiedTitle=p['profile']+' — '+p['color'],verifiedAt='2026-10-28T12:30:00Z'))
config=dict(schemaVersion=2,campaign='the-rotation',products=products)
if not (r/'lineup.json').exists():(r/'lineup.json').write_text(json.dumps(config,indent=2)+'\n')
config=json.loads((r/'lineup.json').read_text())
model=(r/'model.mjs').read_text().replace('export ','')
css=(r/'style.css').read_text().replace("url('assets/", "url('https://raw.githubusercontent.com/warrencooper10/redgrasstackle-buildabox/feature/the-rotation-2026-10-28/rotation/assets/")
app=(r/'app.mjs').read_text()
icons=['<path d="M3 17 8 12 16 10 23 13 28 11 32 15 28 20 22 20 16 23 8 20 3 24 4 18Z"/><circle cx="24" cy="15" r="1"/><path d="m12 11 3-5 5 5m-7 10 3 5"/>','<path d="M18 3 30 8 28 22 18 32 8 22 6 8Z"/><path d="m12 17 4 4 9-10"/>','<path d="m18 33-1-26m1 26-9-20m9 20 9-23M9 13V6m18 4V4m-10 3V1m-7 25-5-8m20 8 6-9"/>','<path d="m15 3 13 1-3 10 1 7-4 4 2 7-7-2-3 2-1-8-4-2 4-7Z"/>']
labels=['PROVEN<br>ON THE WATER','BUILT TO LAST','DESIGNED<br>BY ANGLERS','MISSISSIPPI<br>BORN & RAISED']
values=''.join(f'<div class="value"><svg viewBox="0 0 36 36" aria-hidden="true">{icon}</svg><span>{label}</span></div>' for icon,label in zip(icons,labels))
links=''.join(f'<a href="{p["url"]}" target="_blank" rel="noopener noreferrer">{p["profile"]} — {p["color"]}</a>' for p in config['products'])
html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>The Rotation | Redgrass Tackle</title><style>{css}</style></head><body class="no-js"><main class="showroom" aria-label="The Rotation: ten Redgrass baits"><header class="masthead"><p class="eyebrow">REDGRASS TACKLE</p><h1 aria-label="THE ROTATION"><span class="the">THE</span> R<span class="o" aria-hidden="true">O</span><span class="sr-only">O</span>TATION</h1><p class="tagline">BETTER BAITS. MORE FISH.</p></header><section class="stage" aria-roledescription="carousel" aria-label="Featured bait showroom"><div class="ring"></div><button class="nav prev" aria-label="Previous bait" type="button">‹</button><button class="nav next" aria-label="Next bait" type="button">›</button></section><div class="ring-status"><div class="dots" role="group" aria-label="Choose one of ten products"></div><span id="counter">01 / 10</span><p class="help">DRAG OR SWIPE TO ROTATE · SELECT A BAIT TO SHOP</p></div><p id="live" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p><div class="values">{values}</div><button class="fallback-toggle" aria-pressed="false" type="button">Use simple view</button><div class="static-fallback noscript-wrap"><p>Explore the ten featured baits:</p>{links}</div></main><script type="module">const CATALOG={json.dumps(catalog,separators=(',',':'))};const BASELINE={json.dumps(config,separators=(',',':'))};{model}\n{app}</script></body></html>'''
(r/'index.html').write_text(html)
print('Built',len(html),'bytes')

# A small Classic Editor HTML shell loads the versioned component from the review branch.
import re
import os
renderer_ref=os.environ.get('ROTATION_RENDERER_REF','15c00a7dd32a5b3de571e80b3672e4069c75ece3')
cdn=f'https://cdn.jsdelivr.net/gh/warrencooper10/redgrasstackle-buildabox@{renderer_ref}/rotation/'
script=re.search(r'<script type="module">(.*?)</script>',html,re.S).group(1)
(r/'bundle.js').write_text(script)
embed=re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="'+cdn+'style.css">',html,flags=re.S)
embed=re.sub(r'<script type="module">.*?</script>', '<script defer src="'+cdn+'bundle.js"></script>',embed,flags=re.S)
(r/'embed.html').write_text(embed)
