(function(){
  const GALLERY = document.getElementById('gallery');
  const SLOTS = document.getElementById('slots');
  const COUNTER = document.getElementById('slotCounter');
  const CLEAR = document.getElementById('clearAll');
  const BTN_COPY = document.getElementById('copyNote');
  const BTN_CART = document.getElementById('addToCart');

  // Big Cartel bridge page (uses your custom domain)
  const CART_BRIDGE_URL = "https://www.redgrasstackle.com/pages/box-add";

  const MAX_SLOTS = 9;
  let data = [];
  let slots = new Array(MAX_SLOTS).fill(null);
  let filter = "all";

  function updateCounter(){
    const filled = slots.filter(Boolean).length;
    COUNTER.textContent = `Slots Filled: ${filled} / ${MAX_SLOTS}`;
    BTN_COPY.disabled = filled !== MAX_SLOTS;
    BTN_CART.disabled = filled !== MAX_SLOTS;
  }

  function renderSlots(){
    SLOTS.innerHTML = "";
    for (let i=0; i<MAX_SLOTS; i++){
      const s = document.createElement('div');
      s.className = 'slot' + (slots[i] ? ' filled' : '');
      if (slots[i]){
        const img = document.createElement('img');
        img.src = slots[i].image || '';
        img.alt = slots[i].color;
        img.onerror = () => { img.remove(); };
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
        btn.addEventListener('click', ()=>{
          slots[i] = null; updateCounter(); renderSlots();
        });
        wrap.appendChild(line1); wrap.appendChild(line2);
        s.appendChild(img); s.appendChild(wrap); s.appendChild(btn);
      } else {
        s.textContent = `Slot ${i+1}`;
      }
      SLOTS.appendChild(s);
    }
  }

  function renderGallery(){
    GALLERY.innerHTML = "";
    const list = data.filter(item => filter === "all" || item.profile === filter);
    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      const img = document.createElement('img');
      img.src = item.image || '';
      img.alt = item.color;
      img.onerror = () => { img.style.display='none'; };
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
      if (item.tier === 'core'){
        const b = document.createElement('span');
        b.className = 'badge core'; b.textContent = 'Fan Favorites';
        badges.appendChild(b);
      } else if (item.tier === 'seasonal'){
        const b = document.createElement('span');
        b.className = 'badge seasonal'; b.textContent = 'Seasonal Colors';
        badges.appendChild(b);
      }

      meta.appendChild(name);
      meta.appendChild(sub);
      meta.appendChild(badges);

      card.appendChild(img);
      card.appendChild(meta);

      card.addEventListener('click', ()=>{
        // Fill next available slot
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

  // NEW: Build items param for Big Cartel bridge (?items=IDxQTY,IDxQTY)
  function buildItemsParam(){
    const countsById = {};
    slots.forEach(s => {
      if (!s) return;
      const id = Number(s.optionId);
      if (!id || !Number.isFinite(id)) return;
      countsById[id] = (countsById[id] || 0) + 1; // each slot counts as one pack
    });
    const entries = Object.entries(countsById);
    if (!entries.length) return "";
    return entries.map(([id, qty]) => `${id}x${qty}`).join(',');
  }

  // Events
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      filter = btn.dataset.filter;
      renderGallery();
    });
  });

  CLEAR.addEventListener('click', ()=>{
    slots = new Array(MAX_SLOTS).fill(null);
    updateCounter(); renderSlots();
  });

  BTN_COPY.addEventListener('click', async ()=>{
    const note = buildNote();
    try {
      await navigator.clipboard.writeText(note);
      BTN_COPY.textContent = 'Copied!';
      setTimeout(()=>BTN_COPY.textContent='Copy Selections', 1200);
    } catch(e){
      alert('Selections copied:\n\n' + note);
    }
  });

  BTN_CART.addEventListener('click', ()=>{
    const itemsParam = buildItemsParam();
    if (itemsParam){
      const url = `${CART_BRIDGE_URL}?items=${encodeURIComponent(itemsParam)}`;
      window.location.href = url;
    } else {
      // Fallback: no IDs found; keep old behavior as a backup
      const note = buildNote();
      alert('One or more selections are missing product IDs. Your selections have been copied to your clipboard.\n\nPaste them into the order notes at checkout.\n\n' + note);
      navigator.clipboard.writeText(note).catch(()=>{});
    }
  });

  // Load data
  fetch('assets/data/baits.json')
    .then(r=>r.text())
    .then(t=>{
      // Strip BOM if present
      t = t.replace(/^\uFEFF/, '');
      return JSON.parse(t);
    })
    .then(json=>{
      data = json.filter(item => item.status === 'standard'); // Phase 1
      updateCounter(); renderSlots(); renderGallery();
    })
    .catch(err=>{
      console.error('Failed to load baits.json', err);
      GALLERY.innerHTML = '<p style="padding:16px;color:#900;">Could not load bait data. Check assets/data/baits.json.</p>';
    });
})();