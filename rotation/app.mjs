const BASE='https://raw.githubusercontent.com/warrencooper10/redgrasstackle-buildabox/feature/the-rotation-2026-10-28/';
const KEY='redgrass-rotation-approved-v2';
const root=document.querySelector('.showroom'),stage=document.querySelector('.stage'),ring=document.querySelector('.ring');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let products=[],position=0,active=0,drag=null,suppressClick=false,frame=0;
const wrap=x=>((x%10)+10)%10;
function announce(){const p=products[active];document.querySelector('#live').textContent=`${active+1} of 10. ${p.color}. ${p.profile}.`;document.querySelector('#counter').textContent=String(active+1).padStart(2,'0')+' / 10';}
function layout(){
 const w=stage.clientWidth,cw=parseFloat(getComputedStyle(ring.children[0]).width),mobile=w<700;
 const radius=Math.max(cw*.82,Math.min(w*.42,670));
 const depth=mobile?145:260;
 const spin=position*36;
 [...ring.children].forEach((card,i)=>{
   let angle=((i*36-spin+180)%360+360)%360-180;
   const rad=angle*Math.PI/180,front=(Math.cos(rad)+1)/2;
   const x=Math.sin(rad)*radius,z=(Math.cos(rad)-1)*depth;
   // Elliptical installation: center is perpendicular to viewer; rear faces turn inward.
   const facing=-angle*.43;
   const scale=.68+.32*front;
   const visible=Math.abs(angle)<145;
   card.style.transform=`translate3d(${x}px,${(1-front)*-18}px,${z}px) rotateY(${facing}deg) scale(${scale})`;
   card.style.filter=`brightness(${.32+front*.68})`;
   card.style.opacity=visible?'1':'0';card.style.pointerEvents=visible?'auto':'none';
   card.style.zIndex=String(Math.round(front*100));
   const selected=i===active;card.classList.toggle('active',selected);
   card.tabIndex=selected?0:-1;card.setAttribute('aria-hidden',String(!visible));
 });
 document.querySelectorAll('.dot').forEach((d,i)=>d.setAttribute('aria-current',String(i===active)));
}
function go(index,{announceChange=true,focus=false}={}){
 const current=wrap(Math.round(position));let diff=wrap(index)-current;if(diff>5)diff-=10;if(diff< -5)diff+=10;
 position=Math.round(position)+diff;active=wrap(Math.round(position));layout();if(announceChange)announce();
 if(focus)ring.children[active].focus({preventScroll:true});
}
function mount(next){
 const oldID=products[active]?.id;products=next;active=Math.max(0,products.findIndex(p=>p.id===oldID));position=active;
 ring.replaceChildren();document.querySelector('.dots').replaceChildren();
 products.forEach((p,i)=>{
  const card=document.createElement('a');card.className='product';card.href=p.url;card.target='_blank';card.rel='noopener noreferrer';card.draggable=false;card.setAttribute('aria-label',`Shop ${p.profile} — ${p.color} (opens in a new tab)`);
  const photo=document.createElement('div');photo.className='photo';const img=document.createElement('img');img.src=BASE+p.image;img.alt=`${p.profile} in ${p.color} — original Redgrass product photograph`;img.width=640;img.height=640;img.decoding='async';img.draggable=false;img.loading=i<3||i>7?'eager':'lazy';if(i===active)img.fetchPriority='high';
  img.onerror=()=>{photo.classList.add('photo-failed');photo.textContent=`${p.color} · ${p.profile}. Photo temporarily unavailable.`;};photo.append(img);
  const color=document.createElement('h2');color.className='color';color.textContent=p.color;
  const profile=document.createElement('p');profile.className='profile';profile.textContent=p.profile;
  const cta=document.createElement('span');cta.className='card-cta';cta.textContent='SHOP THIS BAIT →';
  card.append(photo,color,profile,cta);ring.append(card);
  card.addEventListener('click',e=>{if(suppressClick){e.preventDefault();return;}if(i!==active){e.preventDefault();go(i);}});
  const dot=document.createElement('button');dot.type='button';dot.className='dot';dot.setAttribute('aria-label',`Show ${i+1}: ${p.color}, ${p.profile}`);dot.addEventListener('click',()=>go(i));document.querySelector('.dots').append(dot);
 });layout();announce();
}
async function preload(items){await Promise.all(items.map(p=>new Promise((resolve,reject)=>{const im=new Image();const timer=setTimeout(()=>reject(Error('Product image timed out')),6500);im.onload=()=>{clearTimeout(timer);im.naturalWidth?resolve():reject(Error('Empty image'));};im.onerror=()=>{clearTimeout(timer);reject(Error('Unavailable product image'));};im.src=BASE+p.image;})));}
async function load(){
 let cached;try{cached=JSON.parse(localStorage.getItem(KEY));}catch{}
 let immediate;try{immediate=validateLineup(cached,CATALOG);}catch{immediate=validateLineup(BASELINE,CATALOG);}mount(immediate);
 const result=await resolveFeed(async()=>fetch(BASE+'rotation/lineup.json',{cache:'no-cache',signal:AbortSignal.timeout(7000)}),{baseline:BASELINE,catalog:CATALOG,cached,preflight:preload});
 if(result.source==='remote'){
  if(JSON.stringify(result.products)!==JSON.stringify(products))mount(result.products);
  try{localStorage.setItem(KEY,JSON.stringify(result.config));}catch{}
 }
 root.dataset.source=result.source;
}
document.querySelector('.prev').addEventListener('click',()=>go(active-1));document.querySelector('.next').addEventListener('click',()=>go(active+1));
root.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;let n;if(e.key==='ArrowLeft')n=active-1;if(e.key==='ArrowRight')n=active+1;if(e.key==='Home')n=0;if(e.key==='End')n=9;if(n!==undefined){e.preventDefault();go(n,{focus:e.target.classList.contains('product')});}});
stage.addEventListener('dragstart',e=>e.preventDefault());
stage.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:position,locked:false};suppressClick=false;});
stage.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(!drag.locked){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){drag=null;return;}if(Math.abs(dx)<8)return;drag.locked=true;stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');suppressClick=true;}
 position=drag.start-dx/Math.max(95,stage.clientWidth*.14);active=wrap(Math.round(position));cancelAnimationFrame(frame);frame=requestAnimationFrame(layout);
});
function release(e){if(!drag||e.pointerId!==drag.id)return;const moved=drag.locked;drag=null;stage.classList.remove('dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);if(moved){go(wrap(Math.round(position)));setTimeout(()=>suppressClick=false,80);}}
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',e=>{if(drag)release(e);});
new ResizeObserver(()=>{if(products.length)layout();}).observe(stage);
const toggle=document.querySelector('.fallback-toggle');toggle.addEventListener('click',()=>{const flat=root.classList.toggle('flat');toggle.textContent=flat?'Use 3D showroom':'Use simple view';toggle.setAttribute('aria-pressed',String(flat));});
if(!CSS.supports('transform-style','preserve-3d')){root.classList.add('flat');toggle.hidden=true;}
reduced.addEventListener('change',()=>{if(products.length)layout();});
document.body.classList.remove('no-js');load().catch(()=>{mount(validateLineup(BASELINE,CATALOG));root.dataset.source='bundled';});
