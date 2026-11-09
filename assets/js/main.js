(function () {
  const BASE = 'https://warrencooper10.github.io/redgrasstackle-buildabox/assets/';
  const PREVIEW_RECIPE = window.location.origin === new URL(BASE).origin
    ? null
    : document.querySelector('meta[name="rg-preview-recipe"]')?.content;
  const DATA_URL = PREVIEW_RECIPE ? 'assets/data/baits.json' : BASE + 'data/baits.json';

  // Existing Big Cartel bridge and paid Build-a-Box option.
  const CART_BRIDGE_URL = 'https://www.redgrasstackle.com/buildabox-cart';
  const BUILD_A_BOX_OPTION_ID = 436605399;
  const MAX_SLOTS = 9;
  const SESSION_KEY = 'redgrass.buildabox.slots.v1:' + window.location.pathname;
  const MOBILE = window.matchMedia('(max-width: 879px), (hover: none) and (max-height: 500px) and (max-width: 1100px)');

  const GALLERY = document.getElementById('gallery');
  const SLOTS = document.getElementById('slots');
  const COUNTER = document.getElementById('slotCounter');
  const BOX_PROGRESS = document.getElementById('boxProgress');
  const CLEAR = document.getElementById('clearAll');
  const BTN_COPY = document.getElementById('copyNote');
  const BTN_CART = document.getElementById('addToCart');
  const SEARCH = document.getElementById('baitSearch');
  const CLEAR_SEARCH = document.getElementById('clearSearch');
  const FILTERS = [...document.querySelectorAll('.filter-btn')];
  const PROGRESS = document.getElementById('mobileProgress');
  const VIEW_BOX = document.getElementById('viewBox');
  const BOX_TRAY = document.getElementById('boxTray');
  const BOX_HOME = document.getElementById('desktopBox');
  const MOBILE_BOX = document.getElementById('mobileBox');
  const DRAWER_CONTENT = document.getElementById('drawerContent');
  const CLOSE_BOX = document.getElementById('closeBox');
  const PICKER_FEEDBACK = document.getElementById('pickerFeedback');
  const DESKTOP_FEEDBACK = document.getElementById('desktopFeedback');
  const MOBILE_FEEDBACK = document.getElementById('mobileFeedback');
  const SUGGESTED = document.getElementById('suggestedBox');
  const USE_SUGGESTED = document.getElementById('useSuggested');
  const REPLACE_BOX = document.getElementById('replaceBox');
  const REPLACE_PROMPT = document.getElementById('replacePrompt');
  const KEEP_PICKS = document.getElementById('keepPicks');
  const CONFIRM_SUGGESTED = document.getElementById('confirmSuggested');
  const PREVIEW_HANDOFF = document.getElementById('previewHandoff');

  const slots = new Array(MAX_SLOTS).fill(null);
  let data = [];
  let filter = FILTERS.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.filter ?? 'all';
  let recipe = null;
  let browseView = null;
  let pointerBrowseFocus = null;
  let feedbackTimer;
  let copyTimer;

  // Keep original asset path resolution for gallery cards and slot thumbnails.
  function fullSrc(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    let p = String(path).replace(/^\/+/, '');
    if (p.startsWith('assets/')) p = p.slice(7);
    return BASE + p;
  }

  function photo(item, className) {
    const well = document.createElement('span');
    well.className = className;
    const img = document.createElement('img');
    const src = fullSrc(item.image || item.imageFilename || '');
    const previewSrc = PREVIEW_RECIPE && src.startsWith(BASE) ? 'assets/' + src.slice(BASE.length) : src;
    img.alt = '';
    img.decoding = 'async';
    img.loading = className === 'rg-photo' ? 'lazy' : 'eager';
    img.addEventListener('error', () => {
      if (img.getAttribute('src') !== src) {
        img.src = src;
        return;
      }
      console.warn('Bait photo could not load:', src);
      img.remove();
      well.textContent = 'Photo unavailable';
    });
    img.src = previewSrc;
    well.append(img);
    return well;
  }

  function updateCounter() {
    const filled = slots.filter(Boolean).length;
    COUNTER.textContent = `Slots Filled: ${filled} / ${MAX_SLOTS}`;
    BOX_PROGRESS.value = filled;
    PROGRESS.textContent = `${filled} / ${MAX_SLOTS} selected · $25`;
    BTN_COPY.disabled = filled !== MAX_SLOTS;
    BTN_CART.disabled = filled !== MAX_SLOTS;
  }

  function compactProfile(profile) {
    return profile.replace(/ Minnow$/, '').replace('Ribbed Paddletail', 'Paddletail');
  }

  function renderSlots() {
    const fragment = document.createDocumentFragment();
    slots.forEach((item, i) => {
      const slot = document.createElement('div');
      slot.className = 'slot' + (item ? ' filled' : '');
      slot.dataset.slot = String(i + 1);
      if (!item) {
        slot.textContent = `Slot ${i + 1}`;
      } else {
        const labels = document.createElement('div');
        labels.className = 'slot-text';
        const profile = document.createElement('div');
        profile.className = 'rg-sr-only';
        profile.textContent = `${item.halfCount}× ${item.profile}`;
        const color = document.createElement('div');
        color.textContent = item.color;
        const compact = document.createElement('div');
        compact.className = 'slot-profile';
        compact.setAttribute('aria-hidden', 'true');
        compact.textContent = `${compactProfile(item.profile)} · ${item.halfCount} baits`;
        labels.title = `${item.color} · ${profile.textContent}`;
        labels.append(color, compact, profile);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove';
        remove.title = 'Remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove ${item.color} from slot ${i + 1}`);
        remove.addEventListener('click', () => removeSelection(i));

        slot.append(photo(item, 'slot-photo'), labels, remove);
      }
      fragment.append(slot);
    });
    SLOTS.replaceChildren(fragment);
  }

  function restoreSelection() {
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(SESSION_KEY));
      if (!Array.isArray(stored) || stored.length !== MAX_SLOTS) return;
      const byId = new Map(data.map(item => [Number(item.optionId), item]));
      stored.forEach((id, i) => {
        slots[i] = Number.isSafeInteger(id) ? byId.get(id) || null : null;
      });
    } catch {
      // Keep a working in-memory box if storage is restricted or stale.
    }
  }

  function selectionChanged() {
    updateCounter();
    renderSlots();
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(slots.map(item =>
        item ? Number(item.optionId) : null
      )));
    } catch {
      // Selection remains usable without browser storage.
    }
  }

  function feedback(message, mobileMessage = message) {
    PICKER_FEEDBACK.textContent = message;
    DESKTOP_FEEDBACK.textContent = message;
    MOBILE_FEEDBACK.textContent = mobileMessage;
    DESKTOP_FEEDBACK.hidden = false;
    MOBILE_FEEDBACK.hidden = false;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      DESKTOP_FEEDBACK.hidden = true;
      MOBILE_FEEDBACK.hidden = true;
    }, 3000);
  }

  function addSelection(item, card) {
    const index = slots.findIndex(slot => slot === null);
    if (index === -1) {
      feedback('Your box is full. Remove a pick to add another.', 'Box full · remove a pick');
      return;
    }
    slots[index] = item;
    selectionChanged();
    card.classList.add('is-added');
    clearTimeout(card.addedTimer);
    card.addedTimer = setTimeout(() => card.classList.remove('is-added'), 550);
    feedback(index === MAX_SLOTS - 1 && slots.every(Boolean)
      ? `Added ${item.color}. Your box is ready.`
      : `Added ${item.color} to slot ${index + 1}.`,
    slots.every(Boolean) ? 'Box ready' : `Added ${item.color}`);
  }

  function removeSelection(index) {
    const item = slots[index];
    const restoreFocus = SLOTS.contains(document.activeElement);
    slots[index] = null;
    selectionChanged();
    if (restoreFocus) {
      const nextRemove = SLOTS.querySelector(`.slot[data-slot="${index + 1}"] ~ .slot .remove`);
      const target = nextRemove || [...SLOTS.querySelectorAll('.remove')].at(-1) || CLEAR;
      target.focus({ preventScroll: true });
    }
    feedback(`Removed ${item.color} from slot ${index + 1}.`, `Removed ${item.color}`);
  }

  function baitCard(item) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.optionId = String(item.optionId);
    card.setAttribute('aria-label', `Add ${item.color}, ${item.profile} — ${item.halfCount} baits`);

    const meta = document.createElement('span');
    meta.className = 'meta';
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = item.color;
    const sub = document.createElement('span');
    sub.className = 'sub';
    sub.textContent = `${item.profile} — ${item.halfCount} baits`;
    const badges = document.createElement('span');
    badges.className = 'badges';
    if (item.tier === 'core' || item.tier === 'seasonal') {
      const badge = document.createElement('span');
      badge.className = 'badge ' + item.tier;
      badge.textContent = item.tier === 'core' ? 'Fan Favorites' : 'Seasonal Colors';
      badges.append(badge);
    }

    meta.append(name, sub, badges);
    card.append(photo(item, 'rg-photo'), meta);
    card.addEventListener('click', () => addSelection(item, card));
    return card;
  }

  function renderGallery() {
    const terms = SEARCH.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = data.filter(item => {
      if (filter !== 'all' && item.profile !== filter) return false;
      const label = `${item.color} ${item.profile}`.toLowerCase();
      return terms.every(term => label.includes(term));
    });
    CLEAR_SEARCH.hidden = SEARCH.value.length === 0;
    if (!list.length) {
      const empty = document.createElement('p');
      empty.className = 'rg-empty-results';
      empty.setAttribute('role', 'status');
      empty.textContent = 'No baits match. Try a different color or select All profiles.';
      GALLERY.replaceChildren(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    list.forEach(item => fragment.append(baitCard(item)));
    GALLERY.replaceChildren(fragment);
  }

  function buildNote(){
    const lines = slots.map((s, i) => `Slot ${i + 1}: ${s.halfCount}× ${s.profile} — ${s.color}`);
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

  function openDrawer(event) {
    if (!MOBILE.matches || MOBILE_BOX.open) return;
    browseView = {
      left: window.scrollX,
      top: window.scrollY,
      focus: (event.detail && pointerBrowseFocus) || VIEW_BOX
    };
    pointerBrowseFocus = null;
    DRAWER_CONTENT.append(BOX_TRAY);
    MOBILE_BOX.showModal();
    document.documentElement.classList.add('rg-review-open');
    CLOSE_BOX.focus({ preventScroll: true });
  }

  function restoreBrowse() {
    BOX_HOME.append(BOX_TRAY);
    document.documentElement.classList.remove('rg-review-open');
    if (!browseView) return;
    const { focus, left, top } = browseView;
    browseView = null;
    if (focus.isConnected && focus.getClientRects().length) focus.focus({ preventScroll: true });
    // The catalog already stays put in normal use. Restore only if the browser moved it.
    if (window.scrollX !== left || window.scrollY !== top) window.scrollTo({ left, top, behavior: 'instant' });
  }

  function loadSuggestedRecipe() {
    if (!PREVIEW_RECIPE) return;
    fetch(PREVIEW_RECIPE)
      .then(response => {
        if (!response.ok) throw new Error('Suggested recipe unavailable');
        return response.json();
      })
      .then(config => {
        if (config.status !== 'preview-only' || !Array.isArray(config.recipes)) return;
        const entry = config.recipes.find(candidate => candidate.id === config.activeRecipeId);
        if (!entry || !Array.isArray(entry.optionIds) || entry.optionIds.length !== MAX_SLOTS) return;
        const byId = new Map(data.map(item => [Number(item.optionId), item]));
        const picks = entry.optionIds.map(id => Number.isSafeInteger(id) ? byId.get(id) : null);
        if (!picks.every(Boolean)) return;
        recipe = picks;
        SUGGESTED.hidden = false;
      })
      .catch(error => console.warn('Preview suggested box unavailable:', error));
  }

  function useRecipe() {
    if (!recipe) return;
    slots.splice(0, MAX_SLOTS, ...recipe);
    selectionChanged();
    feedback('Redgrass Suggested Box added. Swap any pick in your box.', 'Suggested Box added');
  }

  FILTERS.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      FILTERS.forEach(other => {
        const active = other === btn;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      renderGallery();
    });
  });

  SEARCH.addEventListener('input', renderGallery);
  CLEAR_SEARCH.addEventListener('click', () => {
    SEARCH.value = '';
    renderGallery();
    SEARCH.focus({ preventScroll: true });
  });

  CLEAR.addEventListener('click', () => {
    slots.fill(null);
    selectionChanged();
    feedback('Your box was cleared.', 'Box cleared');
  });

  VIEW_BOX.addEventListener('pointerdown', () => {
    pointerBrowseFocus = document.activeElement?.closest('.card');
  });
  VIEW_BOX.addEventListener('click', openDrawer);
  CLOSE_BOX.addEventListener('click', () => MOBILE_BOX.close());
  MOBILE_BOX.addEventListener('close', restoreBrowse);
  MOBILE.addEventListener('change', () => {
    if (!MOBILE.matches && MOBILE_BOX.open) MOBILE_BOX.close();
  });

  USE_SUGGESTED.addEventListener('click', () => {
    if (!recipe) return;
    const count = slots.filter(Boolean).length;
    if (count === 0) {
      useRecipe();
      return;
    }
    REPLACE_PROMPT.textContent = `Replace your ${count} ${count === 1 ? 'pick' : 'picks'} with the Redgrass Suggested Box?`;
    REPLACE_BOX.showModal();
    KEEP_PICKS.focus({ preventScroll: true });
  });
  KEEP_PICKS.addEventListener('click', () => REPLACE_BOX.close());
  CONFIRM_SUGGESTED.addEventListener('click', () => {
    REPLACE_BOX.close();
    useRecipe();
  });

  BTN_COPY.addEventListener('click', async () => {
    const note = buildNote();
    try {
      await navigator.clipboard.writeText(note);
      BTN_COPY.textContent = 'Copied!';
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { BTN_COPY.textContent = 'Copy Selections'; }, 1200);
    } catch (e) {
      alert('Selections copied:\n\n' + note);
    }
  });

  BTN_CART.addEventListener('click', () => {
    if (slots.filter(Boolean).length !== MAX_SLOTS) {
      alert('Please complete all 9 slots before adding your box to cart.');
      return;
    }

    const itemsParam = buildItemsParam();
    const boxParam = `${BUILD_A_BOX_OPTION_ID}x1`;

    if (!itemsParam) {
      alert('Something went wrong building your box. Please refresh and try again.');
      return;
    }

    const url = `${CART_BRIDGE_URL}?box=${encodeURIComponent(boxParam)}&items=${encodeURIComponent(itemsParam)}`;
    if (PREVIEW_RECIPE) {
      // The review build can show the exact output without visiting or mutating the store.
      document.getElementById('previewHandoffUrl').textContent = url;
      window.dispatchEvent(new CustomEvent('rg:preview-handoff', { detail: { url } }));
      PREVIEW_HANDOFF.showModal();
      return;
    }

    console.log('RG box:', boxParam);
    console.log('RG items:', itemsParam);
    console.log('Redirecting to cart helper:', url);

    window.location.href = url;
  });
  document.getElementById('closeHandoff').addEventListener('click', () => PREVIEW_HANDOFF.close());

  window.RG_items = buildItemsParam;
  window.RG_base = BASE;

  updateCounter();
  renderSlots();
  fetch(DATA_URL)
    .then(response => {
      if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
      return response.text();
    })
    .then(text => JSON.parse(text.replace(/^\uFEFF/, '')))
    .then(json => {
      if (!Array.isArray(json)) throw new Error('Unexpected catalog data');
      data = json;
      restoreSelection();
      updateCounter();
      renderSlots();
      renderGallery();
      loadSuggestedRecipe();
    })
    .catch(error => {
      console.error('Failed to load baits.json', error);
      const message = document.createElement('p');
      message.className = 'rg-empty-results';
      message.setAttribute('role', 'alert');
      message.textContent = 'Could not load the bait catalog. Refresh to try again.';
      GALLERY.replaceChildren(message);
    })
    .finally(() => GALLERY.setAttribute('aria-busy', 'false'));
})();
