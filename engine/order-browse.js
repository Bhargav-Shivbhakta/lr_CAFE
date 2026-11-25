// ---------- the Order flow (approved on the design canvas, Nov 24): search icon, meal bar, popular, "what kind?", sorted kinds, the dish sheet ----------
const OITEMS = D.menu.map((m) => ({ id: m.id, n: m.name, d: m.desc || '', p: m.price, c: m.cat, f: m.flags }));
const ENG = (() => {
  const ITEMS = OITEMS, BYID = Object.fromEntries(OITEMS.map((i) => [i.id, i]));
  const WHERE = D.og.where, KEYS = D.og.keys, CATNAME = Object.fromEntries(MENU_CATS.map((c) => [c.id, c.name]));
  /*SEARCH*/
  /*OPTIONS*/
  return { search, OPTS, PAIR, BYID };
})();
const OB = ENG.BYID, OG = D.og.groups, OPOP = D.og.pop, OMEALS = D.og.meals;
const MI = {
  drinks: '<path d="M6 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M9 3c-1 1 1 2 0 3M13 3c-1 1 1 2 0 3"/>',
  breakfast: '<circle cx="12" cy="13" r="7"/><circle cx="12" cy="13" r="2.6"/><path d="M5 5l1.5 1.5M19 5l-1.5 1.5"/>',
  lunch: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5"/><path d="M17 21V3c-2 1.5-3 4-3 7h3"/>',
  sweets: '<path d="M4 15c0-4 3.5-7 8-7s8 3 8 7z"/><path d="M5 15h14l-1 4H6z"/><path d="M12 4v4"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/>',
};
const mIcon = (n, s = 22, c = C.RED, w = 1.9) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MI[n]}</svg>`;
S.o = { meal: null, grp: null, sub: 'all', sort: 'pop', diets: {}, q: '', sOpen: false };
const oMeal = () => S.o.meal || (now().getHours() < 11 || now().getHours() >= 21 ? 'breakfast' : 'lunch');
const mealOf = (id) => OMEALS.find((m) => m.id === id);
const isPop = (id) => OB[id] && OB[id].f.includes('p');
const popBadge = (id) => (isPop(id) ? `<span style="font-size:11px;font-weight:700;color:${C.RED};background:${C.RED}1A;border-radius:999px;padding:2px 7px">Popular</span>` : '');
const SEL = (on) => (on ? `background:${C.INK};color:${C.G}` : `background:${C.SURF};box-shadow:inset 0 0 0 1px ${C.LINE};color:${C.INK}`);

// a photo card: square photo, name and price under it, + in the corner
function gcard(id) {
  const m = MENU[id];
  return `<div style="position:relative"><button class="press" data-open="${id}" aria-label="${m.name}, ${money(m.price)}" style="width:100%;border:0;padding:0;border-radius:20px;overflow:hidden;background:${C.SURF};box-shadow:${C.EL1};text-align:left;color:inherit;display:flex;flex-direction:column">
    ${lazy(photo('100%', 'sq', m.name, tone(m.cat), 0, false))}
    <span style="display:flex;flex-direction:column;gap:3px;padding:10px 12px 12px"><b style="font-size:14px;font-weight:650;line-height:1.25;min-height:35px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${m.name}</b><span style="display:flex;gap:6px;align-items:center"><b style="font-size:13.5px">${money(m.price)}</b>${popBadge(id)}</span></span></button>
    <button class="press" data-qadd="${id}" aria-label="Add ${m.name}" style="position:absolute;right:8px;top:8px;width:40px;height:40px;border-radius:20px;border:0;background:${C.RED};color:#fff;font-size:22px;line-height:1;box-shadow:0 2px 8px rgba(43,29,22,.3)">+</button></div>`;
}
function srow(id) {
  const m = MENU[id], w = (D.og.where[id] || []).join(' · ');
  return `<div style="display:flex;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid ${C.LINE}">
    <button class="press" data-open="${id}" aria-label="${m.name}, ${money(m.price)}" style="flex:1;min-width:0;display:flex;gap:12px;align-items:center;border:0;background:none;padding:0;text-align:left;color:inherit">${lazy(photo('72px', 72, m.name, tone(m.cat), 14, false))}
      <span style="display:flex;flex-direction:column;gap:3px;min-width:0"><b style="font-size:15px;font-weight:650;line-height:1.25">${m.name}</b><span style="font-size:12px;font-weight:600;color:${C.RED}">${w}</span><span style="display:flex;gap:6px;align-items:center"><b style="font-size:13.5px">${money(m.price)}</b>${popBadge(id)}</span></span></button>
    <button class="press" data-qadd="${id}" aria-label="Add ${m.name}" style="flex:none;width:44px;height:44px;border-radius:22px;border:0;background:${C.RED};color:#fff;font-size:24px;line-height:1">+</button></div>`;
}

// the top: "Order", and a round search button that grows into the search bar
function oTop() {
  const open = S.o.sOpen;
  return `<div style="position:relative;height:48px;margin:2px 0 10px;display:flex;align-items:center">
    <h1 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:500;font-size:30px;letter-spacing:-.5px;opacity:${open ? 0 : 1};transition:opacity 200ms">Order</h1>
    <div id="o-sw" style="position:absolute;right:0;top:0;height:48px;width:${open ? '100%' : '48px'};transition:width 420ms cubic-bezier(.32,.72,0,1)">
      ${open ? `<label style="height:100%;display:flex;align-items:center;gap:10px;padding:0 5px 0 15px;border-radius:24px;background:${C.SURF};box-shadow:inset 0 0 0 2px ${C.INK};box-sizing:border-box">${oi('search', 19, C.INK, 2.2)}<input id="o-q" type="search" placeholder="Try “iced latte” or “vegan under $12”" aria-label="Search the menu" value="${S.o.q.replace(/"/g, '&quot;')}" style="flex:1;border:0;background:none;outline:none;font-size:15.5px;color:${C.INK};min-width:0"><button class="press" id="o-sx" aria-label="Close search" style="width:38px;height:38px;border-radius:19px;border:0;background:${C.TINT};display:flex;align-items:center;justify-content:center;flex:none">${oi('x', 16, C.INK, 2.4)}</button></label>`
      : `<button class="press" id="o-so" aria-label="Search the menu" style="width:48px;height:48px;border-radius:24px;border:0;background:${C.INK};display:flex;align-items:center;justify-content:center">${oi('search', 21, C.G, 2.2)}</button>`}
    </div></div>`;
}
function oTabs() {
  const cur = oMeal();
  return `<div role="tablist" aria-label="Menu" style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:6px;padding:5px;border-radius:20px;background:${C.TINT}">${['drinks', 'breakfast', 'lunch', 'sweets'].map((id) => { const on = id === cur;
    return `<button class="press" role="tab" aria-selected="${on}" data-meal="${id}" style="height:54px;border:0;border-radius:15px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:12px;font-weight:700;${on ? `background:${C.SURF};color:${C.INK};box-shadow:0 1px 3px rgba(43,29,22,.12)` : `background:transparent;color:${C.MUT}`}">${mIcon(id, 21)}${id === 'lunch' ? 'Lunch & dinner' : mealOf(id).name}</button>`; }).join('')}</div>`;
}
function oTiles() {
  const id = oMeal(), m = mealOf(id), gs = OG[id], n = gs.reduce((a, g) => a + g.ids.length, 0);
  const kind = { drinks: 'drink', breakfast: 'breakfast', lunch: 'lunch or dinner', sweets: 'sweet' }[id];
  return `<div style="display:flex;justify-content:space-between;align-items:baseline;margin:18px 0 4px"><h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:22px">${m.name}</h2><span style="font-size:12.5px;color:${C.MUT}">${m.note} · ${n} items</span></div>
    <h3 style="margin:14px 0 0;font-size:15px;font-weight:700">Most popular</h3>
    <div class="hscroll" style="display:flex;gap:12px;overflow-x:auto;margin:10px -20px 0;padding:2px 20px 8px;scrollbar-width:none">${OPOP[id].map((x) => `<div style="flex:none;width:150px">${gcard(x)}</div>`).join('')}</div>
    <h3 style="margin:16px 0 10px;font-size:15px;font-weight:700">What kind of ${kind}?</h3>
    <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px">${gs.map((g) => { const h = g.ids.find((x) => (D.photos || {})[x]) || g.ids[0];
      return `<button class="press" data-grp="${g.id}" aria-label="${g.name}, ${g.ids.length} items" style="border:0;padding:0;border-radius:18px;overflow:hidden;background:${C.SURF};box-shadow:${C.EL1};text-align:left;color:inherit;display:flex;flex-direction:column">${lazy(photo('100%', 'sq', MENU[h].name, tone(MENU[h].cat), 0, false))}<span style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px"><b style="font-size:14.5px;line-height:1.2">${g.name}</b><span style="font-size:12px;color:${C.MUT};line-height:1.35">${g.sub}</span><span style="font-size:12px;font-weight:700;color:${C.RED};margin-top:2px">${g.ids.length} items</span></span></button>`; }).join('')}</div>`;
}
const DT = { v: (x) => OB[x].f.includes('v') || OB[x].f.includes('vg'), vg: (x) => OB[x].f.includes('vg'), gf: (x) => OB[x].f.includes('gf') };
const DN = { v: 'Vegetarian', vg: 'Vegan', gf: 'Gluten-free' }, SN = { pop: 'Popular first', low: 'Price: low to high', high: 'Price: high to low' };
const keepD = (x) => Object.keys(S.o.diets).filter((k) => S.o.diets[k]).every((k) => DT[k](x));
const fCount = () => (S.o.sort !== 'pop' ? 1 : 0) + Object.keys(S.o.diets).filter((k) => S.o.diets[k]).length;
function oGroupHead(g) {
  const subs = g.subs.length > 1 ? [['All', g.ids]].concat(g.subs) : [], n = fCount();
  const sum = [S.o.sort !== 'pop' ? SN[S.o.sort] : ''].concat(Object.keys(S.o.diets).filter((k) => S.o.diets[k]).map((k) => DN[k])).filter(Boolean).join(' · ');
  return `<div style="display:flex;align-items:center;gap:12px;margin:0 0 10px">
      <button class="press" id="o-back" aria-label="Back to ${mealOf(oMeal()).name}" style="width:44px;height:44px;border-radius:22px;border:0;background:${C.SURF};box-shadow:${C.EL1};display:flex;align-items:center;justify-content:center;flex:none">${oi('back', 20, C.INK, 2.2)}</button>
      <div style="display:flex;flex-direction:column;flex:1;min-width:0"><span style="font-size:12px;font-weight:700;color:${C.MUT}">${mealOf(oMeal()).name}</span><h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:24px">${g.name}</h2></div>
      <button class="press" id="o-filter" aria-label="Sort and filter${n ? ', ' + n + ' on' : ''}" style="position:relative;width:44px;height:44px;border-radius:22px;border:0;flex:none;display:flex;align-items:center;justify-content:center;${n ? `background:${C.INK}` : `background:${C.SURF};box-shadow:${C.EL1}`}">${mIcon('sliders', 20, n ? C.G : C.INK, 2)}${n ? `<span style="position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:${C.RED};color:#fff;font-size:11px;font-weight:800;line-height:18px;text-align:center;box-shadow:0 0 0 2px ${C.G}">${n}</span>` : ''}</button></div>
    ${subs.length ? `<div role="group" aria-label="Kinds" style="display:flex;gap:6px">${subs.map(([name, ids]) => { const key = name === 'All' ? 'all' : name, on = S.o.sub === key;
      return `<button class="press" data-sub="${key}" aria-pressed="${on}" style="flex:1 1 auto;min-width:0;height:36px;padding:0 7px;border-radius:18px;border:0;font-size:12.5px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${SEL(on)}">${name} <span style="opacity:.6">${ids.filter(keepD).length}</span></button>`; }).join('')}</div>` : ''}
    ${n ? `<p style="margin:10px 0 0;font-size:12.5px;color:${C.MUT}">${sum} · <button class="press" id="o-fclear" style="border:0;background:none;padding:0;font-size:12.5px;font-weight:700;color:${C.RED};text-decoration:underline">Clear</button></p>` : ''}`;
}
function oGroupBody(g) {
  const sorter = (a, b) => (S.o.sort === 'low' ? MENU[a].price - MENU[b].price : S.o.sort === 'high' ? MENU[b].price - MENU[a].price : 0);
  const secs = g.subs.filter(([n]) => S.o.sub === 'all' || n === S.o.sub).map(([n, ids]) => [n, ids.filter(keepD).slice().sort(sorter)]).filter(([, ids]) => ids.length);
  if (!secs.length) return `<p style="margin:30px 0;text-align:center;font-size:14px;color:${C.MUT}">Nothing here matches your filters. Tap Clear to see all.</p>`;
  return secs.map(([n, ids]) => `<section style="margin-top:16px">${g.subs.length > 1 && S.o.sub === 'all' ? `<h3 style="margin:0 0 10px;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:19px">${n} <span style="font-family:Inter,sans-serif;font-size:13px;font-weight:600;color:${C.MUT}">${ids.length}</span></h3>` : ''}
    <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px">${ids.map(gcard).join('')}</div></section>`).join('');
}
function oSearch() {
  const q = S.o.q.trim(), chip = (t) => `<button class="press" data-try="${t.replace(/"/g, '&quot;')}" style="height:38px;padding:0 15px;border-radius:19px;border:0;font-size:13.5px;font-weight:650;${SEL(false)}">${t}</button>`;
  if (!q) return `<div style="margin:16px 0 4px;display:flex;flex-direction:column;gap:4px"><b style="font-size:16px">What are you craving?</b><span style="font-size:13px;color:${C.MUT}">Type a dish, a taste or a budget. Or start with one of these:</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">${['Iced latte', 'Breakfast burrito', 'Something sweet', 'Vegan', 'Under $10', 'Spicy', 'Salad', 'Cold brew'].map(chip).join('')}</div>`;
  const r = ENG.search(q), extra = r.notes.length ? ' · ' + r.notes.join(' · ') : '';
  if (!r.list.length) { const near = [...new Set(r.near)].slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    const fall = ['Iced latte', 'Breakfast burrito', 'Salad', 'Vegan', 'Cookie', 'Under $10'].filter((f) => !near.some((n) => n.toLowerCase() === f.toLowerCase()));
    return `<div style="margin:16px 0 4px;display:flex;flex-direction:column;gap:4px"><b style="font-size:16px">We don’t have “${q}”</b><span style="font-size:13px;color:${C.MUT}">${r.notes.length ? 'Nothing matches ' + r.notes.join(' and ') + '. ' : ''}Try something similar:</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">${near.concat(fall).slice(0, 6).map(chip).join('')}</div>`; }
  return `<div style="margin:16px 0 4px;display:flex;flex-direction:column;gap:4px"><b style="font-size:15px">${r.list.length} ${r.list.length === 1 ? 'dish' : 'dishes'}${r.partial ? ' that match part of' : ' for'} “${q}”</b><span style="font-size:13px;color:${C.MUT}">${r.partial ? 'We don’t have everything you asked for in one dish. These are the closest.' : 'Best matches first'}${extra}</span></div>
    ${r.list.slice(0, 40).map((it) => srow(it.id)).join('')}`;
}
function rOrder() {
  const v = $('#v-order'), g = S.o.grp && OG[oMeal()].find((x) => x.id === S.o.grp), searching = S.o.sOpen, old = $('#order-scroll');
  const keep = old && !S.ojump ? old.scrollTop : 0; S.ojump = false;
  const pinStyle = `position:sticky;top:-50px;z-index:4;margin:0 -20px;padding:10px 20px;transition:background-color 380ms cubic-bezier(.2,.7,.2,1),box-shadow 380ms cubic-bezier(.2,.7,.2,1);background:${C.G}00;box-shadow:0 8px 14px -12px rgba(43,29,22,0)`;
  v.innerHTML = `<div class="scroll" id="order-scroll" style="position:absolute;inset:0;padding-top:50px;padding-bottom:130px"><div style="padding:0 20px">
    ${oTop()}
    ${searching ? '' : modeRow('o', 'o-ctx')}
    ${!searching && !status(cafeOf().id).canNow ? `<div role="status" style="margin-top:10px;padding:10px 12px;border-radius:14px;background:${C.PT};color:${C.PTI};font-size:13.5px;line-height:1.4">${status(cafeOf().id).text}. You can still order now for later.</div>` : ''}
    ${searching ? oSearch() : g ? `<div class="opin" style="${pinStyle};margin-top:-38px;padding-top:50px;pointer-events:none"><div style="pointer-events:auto">${oGroupHead(g)}</div></div>${oGroupBody(g)}`
      : `<div class="opin" style="${pinStyle};margin-top:-42px;padding-top:50px;pointer-events:none"><div style="pointer-events:auto">${oTabs()}</div></div>${oTiles()}`}
    <p style="margin:24px 0 0;font-size:12px;color:${C.MUT};text-align:center">Concept demo · prices from the café’s SDSU menu · not the official Living Room app</p></div></div>`;
  const sc = $('#order-scroll'); sc.scrollTop = keep;
  const pin = $('.opin', v), paint = () => { if (!pin) return; const stuck = pin.getBoundingClientRect().top - sc.getBoundingClientRect().top <= 0.5 && sc.scrollTop > 0;
    pin.style.background = stuck ? C.G : C.G + '00'; pin.style.boxShadow = stuck ? '0 8px 14px -12px rgba(43,29,22,.35)' : '0 8px 14px -12px rgba(43,29,22,0)'; };
  sc.addEventListener('scroll', paint, { passive: true }); paint();
  wireOrder();
}
function wireOrder() {
  const v = $('#v-order');
  if (!S.o.sOpen) wireModeRow('o', 'o-ctx');
  const so = $('#o-so'); if (so) so.onclick = () => { S.o.sOpen = true; S.o.q = ''; S.ojump = true; rOrder(); setTimeout(() => { const i = $('#o-q'); if (i) i.focus(); }, 400); };
  const sx = $('#o-sx'); if (sx) sx.onclick = () => { S.o.sOpen = false; S.o.q = ''; S.ojump = true; rOrder(); };
  const q = $('#o-q'); if (q) q.oninput = () => { S.o.q = q.value; const pos = q.selectionStart; const body = $('#o-sres'); rOrderSearchOnly(pos); };
  $$('[data-meal]', v).forEach((b) => (b.onclick = () => { S.o.meal = b.dataset.meal; S.o.grp = null; rOrder(); }));
  $$('[data-grp]', v).forEach((b) => (b.onclick = () => { S.o.grp = b.dataset.grp; S.o.sub = 'all'; S.o.sort = 'pop'; S.o.diets = {}; const sc = $('#order-scroll'); S.ojump = !sc || sc.scrollTop > 150; rOrder(); }));
  const bk = $('#o-back'); if (bk) bk.onclick = () => { S.o.grp = null; S.ojump = true; rOrder(); };
  $$('[data-sub]', v).forEach((b) => (b.onclick = () => { S.o.sub = b.dataset.sub; rOrder(); }));
  const fb = $('#o-filter'); if (fb) fb.onclick = () => filterSheet();
  const fc = $('#o-fclear'); if (fc) fc.onclick = () => { S.o.sort = 'pop'; S.o.diets = {}; rOrder(); };
  $$('[data-try]', v).forEach((b) => (b.onclick = () => { S.o.q = b.dataset.try; rOrder(); const i = $('#o-q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }));
  $$('#v-order [data-open]').forEach((b) => (b.onclick = () => dishSheet(b.dataset.open)));
  $$('#v-order [data-qadd]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); S.tap = [e.clientX - $('.screen').getBoundingClientRect().left, e.clientY - $('.screen').getBoundingClientRect().top]; quickAdd(b.dataset.qadd); }));
}
// typing re-draws only the results, so the field keeps its focus and cursor
function rOrderSearchOnly() {
  const host = $('#order-scroll > div'), field = $('#o-sw'); if (!host) return rOrder();
  const html = oSearch(), tmp = document.createElement('div'); tmp.innerHTML = html;
  let res = $('#o-sres'); if (!res) { res = document.createElement('div'); res.id = 'o-sres'; [...host.children].forEach((ch, k) => { if (k > 0 && !ch.matches('p')) ch.remove(); }); host.insertBefore(res, host.lastElementChild); }
  res.innerHTML = html; wireOrder();
}
function filterSheet() {
  const draw = () => {
    const g = OG[oMeal()].find((x) => x.id === S.o.grp), n = g ? g.ids.filter(keepD).length : 0;
    sheetBody(`<div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:22px">Sort &amp; filter</h2><button class="press" id="f-reset" style="border:0;background:none;font-size:13.5px;font-weight:700;color:${C.RED};padding:8px">Reset</button></div>
      <div style="display:flex;flex-direction:column;gap:8px"><span style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${C.MUT}">Sort by</span>${['pop', 'low', 'high'].map((k) => { const on = S.o.sort === k;
        return `<button class="press" data-fsort="${k}" aria-pressed="${on}" style="height:48px;border:0;border-radius:14px;padding:0 16px;display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600;color:${C.INK};background:${C.SURF};box-shadow:${on ? `inset 0 0 0 2px ${C.INK}` : `inset 0 0 0 1px ${C.LINE}`}">${SN[k]}<span style="width:20px;height:20px;border-radius:10px;box-sizing:border-box;border:${on ? `6px solid ${C.RED}` : '2px solid #C9BBA8'}"></span></button>`; }).join('')}</div>
      <div style="display:flex;flex-direction:column;gap:8px"><span style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${C.MUT}">Diet</span><div style="display:flex;flex-wrap:wrap;gap:8px">${['v', 'vg', 'gf'].map((k) => `<button class="press" data-fdiet="${k}" aria-pressed="${!!S.o.diets[k]}" style="height:40px;padding:0 15px;border-radius:20px;border:0;font-size:13.5px;font-weight:650;${SEL(!!S.o.diets[k])}">${DN[k]}</button>`).join('')}</div></div>
      ${btn(`Show ${n} ${n === 1 ? 'dish' : 'dishes'}`, 'filled', 'l', 'width:100%', 'id="f-go"')}`);
    $$('#sheet [data-fsort]').forEach((b) => (b.onclick = () => { S.o.sort = b.dataset.fsort; draw(); rOrder(); }));
    $$('#sheet [data-fdiet]').forEach((b) => (b.onclick = () => { const k = b.dataset.fdiet; S.o.diets = { ...S.o.diets, [k]: !S.o.diets[k] }; draw(); rOrder(); }));
    $('#f-reset').onclick = () => { S.o.sort = 'pop'; S.o.diets = {}; draw(); rOrder(); };
    $('#f-go').onclick = () => closeSheet();
  };
  draw(); openSheet();
}

// ---------- the bag holds lines: a dish, its choices and its price ----------
const lineId = (x) => (typeof x === 'string' ? x : x.id);
const lineUnit = (x) => (typeof x === 'string' ? MENU[x].price : x.unit);
const lineKey = (x) => (typeof x === 'string' ? x + '|' : x.key);
function priced(id, opt) {
  const gs = ENG.OPTS(OB[id]); let extra = 0; const bits = [], full = {};
  gs.forEach((g) => { const v = g.key in opt ? opt[g.key] : g.type === 'many' ? {} : g.def; full[g.key] = v;
    if (g.type === 'many') g.choices.forEach((ch) => { if ((v || {})[ch.label]) { extra += ch.price; bits.push(ch.label); } });
    else { const ch = g.choices.find((x) => x.label === v); if (ch && (v !== g.def || (g.req && !g.def) || ch.price)) { extra += ch.price; bits.push(v); } } });
  return { full, unit: MENU[id].price + extra, summary: bits.join(' · ') };
}
function quickAdd(id) { if (ENG.OPTS(OB[id]).some((g) => g.req && !g.def)) return dishSheet(id); const p = priced(id, {}); add(id, { id, unit: p.unit, summary: '', key: id + '|' + JSON.stringify(p.full) + '|' }); }

// ---------- the dish: photo first, "goes great with it", then customize. Scroll and it goes full screen; pull down at the top and it steps back ----------
function dishSheet(id) {
  const D0 = { id, opt: {}, note: '', qty: 1, pairs: {}, custom: false, full: false, tried: false }; S.dish = D0;
  let host = $('#dish'); if (host) host.remove();
  $('.screen').insertAdjacentHTML('beforeend', `<div id="dish" style="position:absolute;inset:0;z-index:60">
    <button class="press" id="dish-scrim" aria-label="Close" style="position:absolute;inset:0;border:0;background:rgba(43,29,22,0);transition:background-color 260ms"></button>
    <div id="dish-panel" role="dialog" aria-label="${MENU[id].name}" style="position:absolute;left:0;right:0;bottom:0;height:752px;transform:translateY(100%);background:${C.G};border-radius:26px 26px 0 0;overflow:hidden;display:flex;flex-direction:column;transition:transform 380ms cubic-bezier(.32,.72,0,1),height 460ms cubic-bezier(.32,.72,0,1),border-radius 460ms cubic-bezier(.32,.72,0,1)">
      <div id="dish-sc" class="scroll" style="flex:1;overflow-y:auto"></div>
      <button class="press" id="dish-back" aria-label="Back to the dish" style="display:none;position:absolute;left:14px;top:${14}px;z-index:3;width:42px;height:42px;border-radius:21px;border:0;background:rgba(255,253,248,.95);box-shadow:0 2px 10px rgba(43,29,22,.25);align-items:center;justify-content:center">${oi('back', 20, C.INK, 2.2)}</button>
      <div id="dish-bar" style="display:flex;gap:12px;align-items:center;padding:12px 20px 26px;background:${C.G};box-shadow:0 -8px 16px -12px rgba(43,29,22,.3)"></div></div></div>`);
  host = $('#dish'); const panel = $('#dish-panel'), sc = $('#dish-sc');
  requestAnimationFrame(() => { panel.style.transform = 'translateY(0)'; $('#dish-scrim').style.background = 'rgba(43,29,22,.45)'; });
  const close = () => { panel.style.transform = 'translateY(100%)'; $('#dish-scrim').style.background = 'rgba(43,29,22,0)'; setTimeout(() => host.remove(), 380); S.dish = null; };
  const size = () => { const big = S.dish.custom || S.dish.full; panel.style.height = big ? '844px' : '752px'; panel.style.borderRadius = big ? '0' : '26px 26px 0 0'; $('#dish-back').style.display = S.dish.custom ? 'flex' : 'none'; };
  $('#dish-scrim').onclick = close;
  sc.addEventListener('scroll', () => { if (sc.scrollTop > 6 && !S.dish.full) { S.dish.full = true; size(); } }, { passive: true });
  // pull down past a limit at the top: full screen steps back to the sheet; on the sheet it closes
  let y0 = null, dy = 0, wheel = 0, wt;
  const pull = () => { if (S.dish.custom) return; if (S.dish.full) { S.dish.full = false; size(); } else close(); };
  sc.addEventListener('touchstart', (e) => { y0 = sc.scrollTop <= 0 ? e.touches[0].clientY : null; dy = 0; }, { passive: true });
  sc.addEventListener('touchmove', (e) => { if (y0 != null) dy = e.touches[0].clientY - y0; }, { passive: true });
  sc.addEventListener('touchend', () => { if (dy > 90) pull(); y0 = null; dy = 0; });
  sc.addEventListener('wheel', (e) => { if (sc.scrollTop > 0 || e.deltaY >= 0) { wheel = 0; return; } wheel -= e.deltaY; clearTimeout(wt); wt = setTimeout(() => (wheel = 0), 260); if (wheel > 140) { wheel = 0; pull(); } }, { passive: true });
  const draw = (toTop) => {
    const d = S.dish, m = MENU[id], it = OB[id], gs = ENG.OPTS(it), val = (g) => (g.key in d.opt ? d.opt[g.key] : g.type === 'many' ? {} : g.def);
    const missing = gs.find((g) => g.req && !val(g)), pz = priced(id, d.opt), pairIds = ENG.PAIR(it).filter((x) => MENU[x]);
    const pairsTotal = pairIds.filter((x) => d.pairs[x]).reduce((a, x) => a + MENU[x].price, 0), grand = pz.unit * d.qty + pairsTotal;
    const miss = missing ? 'Choose ' + missing.name.replace('Your ', 'your ').replace('Hot or iced', 'hot or iced').replace('Milk', 'your milk') : '';
    const keep = toTop ? 0 : sc.scrollTop, tags = m.flags.filter((f) => TAGS[f]).map((f) => `<span style="font-size:11.5px;font-weight:700;color:${TAGS[f][1]};background:${TAGS[f][1]}14;border-radius:999px;padding:3px 8px">${TAGS[f][0]}</span>`).join('') + popBadge(id);
    const head = `<div style="position:relative">${photo('100%', 'sq', m.name, tone(m.cat), 0, false)}${d.custom ? '' : `<button class="press" id="dish-x" aria-label="Close" style="position:absolute;right:14px;top:14px;width:40px;height:40px;border-radius:20px;border:0;background:rgba(255,253,248,.94);display:flex;align-items:center;justify-content:center">${oi('x', 18, C.INK, 2.2)}</button>`}</div>`;
    if (!d.custom) {
      sc.innerHTML = head + `<div style="padding:16px 20px 4px;display:flex;flex-direction:column;gap:6px">
          <span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${C.RED}">${(D.og.where[id] || [''])[0]}</span>
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px"><h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:26px;line-height:1.15">${m.name}</h2><b style="font-size:17px;white-space:nowrap">${money(m.price)}</b></div>
          ${m.desc ? `<p style="margin:0;font-size:14.5px;line-height:1.5;color:${C.MUT}">${m.desc}</p>` : ''}${tags ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${tags}</div>` : ''}</div>
        ${pairIds.length ? `<div style="margin:18px 20px 0"><b style="font-size:15px">Goes great with it</b><div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">${pairIds.map((x) => { const on = !!d.pairs[x];
          return `<button class="press" data-pair="${x}" aria-pressed="${on}" style="display:flex;align-items:center;gap:12px;padding:8px 12px 8px 8px;border:0;border-radius:16px;background:${C.SURF};box-shadow:${on ? `inset 0 0 0 2px ${C.RED}` : `inset 0 0 0 1px ${C.LINE}`};text-align:left;color:inherit">${photo('52px', 52, MENU[x].name, tone(MENU[x].cat), 12, false)}<span style="flex:1;min-width:0;display:flex;flex-direction:column"><b style="font-size:14px">${MENU[x].name}</b><span style="font-size:12.5px;color:${C.MUT}">+${money(MENU[x].price)}</span></span><span style="width:26px;height:26px;border-radius:13px;flex:none;display:flex;align-items:center;justify-content:center;${on ? `background:${C.RED}` : 'box-shadow:inset 0 0 0 2px #C9BBA8'};color:#fff;font-size:15px;font-weight:800">${on ? '✓' : ''}</span></button>`; }).join('')}</div></div>` : ''}
        ${gs.length ? `<button class="press" id="dish-cust" style="margin:18px 20px 0;width:calc(100% - 40px);min-height:58px;border:0;border-radius:16px;background:${C.SURF};box-shadow:${missing && d.tried ? `inset 0 0 0 2px ${C.RED}` : `inset 0 0 0 1px ${C.LINE}`};display:flex;align-items:center;gap:12px;padding:10px 14px;text-align:left;color:inherit">
            <span style="width:34px;height:34px;border-radius:17px;background:${C.TINT};display:flex;align-items:center;justify-content:center;flex:none">${mIcon('sliders', 17, C.INK, 2)}</span>
            <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><b style="font-size:15px">${pz.summary ? 'Your choices' : 'Make it yours'}</b><span style="font-size:12.5px;line-height:1.35;color:${missing ? C.RED : C.MUT}">${missing ? 'Required: ' + miss.replace('Choose ', 'choose ') : pz.summary ? pz.summary + ' · Edit' : 'Customize ' + gs.map((g) => g.name.toLowerCase().replace('your ', '')).slice(0, 3).join(', ')}</span></span>${oi('chev', 18, C.MUT, 2.2).replace('<path d="m6 9 6 6 6-6"/>', '<path d="m9 6 6 6-6 6"/>')}</button>` : ''}
        <div style="height:22px"></div>`;
    } else {
      sc.innerHTML = head + `<div style="padding:16px 20px 2px;display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${C.RED}">Customize</span><h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:24px;line-height:1.15">${m.name}</h2><span style="font-size:13px;color:${C.MUT}">${missing ? 'Pick the required choices, then add extras if you like.' : 'Change anything you like. Extras show their price.'}</span></div>
        <div class="fadein">${gs.map((g) => { const v = val(g), done = g.req ? !!v : true, tag = g.req ? (done ? 'Done' : 'Required') : g.type === 'one' ? 'Pick one' : 'Optional';
          return `<section style="margin:12px 20px 0;padding:14px 16px;border-radius:18px;background:${C.SURF};box-shadow:${g.req && !done && d.tried ? `inset 0 0 0 2px ${C.RED}` : `inset 0 0 0 1px ${C.LINE}`}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><b style="font-size:15px">${g.name}</b><span style="font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:${g.req && !done ? '#F3DADC' : g.req ? '#E4EEE6' : C.TINT};color:${g.req && !done ? '#8A1324' : g.req ? '#2F6B4A' : C.MUT}">${tag}</span></div>
            <div style="display:flex;flex-direction:column;margin-top:6px">${g.choices.map((ch) => { const on = g.type === 'many' ? !!(v || {})[ch.label] : v === ch.label;
              return `<button class="press" data-g="${g.key}" data-c="${ch.label.replace(/"/g, '&quot;')}" aria-pressed="${on}" style="display:flex;align-items:center;gap:12px;min-height:46px;padding:0 2px;border:0;border-bottom:1px solid ${C.LINE};background:none;text-align:left;color:inherit"><span style="width:22px;height:22px;flex:none;border-radius:${g.type === 'many' ? '6px' : '11px'};box-sizing:border-box;${on ? (g.type === 'many' ? `background:${C.RED}` : `border:6px solid ${C.RED}`) : 'border:2px solid #C9BBA8'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900">${on && g.type === 'many' ? '✓' : ''}</span><span style="flex:1;font-size:14.5px;font-weight:${on ? 700 : 500}">${ch.label}</span><span style="font-size:13.5px;color:${C.MUT};font-weight:600">${ch.price ? '+' + money(ch.price) : ''}</span></button>`; }).join('')}</div></section>`; }).join('')}
        <section style="margin:12px 20px 0;padding:14px 16px;border-radius:18px;background:${C.SURF};box-shadow:inset 0 0 0 1px ${C.LINE}"><label style="display:flex;flex-direction:column;gap:8px"><b style="font-size:15px">Anything else?</b><textarea id="dish-note" rows="2" aria-label="Note for the kitchen" placeholder="Example: cut in half, extra napkins" style="resize:none;border:0;border-radius:12px;background:${C.G};padding:10px 12px;font:inherit;font-size:14px;color:${C.INK};outline:none">${d.note}</textarea></label></section>
        <p style="margin:12px 20px 24px;font-size:12px;color:${C.MUT};line-height:1.45">Drink options and prices are the café’s own online-order options at SDSU. Food extras are priced from the café’s sides.</p></div>`;
    }
    const label = d.custom ? (missing ? miss : 'Done · ' + money(pz.unit * d.qty)) : missing ? miss : 'Add to bag · ' + money(grand);
    $('#dish-bar').innerHTML = `<div style="display:flex;align-items:center;gap:4px;height:52px;padding:0 6px;border-radius:26px;background:${C.SURF};box-shadow:inset 0 0 0 1px ${C.LINE}"><button class="press" id="dq-minus" aria-label="One less" style="width:40px;height:40px;border-radius:20px;border:0;background:none;font-size:22px;color:${C.INK}">−</button><b style="min-width:20px;text-align:center;font-size:16px">${d.qty}</b><button class="press" id="dq-plus" aria-label="One more" style="width:40px;height:40px;border-radius:20px;border:0;background:none;font-size:22px;color:${C.INK}">+</button></div>
      <button class="press" id="dish-go" style="flex:1;height:52px;border-radius:26px;border:0;background:${missing ? '#8C7F74' : C.RED};color:#fff;font-size:15px;font-weight:700;transition:background-color 200ms">${label}</button>`;
    sc.scrollTop = keep; size();
    // wiring
    const x = $('#dish-x'); if (x) x.onclick = close;
    $("#dq-minus").onclick = () => { d.qty = Math.max(1, d.qty - 1); draw(); }; $("#dq-plus").onclick = () => { d.qty += 1; draw(); };
    $$('#dish [data-pair]').forEach((b) => (b.onclick = () => { d.pairs = { ...d.pairs, [b.dataset.pair]: !d.pairs[b.dataset.pair] }; draw(); }));
    const cu = $('#dish-cust'); if (cu) cu.onclick = () => { d.custom = true; draw(true); };
    $('#dish-back').onclick = () => { d.custom = false; draw(true); };
    const nt = $('#dish-note'); if (nt) nt.oninput = () => { d.note = nt.value; };
    $$('#dish [data-g]').forEach((b) => (b.onclick = () => { const g = gs.find((z) => z.key === b.dataset.g), lab = b.dataset.c, v = val(g);
      if (g.type !== 'many') d.opt = { ...d.opt, [g.key]: lab };
      else { const nv = { ...(v || {}), [lab]: !(v || {})[lab] }; if (g.only1 && g.only1.includes(lab) && nv[lab]) g.only1.forEach((o) => { if (o !== lab) nv[o] = false; }); d.opt = { ...d.opt, [g.key]: nv }; }
      draw(); }));
    $('#dish-go').onclick = () => {
      if (missing) { d.tried = true; if (!d.custom) d.custom = true; return draw(!d.custom); }
      if (d.custom) { d.custom = false; return draw(true); }
      const note = (d.note || '').trim(), summary = [pz.summary, note ? '“' + note + '”' : ''].filter(Boolean).join(' · '), key = id + '|' + JSON.stringify(pz.full) + '|' + note;
      for (let k = 0; k < d.qty; k++) add(id, { id, unit: pz.unit, summary, key }, k < d.qty - 1);
      pairIds.filter((x) => d.pairs[x]).forEach((x) => add(x, { id: x, unit: MENU[x].price, summary: '', key: x + '|' }, true));
      const more = pairIds.filter((x) => d.pairs[x]).length; close();
      toast(`Added ${m.name}${d.qty > 1 ? ' ×' + d.qty : ''}${more ? ' + ' + more + ' more' : ''}`);
    };
  };
  draw(true);
}
