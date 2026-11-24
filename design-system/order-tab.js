// ---------- the Order tab ----------
// From the research (Baymard, Starbucks, Sweetgreen): reorder first, a category bar that stays pinned,
// a photo and a price on every row, dietary filters, say up front what can be customized, quick add.
// Three ways to get it: Pickup, Dine in (only when your location shows you're at the café), Delivery.
const OSEC = [['Coffee & drinks', 'Drinks'], ['Breakfast', 'Breakfast'], ['Lunch & dinner', 'Lunch'], ['Pastries & dessert', 'Sweets']];
const DRINK_CATS = new Set(['coffee-espresso', 'teas', 'fall', 'lattes', 'mochas', 'matcha', 'frappes', 'refreshers', 'smoothies', 'non-coffee']);
const TAGS = { vg: ['Vegan', '#2F6B4A'], v: ['Vegetarian', '#5F7A3A'], gf: ['Gluten-free', '#8C6A2C'], n: ['New', '#B4234F'] }; // the menu's 's' flag isn't 'spicy' (it's on lattes and pastas): ask the café what it means before showing it
const DINE_M = 150, DELIVERY_MI = 3.5;
const OI = {
  pickup: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  dine: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5"/><path d="M17 21V3c-2 1.5-3 4-3 7h3"/>',
  delivery: '<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M9 17.5h6l2-6h-4l-2 6M13 11.5V8h3M4 15l2-5h4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>', chev: '<path d="m6 9 6 6 6-6"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12 5 5 9-10"/>', scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 12h10"/>',
};
const oi = (n, s = 18, c = C.INK, w = 1.9) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${OI[n]}</svg>`;
const cafeOf = () => D.cafes.find((x) => x.id === S.cafe) || D.cafes[0];
const metersTo = (a, b) => mi(a, b) * 1609.34;
const lazy = (html) => html.replace('<img ', '<img loading="lazy" ');
S.ful = store.get('ful', 'pickup'); if (S.ful === 'dine') S.ful = 'pickup'; // dine-in is never remembered: you have to be there
S.odiet = new Set(); S.oq = '';

function fulLabel() {
  const c = cafeOf();
  if (S.ful === 'dine') return `Dine in · Table ${S.table}`;
  if (S.ful === 'delivery') return `Delivery · ${S.addr ? S.addr.short : 'add address'} · 25–35 min`;
  return S.mode && S.mode.label && S.mode.label.startsWith('Pickup') ? S.mode.label : `Pickup ASAP · ${wait(c.id)[0]}–${wait(c.id)[1]} min`;
}
function setFul(f) { S.ful = f; if (f !== 'dine') store.set('ful', f); S.mode = { asap: true, label: fulLabel() }; if (S.view === 'order') rOrder(); syncChrome(); }

// what can be changed on an item, said up front on the row
function choiceText(m) {
  if (m.flags.includes('eggs')) return 'Choose your eggs';
  if (m.flags.includes('protein')) return 'Choose your protein';
  if (m.flags.includes('cheese')) return 'Choose your cheese';
  if (['lattes', 'mochas', 'matcha', 'fall'].includes(m.cat)) return 'Size, milk & sweetness';
  if (['coffee-espresso', 'teas', 'frappes', 'smoothies', 'refreshers', 'non-coffee'].includes(m.cat)) return 'Size & options';
  return '';
}
const needsChoice = (m) => m.flags.includes('eggs') || m.flags.includes('protein') || m.flags.includes('cheese');
const dietOk = (m) => [...S.odiet].every((d) => (d === 'v' ? m.flags.includes('v') || m.flags.includes('vg') : m.flags.includes(d)));

function oRow(m) {
  const tags = m.flags.filter((f) => TAGS[f]).map((f) => `<span style="font-size:11px;font-weight:700;color:${TAGS[f][1]};background:${TAGS[f][1]}14;border-radius:999px;padding:2px 7px">${TAGS[f][0]}</span>`).join('');
  const ch = choiceText(m);
  return `<div class="orow" data-id="${m.id}" style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid ${C.LINE}">
    <button class="press" data-open="${m.id}" aria-label="${m.name}, ${money(m.price)}" style="display:flex;gap:12px;align-items:center;flex:1;min-width:0;border:0;background:none;padding:0;text-align:left;color:inherit">
      ${lazy(photo('84px', 84, m.name, tone(m.cat), 16, false))}
      <span style="display:flex;flex-direction:column;gap:3px;min-width:0">
        <b style="font-size:15.5px;font-weight:650;line-height:1.25">${m.name}</b>
        ${m.desc ? `<span style="font-size:13px;line-height:1.4;color:${C.MUT};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${m.desc}</span>` : ''}
        <span style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:2px"><b style="font-size:14px;font-variant-numeric:tabular-nums">${money(m.price)}</b>${tags}${ch ? `<span style="font-size:11.5px;color:${C.MUT}">· ${ch}</span>` : ''}</span>
      </span></button>
    <button class="press" data-add="${m.id}" aria-label="Add ${m.name}" style="flex:none;width:40px;height:40px;border-radius:20px;border:0;background:${C.RED};color:#fff;font-size:24px;line-height:40px;font-weight:400;box-shadow:${C.EL1}">+</button>
  </div>`;
}
function oCard(m, w = 150) {
  return `<button class="press" data-open="${m.id}" style="flex:none;width:${w}px;border:0;background:${C.SURF};border-radius:18px;padding:0;overflow:hidden;box-shadow:${C.EL1};text-align:left;color:inherit;position:relative">
    ${lazy(photo(w + 'px', 118, m.name, tone(m.cat), 0, false))}
    <span style="display:flex;flex-direction:column;gap:2px;padding:9px 11px 11px"><b style="font-size:14px;font-weight:650;line-height:1.25;min-height:35px">${m.name}</b><span style="font-size:13px;color:${C.MUT};font-variant-numeric:tabular-nums">${money(m.price)}</span></span>
    <span data-add="${m.id}" role="button" aria-label="Add ${m.name}" style="position:absolute;right:8px;top:84px;width:32px;height:32px;border-radius:16px;background:${C.RED};color:#fff;font-size:20px;line-height:32px;text-align:center;box-shadow:${C.EL2}">+</span></button>`;
}
function sectionOrder() { const h = now().getHours(); return h >= 11 && h < 16 ? [2, 0, 1, 3] : [0, 1, 2, 3]; }
function oBody() {
  const items = D.menu.filter(dietOk), q = S.oq.trim().toLowerCase();
  if (q) {
    const catName = Object.fromEntries(MENU_CATS.map((c) => [c.id, c.name.toLowerCase()]));
    const hits = items.filter((m) => m.name.toLowerCase().includes(q) || (m.desc || '').toLowerCase().includes(q) || catName[m.cat].includes(q));
    return hits.length ? `<p style="margin:14px 0 0;font-size:13px;color:${C.MUT}">${hits.length} ${hits.length === 1 ? 'match' : 'matches'} for “${S.oq.trim()}”</p>${hits.map(oRow).join('')}`
      : `<div style="padding:48px 10px;text-align:center;display:flex;flex-direction:column;gap:8px;align-items:center"><b style="font-family:Fraunces,Georgia,serif;font-size:20px;font-weight:600">Nothing called “${S.oq.trim()}”</b><span style="font-size:14px;color:${C.MUT}">Try “latte”, “burrito” or “vegan”.</span></div>`;
  }
  const u = S.user, usual = u && u.usualItemId && MENU[u.usualItemId], past = (store.get('orders', []) || []).flatMap((o) => o.items).filter((id, i, a) => MENU[id] && a.indexOf(id) === i && id !== (usual && usual.id)).slice(0, 4).map((id) => MENU[id]);
  const again = [usual, ...past].filter(Boolean).filter(dietOk);
  const pop = (D.trending[S.cafe] || []).map((id) => MENU[id]).filter(Boolean).concat(items.filter((m) => m.flags.includes('p') && PH_IDS.includes(m.id))).filter((m, i, a) => a.indexOf(m) === i && dietOk(m)).slice(0, 8);
  const fresh = items.filter((m) => m.flags.includes('n')).slice(0, 8);
  const row = (title, sub, list) => list.length ? `<section style="margin-top:20px"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:21px">${title}</h2>${sub ? `<span style="font-size:12.5px;color:${C.MUT}">${sub}</span>` : ''}</div><div class="hscroll" style="display:flex;gap:12px;overflow-x:auto;margin:10px -20px 0;padding:2px 20px 8px;scrollbar-width:none">${list.map((m) => oCard(m)).join('')}</div></section>` : '';
  const secs = sectionOrder().map((i) => OSEC[i]).map(([sec, short]) => {
    const cats = MENU_CATS.filter((c) => c.section === sec).map((c) => ({ c, list: items.filter((m) => m.cat === c.id) })).filter((x) => x.list.length);
    if (!cats.length) return '';
    return `<section data-sec="${short}" style="margin-top:28px"><h2 style="margin:0 0 2px;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:26px;letter-spacing:-.3px">${sec}</h2>${cats.map(({ c, list }) => `<div data-cat="${c.id}" style="scroll-margin-top:var(--ostick)"><h3 style="margin:18px 0 0;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.RED}">${c.name} <span style="color:${C.MUT};font-weight:600">· ${list.length}</span></h3>${list.map(oRow).join('')}</div>`).join('')}</section>`;
  }).join('');
  return (again.length ? row(u ? 'Order again' : '', 'One tap to add', again) : '') + row(`Popular at ${cafeOf().name}`, '', pop) + (fresh.length ? row('New on the menu', '', fresh) : '') + secs
    + `<p style="margin:26px 0 0;font-size:12px;color:${C.MUT};text-align:center">Concept demo · prices from the café’s menu · not the official Living Room app</p>`;
}
function oChips() {
  const cats = sectionOrder().flatMap((i) => MENU_CATS.filter((c) => c.section === OSEC[i][0])).filter((c) => D.menu.some((m) => m.cat === c.id && dietOk(m)));
  return cats.map((c) => `<button class="press ochip" data-jump="${c.id}" style="flex:none;height:32px;padding:0 13px;border-radius:16px;border:0;background:${C.SURF};box-shadow:inset 0 0 0 1px ${C.LINE};font-size:13px;font-weight:600;color:${C.INK};white-space:nowrap">${c.name}</button>`).join('');
}
function oHead() {
  const c = cafeOf(), seg = (k, label) => `<button class="press" data-ful="${k}" aria-pressed="${S.ful === k}" style="flex:1;height:40px;border:0;border-radius:12px;display:flex;gap:6px;align-items:center;justify-content:center;font-size:14px;font-weight:650;${S.ful === k ? `background:${C.SURF};color:${C.INK};box-shadow:${C.EL1}` : `background:none;color:${C.MUT}`}">${oi(k, 17, S.ful === k ? C.RED : C.MUT)}${label}</button>`;
  const st = status(c.id);
  const ctx = S.ful === 'dine' ? `${c.name} · Table ${S.table}` : S.ful === 'delivery' ? (S.addr ? `To ${S.addr.short} · 25–35 min · $4.99` : 'Add a delivery address') : `${c.name} · ${fulLabel().replace(/^Pickup /, '')}`;
  return `<div style="padding:0 20px">
    <h1 style="margin:2px 0 12px;font-family:Fraunces,Georgia,serif;font-weight:500;font-size:30px;letter-spacing:-.5px">Order</h1>
    <div role="group" aria-label="How do you want it?" style="display:flex;gap:4px;padding:4px;border-radius:15px;background:${C.TINT}">${seg('pickup', 'Pickup')}${seg('dine', 'Dine in')}${seg('delivery', 'Delivery')}</div>
    <button class="press" id="o-ctx" style="margin-top:10px;display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 12px 0 10px;border-radius:999px;border:0;background:${C.SURF};box-shadow:inset 0 0 0 1px ${C.LINE};font-size:13px;color:${C.INK};max-width:100%;white-space:nowrap">${S.ful === 'delivery' ? oi('delivery', 16, C.RED) : icon('Location', 16, C.RED, 2)}<span style="overflow:hidden;text-overflow:ellipsis">${ctx}</span>${oi('chev', 14, C.MUT, 2.2)}</button>
    ${!st.canNow ? `<div role="status" style="margin-top:10px;padding:10px 12px;border-radius:14px;background:${C.PT};color:${C.PTI};font-size:13.5px;line-height:1.4">${st.text}. You can still order now for pickup later.</div>` : ''}
    <label style="margin-top:12px;display:flex;align-items:center;gap:10px;height:46px;padding:0 14px;border-radius:14px;background:${C.SURF};box-shadow:inset 0 0 0 1px ${C.LINE}">${oi('search', 18, C.MUT)}<input id="o-q" type="search" placeholder="Search drinks and food" value="${S.oq.replace(/"/g, '&quot;')}" aria-label="Search the menu" style="flex:1;border:0;background:none;outline:none;font-size:15px;color:${C.INK};min-width:0"></label>
    <div role="group" aria-label="Dietary filters" style="display:flex;gap:8px;margin-top:10px">${[['vg', 'Vegan'], ['v', 'Vegetarian'], ['gf', 'Gluten-free']].map(([k, l]) => `<button class="press" data-diet="${k}" aria-pressed="${S.odiet.has(k)}" style="height:32px;padding:0 12px;border-radius:16px;border:0;font-size:13px;font-weight:600;display:flex;gap:5px;align-items:center;${S.odiet.has(k) ? `background:${C.INK};color:${C.G}` : `background:none;box-shadow:inset 0 0 0 1px ${C.LINE};color:${C.INK}`}">${S.odiet.has(k) ? oi('check', 14, C.G, 2.4) : ''}${l}</button>`).join('')}</div>
  </div>`;
}
function rOrder() {
  const v = $('#v-order'), keep = $('#order-scroll') ? $('#order-scroll').scrollTop : 0;
  v.innerHTML = `<div class="scroll" id="order-scroll" style="position:absolute;inset:0;padding-top:50px;padding-bottom:130px">
    <div id="o-head">${oHead()}</div>
    <nav id="o-stick" aria-label="Menu sections" style="position:sticky;top:-1px;z-index:5;margin-top:12px;background:${C.G};padding:8px 0 8px;box-shadow:0 1px 0 ${C.LINE}">
      <div style="display:flex;gap:18px;padding:0 20px">${sectionOrder().map((i) => `<button class="press otab" data-sec="${OSEC[i][1]}" style="border:0;background:none;padding:6px 0;font-size:15px;font-weight:700;color:${C.MUT};border-bottom:2.5px solid transparent">${OSEC[i][1]}</button>`).join('')}</div>
      <div id="o-chips" class="hscroll" style="display:flex;gap:8px;overflow-x:auto;padding:8px 20px 0;scrollbar-width:none">${oChips()}</div>
    </nav>
    <div id="o-body" style="padding:0 20px">${oBody()}</div></div>`;
  const sc = $('#order-scroll'); sc.scrollTop = keep;
  sc.style.setProperty('--ostick', ($('#o-stick').offsetHeight + 8) + 'px');
  wireOrder();
  spy();
}
function wireOrder() {
  const root = $('#v-order'), sc = $('#order-scroll');
  $$('[data-ful]', root).forEach((b) => (b.onclick = () => { const f = b.dataset.ful; if (f === S.ful && f !== 'dine') return; if (f === 'dine') return dineIn(); if (f === 'delivery') return deliverySheet(); setFul('pickup'); }));
  $('#o-ctx').onclick = () => (S.ful === 'dine' ? tableSheet() : S.ful === 'delivery' ? deliverySheet() : go('map'));
  const q = $('#o-q'); q.oninput = () => { S.oq = q.value; $('#o-body').innerHTML = oBody(); wireBody(); spy(); };
  $$('[data-diet]', root).forEach((b) => (b.onclick = () => { const k = b.dataset.diet; S.odiet.has(k) ? S.odiet.delete(k) : S.odiet.add(k); rOrder(); }));
  $$('[data-jump]', root).forEach((b) => (b.onclick = () => { const t = $(`[data-cat="${b.dataset.jump}"]`); if (t) glideScroll(sc, t.getBoundingClientRect().top - $('#o-stick').getBoundingClientRect().bottom - 4, 380); }));
  $$('.otab', root).forEach((b) => (b.onclick = () => { const t = $(`section[data-sec="${b.dataset.sec}"]`); if (t) glideScroll(sc, t.getBoundingClientRect().top - $('#o-stick').getBoundingClientRect().bottom - 4, 420); }));
  sc.onscroll = () => { cancelAnimationFrame(S.ospy); S.ospy = requestAnimationFrame(spy); };
  wireBody();
}
function wireBody() {
  $$('#v-order [data-add]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const m = MENU[b.dataset.add]; if (needsChoice(m)) return itemSheet(m.id); S.tap = [e.clientX - $('.screen').getBoundingClientRect().left, e.clientY - $('.screen').getBoundingClientRect().top]; add(m.id); }));
  $$('#v-order [data-open]').forEach((b) => (b.onclick = (e) => { if (e.target.closest('[data-add]')) return; itemSheet(b.dataset.open); }));
}
// the pinned bar follows you: the section tab and the category chip you're reading light up
function spy() {
  const st = $('#o-stick'); if (!st) return; const lim = st.getBoundingClientRect().bottom + 12;
  let cat = null, sec = null;
  $$('#o-body [data-cat]').forEach((d) => { if (d.getBoundingClientRect().top <= lim) { cat = d.dataset.cat; sec = d.closest('section').dataset.sec; } });
  if (!cat) { const f = $('#o-body [data-cat]'); if (f) { cat = f.dataset.cat; sec = f.closest('section').dataset.sec; } }
  $$('.otab').forEach((b) => { const on = b.dataset.sec === sec; b.style.color = on ? C.INK : C.MUT; b.style.borderBottomColor = on ? C.RED : 'transparent'; });
  $$('.ochip').forEach((b) => { const on = b.dataset.jump === cat; b.style.background = on ? C.INK : C.SURF; b.style.color = on ? C.G : C.INK; b.style.boxShadow = on ? 'none' : `inset 0 0 0 1px ${C.LINE}`; if (on && S.ocat !== cat) { const row = $('#o-chips'); row.scrollTo({ left: b.offsetLeft - 20, behavior: 'smooth' }); } });
  S.ocat = cat;
}

// ---------- the item preview (customizing comes in the next step) ----------
function itemSheet(id) {
  const m = MENU[id], ch = choiceText(m), tags = m.flags.filter((f) => TAGS[f]).map((f) => `<span style="font-size:12px;font-weight:700;color:${TAGS[f][1]};background:${TAGS[f][1]}14;border-radius:999px;padding:3px 9px">${TAGS[f][0]}</span>`).join('');
  $('#sheet .sheet').innerHTML = `<span style="width:36px;height:5px;border-radius:3px;background:#D8CBB8;margin:0 auto"></span>
    <div style="margin:0 -20px;position:relative">${photo('100%', 230, m.name, tone(m.cat), 0, false)}<button class="press" id="i-x" aria-label="Close" style="position:absolute;right:14px;top:12px;width:36px;height:36px;border-radius:18px;border:0;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center">${oi('x', 18)}</button></div>
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline"><h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:25px;line-height:1.15">${m.name}</h2><b style="font-size:18px;font-variant-numeric:tabular-nums">${money(m.price)}</b></div>
    ${m.desc ? `<p style="margin:-4px 0 0;font-size:15px;line-height:1.5;color:${C.MUT}">${m.desc}</p>` : ''}
    ${tags ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${tags}</div>` : ''}
    ${ch ? `<div style="padding:12px 14px;border-radius:14px;background:${C.TINT};font-size:14px;line-height:1.45"><b>${ch}</b><br><span style="color:${C.MUT}">Choosing your options comes in the next step of the app.</span></div>` : ''}
    ${btn(`Add to bag · ${money(m.price)}`, 'filled', 'l', 'width:100%', 'id="i-add"')}`;
  $('#i-x').onclick = () => closeSheet();
  $('#i-add').onclick = () => { closeSheet(); add(id); };
  openSheet();
}

// ---------- Dine in: only when your location shows you're at the café ----------
function locate(cb) {
  // the demo: 'inside' the café, location 'off', or wherever the demo panel put you
  if (S.demoLoc === 'off') return setTimeout(() => cb({ err: 'denied' }), 900);
  if (S.demoLoc === 'inside') return setTimeout(() => cb({ you: cafeOf().ll, acc: 20 }), 900);
  if (S.you && !S.real) return setTimeout(() => cb({ you: S.you, acc: 30 }), 900);
  if (!navigator.geolocation) return cb({ err: 'unavailable' });
  navigator.geolocation.getCurrentPosition((p) => cb({ you: [p.coords.latitude, p.coords.longitude], acc: p.coords.accuracy }), (e) => cb({ err: e && e.code === 1 ? 'denied' : 'unavailable' }), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}
function sheetBody(html) { $('#sheet .sheet').innerHTML = `<span style="width:36px;height:5px;border-radius:3px;background:#D8CBB8;margin:0 auto"></span>${html}`; }
function dineIn() {
  const c = cafeOf();
  sheetBody(`<div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:26px 0 18px;text-align:center"><span class="ospin" style="width:42px;height:42px;border-radius:21px;border:3.5px solid ${C.LINE};border-top-color:${C.RED}"></span><h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:22px">Checking you’re at ${c.name}…</h2><span style="font-size:14px;color:${C.MUT};max-width:290px;line-height:1.45">We use your location once, to make sure dine-in orders only come from inside the café.</span></div>`);
  openSheet();
  locate((r) => {
    if (r.err) return sheetBody(`<h2 style="margin:6px 0 0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:23px">Turn on location to dine in</h2><p style="margin:0;font-size:15px;line-height:1.5;color:${C.MUT}">Dine in sends your food to your table, so we check once that you’re inside ${c.name}. We never track you in the background.</p>${btn('Turn on location', 'filled', 'l', 'width:100%', 'id="d-retry"')}${btn('Order for pickup instead', 'light', 'l', `width:100%;box-shadow:inset 0 0 0 1px ${C.LINE}`, 'id="d-pick"')}`), wireDine();
    const here = c.ll, m = metersTo(r.you, here), near = m <= DINE_M + Math.min(r.acc || 0, 60);
    if (!near) {
      const d = mi(r.you, here), dist = d < 0.2 ? `${Math.round(m)} m` : `${d.toFixed(1)} mi`;
      return sheetBody(`<h2 style="margin:6px 0 0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:23px">Dine in opens at the café</h2><p style="margin:0;font-size:15px;line-height:1.5;color:${C.MUT}">You’re ${dist} from ${c.name}. When you’re inside, choose Dine in again and we’ll bring your order to your table.</p>${btn('Order for pickup instead', 'filled', 'l', 'width:100%', 'id="d-pick"')}${btn('Choose another café', 'light', 'l', `width:100%;box-shadow:inset 0 0 0 1px ${C.LINE}`, 'id="d-cafe"')}`), wireDine();
    }
    S.dineAt = { cafe: c.id, at: Date.now() }; tableSheet(true);
  });
}
function tableSheet(fresh) {
  const c = cafeOf();
  sheetBody(`<div style="display:flex;gap:10px;align-items:center;margin-top:4px"><span style="width:28px;height:28px;border-radius:14px;background:#2F6B4A;display:flex;align-items:center;justify-content:center">${oi('check', 16, '#fff', 2.6)}</span><b style="font-size:14px;color:#2F6B4A">You’re at ${c.name}</b></div>
    <h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:24px">Which table are you at?</h2>
    <p style="margin:-4px 0 0;font-size:14.5px;line-height:1.5;color:${C.MUT}">Scan the code on your table, or type the number on its little sign. We’ll bring your order to you.</p>
    <button class="press" id="d-scan" style="height:96px;border-radius:18px;border:2px dashed ${C.LINE};background:${C.SURF};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:15px;font-weight:650;color:${C.INK}">${oi('scan', 30, C.RED, 2)}Scan the table code</button>
    <div style="display:flex;gap:10px;align-items:center"><label style="flex:1;min-width:0;display:flex;align-items:center;gap:8px;height:52px;padding:0 14px;border-radius:14px;background:${C.SURF};box-shadow:inset 0 0 0 1px ${C.LINE}"><span style="font-size:14px;color:${C.MUT}">Table</span><input id="d-num" inputmode="numeric" maxlength="3" placeholder="12" value="${!fresh && S.table ? S.table : ''}" aria-label="Table number" style="flex:1;width:100%;border:0;outline:none;background:none;font-size:20px;font-weight:700;color:${C.INK};min-width:0"></label>${btn('Start', 'filled', 'l', 'flex:none;min-width:96px', 'id="d-go"')}</div>
    <span id="d-msg" role="status" style="font-size:13px;color:${STOP};min-height:16px"></span>`);
  if (!$('#sheet').classList.contains('on')) openSheet();
  const start = (n) => { S.table = n; closeSheet(); setFul('dine'); toast(`Dine in · Table ${n}. We’ll bring it to you.`); };
  $('#d-go').onclick = () => { const n = parseInt($('#d-num').value, 10); if (!n || n < 1 || n > 60) { $('#d-msg').textContent = 'Type the number on your table’s sign (1 to 60).'; return; } start(n); };
  $('#d-scan').onclick = () => { const b = $('#d-scan'); b.innerHTML = `<span class="ospin" style="width:30px;height:30px;border-radius:15px;border:3px solid ${C.LINE};border-top-color:${C.RED}"></span>Point your camera at the code…`; setTimeout(() => start(12), 1300); };
}
function wireDine() { const p = $('#d-pick'), r = $('#d-retry'), cf = $('#d-cafe'); if (p) p.onclick = () => { closeSheet(); setFul('pickup'); }; if (r) r.onclick = () => { if (S.demoLoc === 'off') S.demoLoc = 'inside'; dineIn(); }; if (cf) cf.onclick = () => { closeSheet(); go('map'); }; }

// ---------- Delivery: by a DoorDash driver, from the café ----------
function deliverySheet() {
  const c = cafeOf(), guess = S.addr ? S.addr.full : (S.you && mi(S.you, c.ll) < 2 ? '5500 Campanile Dr, San Diego, CA 92182' : '');
  sheetBody(`<h2 style="margin:6px 0 0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:24px">Where should we deliver?</h2>
    <label style="display:flex;align-items:center;gap:10px;height:52px;padding:0 14px;border-radius:14px;background:${C.SURF};box-shadow:inset 0 0 0 1px ${C.LINE}">${icon('Location', 18, C.RED, 2)}<input id="v-addr" placeholder="Street address" value="${guess}" aria-label="Delivery address" style="flex:1;border:0;outline:none;background:none;font-size:15px;color:${C.INK};min-width:0"></label>
    <input id="v-note" placeholder="Apartment, gate code or a note for the driver (optional)" aria-label="Note for the driver" style="height:48px;padding:0 14px;border-radius:14px;border:0;background:${C.SURF};box-shadow:inset 0 0 0 1px ${C.LINE};font-size:14px;color:${C.INK}">
    <div style="display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:14px;background:${C.TINT};font-size:14px;line-height:1.45"><span style="display:flex;justify-content:space-between"><span>From ${c.name}</span><b>25–35 min</b></span><span style="display:flex;justify-content:space-between"><span>Delivery fee</span><b>$4.99</b></span><span style="color:${C.MUT};font-size:12.5px">Delivered by a DoorDash driver. You’ll see them on a map after you order. We deliver up to ${DELIVERY_MI} miles from the café.</span></div>
    ${btn('Deliver here', 'filled', 'l', 'width:100%', 'id="v-go"')}<span id="v-msg" role="status" style="font-size:13px;color:${STOP};min-height:16px;margin-top:-6px"></span>`);
  if (!$('#sheet').classList.contains('on')) openSheet();
  $('#v-go').onclick = () => {
    const a = $('#v-addr').value.trim(); if (a.length < 6) { $('#v-msg').textContent = 'Add a street address so the driver can find you.'; return; }
    const far = /la jolla|prospect|oceanside|escondido|chula/i.test(a); if (far) { $('#v-msg').textContent = `That’s more than ${DELIVERY_MI} miles from ${c.name}. Try pickup, or a café closer to you.`; return; }
    S.addr = { full: a, short: a.split(',')[0], note: $('#v-note').value.trim() }; closeSheet(); setFul('delivery');
  };
}

// at checkout, a dine-in order checks once more that you're still at the café
function placeOk(go) {
  if (S.ful !== 'dine') return go();
  const c = cafeOf(); $('#b-place').textContent = 'Checking you’re still at the café…';
  locate((r) => { if (!r.err && metersTo(r.you, c.ll) <= DINE_M + Math.min(r.acc || 0, 60)) return go();
    $('#b-place').textContent = 'Switch to pickup'; $('#b-place').insertAdjacentHTML('afterend', `<span style="font-size:13px;color:${STOP};text-align:center">You’re no longer at ${c.name}, so this can’t go to Table ${S.table}. Switch to pickup to send it.</span>`);
    $('#b-place').onclick = () => { setFul('pickup'); openBag(true); }; });
}
