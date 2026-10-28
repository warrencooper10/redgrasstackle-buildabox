"""Verify every configured destination against its actual Big Cartel product title."""
import concurrent.futures,html,json,re,urllib.request
from pathlib import Path
r=Path(__file__).resolve().parent
config=json.loads((r/'lineup.json').read_text())
def compact(s):return re.sub('[^a-z0-9]','',s.lower())
def check(p):
 with urllib.request.urlopen(p['url'],timeout=25) as response:
  if response.status!=200 or response.url!=p['url']:raise ValueError('Unexpected destination '+p['url'])
  text=response.read().decode()
 title=html.unescape(re.search(r'<h1[^>]*>(.*?)</h1>',text,re.S).group(1)).strip()
 color=compact(p['color'])
 if color not in compact(title):raise ValueError('Wrong product/color: '+title)
 kind=next(x for x in ['Chubby','Skinny','BA','Ribbed','Flicker'] if x in p['profile'])
 if compact(kind) not in compact(title):raise ValueError('Wrong profile: '+title)
 return dict(id=p['id'],url=p['url'],title=title,status=200)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(check,config['products']))
print(json.dumps(results,indent=2))
