(function(){
  console.log('RG Build-a-Box: cart-bridge v5 (path fix + debug)');

  // Always load from GitHub Pages (prevents Big Cartel preview path issues)
  const BASE = 'https://warrencooper10.github.io/redgrasstackle-buildabox/assets/';
  const DATA_URL = BASE + 'data/baits.json';

  // Big Cartel bridge page
  const CART_BRIDGE_URL = 'https://www.redgrasstackle.com/page/box-add';

  const GALLERY = document.getElementById('gallery');
  const SLOTS = document.getElementById('slots');
  const COUNTER = document.getElementById('slotCounter');
  const CLEAR = document.getElementById('clearAll');
  const BTN_COPY = document.getElementById('copyNote');
  const BTN_CART = document.getElementById('addToCart');

  const MAX_SLOTS = 9;
  let data = [];
  let slots = new Array(MAX_SLOTS).fill(null);
  let filter = 'all';

  // Normalize any relative img path to absolute (handles leading / and leading 'assets/')
  function fullSrc(path){
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    let p = String(path).replace(/^\/+/, ''); // drop leading /
    if (p.startsWith('assets/')) p = p.slice(7); // drop 'assets/'
    return BASE + p;
  }

  function updateCounter(){
    const filled = slots.filter(Boolean).length;
    COUNTER.textContent = `Slots Filled: ${filled} / ${MAX_SLOTS}`;
    BTN_COPY.disabled = filled !== MAX_SLOTS;
    BTN_CART.disabled = filled !== MAX_SLOTS;
  }

  function renderSlots(){
    SLOTS.innerHTML = '';
    for (let i=0; i<MAX_SLOTS; i++){
      const s = document.createElement('div');
      s.className = 'slot' + (slots[i] ? ' filled' : '');
      if (slots[i]){
        const img = document.createElement('img');
        const src = fullSrc(slots[i].image || slots[i].imageFilename || '');
        img.src = src;
        img.alt = slots[i].color || '';
        img.onerror = () => { console.warn('slot img 404:', src); img.remove(); };
        const wrap = document.createElement('div');
        wrap.className = 'slot-text';
        const line1 = document.createElement('div');
        line1.textContent = `${slots[i].halfCount}× ${slots[i].profile}`;
        const line2 = document.createElement('div');
        line2.textContent = slots[i].color;
        const btn = document.createElement('button');
        btn.className = 'remove';
        btn.title = 'Remove';
        btn.innerHTML = '✕';
        btn.addEventListener('click', ()=>{ slots[i] = null; updateCounter(); renderSlots(); });
        wrap.appendChild(line1); wrap.appendChild(line2);
        s.appendChild(img); s.appendChild(wrap); s.appendChild(btn);
      } else {
        s.textContent = `Slot ${i+1}`;
      }
      SLOTS.appendChild(s);
    }
  }

  function renderGallery(){
    GALLERY.innerHTML = '';
    const list = data.filter(item => filter === 'all' || item.profile === filter);
    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      const img = document.createElement('img');
      const src = fullSrc(item.image || item.imageFilename || '');
      img.src = src;
      img.alt = item.color || '';
      img.onerror = () => { console.warn('gallery img 404:', src); img.style.display='none'; };
      const meta = document.createElement('div');
      meta.className = 'meta';
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = `${item.color}`;
      const sub = document.createElement('div');
      sub.className = 'sub';
      sub.textContent = `${item.profile} — ${item.halfCount} baits`;
      const badges = document.createElement('div');
      badges.className = 'badges';
      if (item.tier === 'core'){ const b=document.createElement('span'); b.className='badge core'; b.textContent='Fan Favorites'; badges.appendChild(b); }
      else if (item.tier === 'seasonal'){ const b=document.createElement('span'); b.className='badge seasonal'; b.textContent='Seasonal Colors'; badges.appendChild(b); }

      meta.appendChild(name); meta.appendChild(sub); meta.appendChild(badges);
      card.appendChild(img); card.appendChild(meta);

      card.addEventListener('click', ()=>{
        const idx = slots.findIndex(x => x === null);
        if (idx === -1) return;
        slots[idx] = item;
        updateCounter(); renderSlots();
        window.scrollTo({top: 0, behavior: 'smooth'});
      });

      GALLERY.appendChild(card);
    });
  }

  function buildNote(){
    const lines = slots.map((s, i)=>`Slot ${i+1}: ${s.halfCount}× ${s.profile} — ${s.color}`);
    return lines.join('\n');
  }

  // Build ?items=IDxQTY,IDxQTY from optionId on each selected bait
  function buildItemsParam(){
    const countsById = {};
    slots.forEach(s => {
      if (!s) return;
      const id = Number(s.optionId);
      if (!id || !Number.isFinite(id)) return;
      countsById[id] = (countsById[id] || 0) + 1;
    });
    const entries = Object.entries(countsById);
    if (!entries.length) return '';
    return entries.map(([id, qty]) => `${id}x${qty}`).join(',');
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      filter = btn.dataset.filter;
      renderGallery();
    });
  });

  CLEAR.addEventListener('click', ()=>{ slots = new Array(MAX_SLOTS).fill(null); updateCounter(); renderSlots(); });

  BTN_COPY.addEventListener('click', async ()=>{
    const note = buildNote();
    try { await navigator.clipboard.writeText(note); BTN_COPY.textContent = 'Copied!'; setTimeout(()=>BTN_COPY.textContent='Copy Selections', 1200); }
    catch(e){ alert('Selections copied:\n\n' + note); }
  });

  BTN_CART.addEventListener('click', ()=>{
    const itemsParam = buildItemsParam();
    console.log('RG items:', itemsParam);
    if (itemsParam){
      const url = `${CART_BRIDGE_URL}?items=${encodeURIComponent(itemsParam)}`;
      console.log('Redirecting to cart bridge:', url);
      window.location.href = url;
    } else {
      const note = buildNote();
      alert('Selections copied (no product IDs found). Paste these into checkout notes:\n\n' + note);
      navigator.clipboard.writeText(note).catch(()=>{});
    }
  });

  // expose quick checks in console
  window.RG_items = buildItemsParam;
  window.RG_base = BASE;

  // Load bait data from absolute URL
  fetch(DATA_URL)
    .then(r=>r.text())
    .then(t=>{ t = t.replace(/^\uFEFF/, ''); return JSON.parse(t); })
    .then(json=>{ data = json; updateCounter(); renderSlots(); renderGallery(); })
    .catch(err=>{
      console.error('Failed to load baits.json', err);
      GALLERY.innerHTML = '<p style="padding:16px;color:#900;">Could not load bait data. Check assets/data/baits.json.</p>';
    });
})();