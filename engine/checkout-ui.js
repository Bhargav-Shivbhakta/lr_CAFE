// ---------- checkout (screen) ----------
// Shows what the checkout engine works out; it never does its own sums. Bag → "Checkout" opens it.
// It lives above the bottom bar like every other page. Order of the page (top to bottom):
//   how and when → anything that would stop the order → your order → one "goes great with it" row →
//   who it's for → rewards → promo code → tip → payment → totals → Place order (pinned at the bottom).
/*CHECKOUT_ENGINE*/
const CO_CFG = () => D.cafe.checkout;
const fmtT = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const dayWord = (d) => { const t = now(), a = new Date(t.getFullYear(), t.getMonth(), t.getDate()), b = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const n = Math.round((b - a) / 864e5); return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long' }); };
function coLines() {
  const by = new Map();
  S.bag.forEach((x) => { const k = lineKey(x), id = lineId(x), cur = by.get(k); if (cur) cur.qty++; else by.set(k, { key: k, id, name: MENU[id].name, unit: lineUnit(x), qty: 1, summary: typeof x === 'string' ? '' : x.summary || '' }); });
  return [...by.values()];
}
function coOpenAt(at) { const L = loc(S.cafe), h = L && L.hours[['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][at.getDay()]]; if (!h) return false; const m = at.getHours() * 60 + at.getMinutes(), mm = (x) => +x.split(':')[0] * 60 + +x.split(':')[1]; return m >= mm(h[0]) && m < mm(h[1]); }
function coWhen() { // the Date the order is for
  const c = S.co; if (c.when !== 'asap') return new Date(c.when);
  return new Date(+now() + (wait(S.cafe) || [12, 15])[0] * 60000);
}
function coState() {
  const c = S.co, lines = coLines(), cfg = CO_CFG();
  const q = Checkout.quote({ lines, cfg, ful: S.ful, tip: c.tip, reward: c.reward, promo: c.promoApplied, points: S.user ? S.user.points : 0, firstOrder: !(S.user && S.user.orders) });
  const at = coWhen(), probs = Checkout.check({ lines, at, availAt: (id, t) => avail(id, t), openAt: coOpenAt });
  const needName = !c.name.trim();
  return { lines, q, at, probs, needName, cfg };
}
function openCheckout() {
  closeSheet();
  S.co = S.co || { when: 'asap', tip: null, reward: null, promo: '', promoApplied: '', promoOpen: false, name: S.user ? S.user.name : '', phone: '', note: '', utensils: false, pay: 'apple', schedOpen: false, schedDay: 0 };
  if (S.mode && !S.mode.asap && S.mode.at) S.co.when = S.mode.at;
  const navH = $('#tabs') && $('#tabs').style.display !== 'none' ? 83 : 0;
  $('.screen').insertAdjacentHTML('beforeend', `<div id="co" role="dialog" aria-label="Checkout" style="position:absolute;left:0;right:0;top:0;bottom:${navH}px;z-index:60;background:${C.G};display:flex;flex-direction:column;transform:translateX(100%);transition:transform 340ms cubic-bezier(.32,.72,0,1)">
    <header style="flex:none;height:56px;margin-top:44px;padding:0 12px;display:flex;align-items:center;justify-content:space-between"><button class="press" id="co-back" aria-label="Back to bag" style="width:44px;height:44px;border-radius:22px;border:0;background:${C.SURF};box-shadow:${C.EL1};display:flex;align-items:center;justify-content:center">${oi('back', 20, C.INK, 2.2)}</button><h1 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:500;font-size:24px">Checkout</h1><button class="press" id="co-x" aria-label="Close checkout" style="width:44px;height:44px;border-radius:22px;border:0;background:${C.SURF};box-shadow:${C.EL1};display:flex;align-items:center;justify-content:center">${oi('x', 18, C.INK, 2.4)}</button></header>
    <div id="co-sc" class="scroll" style="flex:1;overflow-y:auto;padding:8px 20px 24px"></div>
    <div id="co-bar" style="flex:none;padding:12px 20px ${navH ? 12 : 26}px;background:${C.G};box-shadow:0 -8px 16px -12px rgba(43,29,22,.3)"></div></div>`);
  requestAnimationFrame(() => { const e = $('#co'); if (e) e.style.transform = 'translateX(0)'; });
  $('#co-back').onclick = () => { closeCheckout(); setTimeout(openBag, 200); };
  $('#co-x').onclick = closeCheckout;
  drawCheckout();
}
function closeCheckout() { const e = $('#co'); if (!e) return; e.style.transform = 'translateX(100%)'; setTimeout(() => e.remove(), 340); }
const coCard = (inner, extra = '') => `<section style="background:${C.SURF};border-radius:18px;box-shadow:${C.EL1};padding:14px 16px;display:flex;flex-direction:column;gap:10px;${extra}">${inner}</section>`;
const coH = (t, right = '') => `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><h2 style="margin:0;font-size:15.5px;font-weight:700">${t}</h2>${right}</div>`;
const chip = (on, label, attrs, sub = '') => `<button class="press" ${attrs} aria-pressed="${on}" style="flex:1;min-width:0;min-height:48px;padding:6px 8px;border-radius:14px;border:0;background:${on ? C.INK : C.TINT};color:${on ? C.G : C.INK};font-size:14px;font-weight:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;white-space:normal;text-align:center">${label}${sub ? `<span style="font-size:11.5px;font-weight:500;opacity:.8">${sub}</span>` : ''}</button>`;
const coRow = (l, r, strong) => `<div style="display:flex;justify-content:space-between;gap:12px;font-size:${strong ? 17 : 14}px;${strong ? 'font-weight:800' : `color:${C.MUT}`}"><span>${l}</span><span style="font-variant-numeric:tabular-nums;${strong ? '' : `color:${C.INK}`}">${r}</span></div>`;
function drawCheckout() {
  const sc = $('#co-sc'); if (!sc) return; const top = sc.scrollTop;
  if (!S.bag.length) { closeCheckout(); return; }
  const { lines, q, at, probs, needName, cfg } = coState(), c = S.co, cafe = cafeOf(), [wa, wb] = wait(S.cafe) || [12, 15];
  const isDel = S.ful === 'delivery', isDine = S.ful === 'dine';
  // how and when
  const slots = Checkout.slots({ now: now(), hours: loc(S.cafe).hours, prepMin: wa, step: cfg.slotStepMinutes });
  const days = [...new Set(slots.map((s) => s.day))];
  const when = isDine ? `<p style="margin:0;font-size:14px;color:${C.MUT}">We’ll bring it to Table ${S.table} as soon as it’s ready.</p>`
    : isDel ? `<p style="margin:0;font-size:14px;color:${C.MUT}">${S.addr ? `To ${S.addr.short} · 25–35 min · delivered by DoorDash` : 'Add a delivery address first.'}</p>`
    : `<div style="display:flex;gap:8px">${chip(c.when === 'asap', 'As soon as it’s ready', 'data-when="asap"', `${wa}–${wb} min`)}${chip(c.when !== 'asap', c.when !== 'asap' ? `${dayWord(at)} ${fmtT(at)}` : 'Schedule', 'data-when="sched"', c.when !== 'asap' ? 'Tap to change' : 'Pick a time')}</div>
      ${c.schedOpen ? `<div style="display:flex;gap:8px">${days.map((d) => chip(c.schedDay === d, d === 0 ? 'Today' : 'Tomorrow', `data-sday="${d}"`)).join('')}</div>
      <div class="hscroll" style="display:flex;gap:8px;overflow-x:auto;margin:0 -16px;padding:2px 16px 4px">${slots.filter((s) => s.day === c.schedDay).map((s) => `<button class="press" data-slot="${s.at.toISOString()}" aria-pressed="${c.when === s.at.toISOString()}" style="flex:none;height:44px;padding:0 14px;border-radius:12px;border:0;background:${c.when === s.at.toISOString() ? C.INK : C.TINT};color:${c.when === s.at.toISOString() ? C.G : C.INK};font-size:14px;font-weight:700;white-space:nowrap">${fmtT(s.at)}</button>`).join('') || `<span style="font-size:13.5px;color:${C.MUT}">No more times today.</span>`}</div>` : ''}`;
  const how = coCard(`${coH(isDine ? 'Dine in' : isDel ? 'Delivery' : 'Pickup', `<span style="font-size:13px;color:${C.MUT};text-align:right">${cafe.name}</span>`)}${when}`);
  // problems that would stop the order
  const prob = probs.length ? `<section role="alert" style="border-radius:18px;background:#FDECEC;box-shadow:inset 0 0 0 1.5px ${STOP};padding:14px 16px;display:flex;flex-direction:column;gap:10px"><b style="font-size:15px;color:${STOP}">Fix ${probs.length === 1 ? 'this' : 'these'} to place your order</b>${probs.map((p) => `<div style="display:flex;flex-direction:column;gap:6px"><span style="font-size:14px;font-weight:600">${p.text}</span><span style="font-size:12.5px;color:${C.MUT}">${p.fix || ''}</span><div style="display:flex;gap:8px;flex-wrap:wrap">${p.id ? `<button class="press" data-prm="${p.id}" style="height:40px;padding:0 14px;border-radius:999px;border:0;background:${C.INK};color:${C.G};font-size:13.5px;font-weight:700">Remove it</button>` : ''}${p.kind === 'soldout' && similar(p.id, 1)[0] ? `<button class="press" data-pswap="${p.id}" style="height:40px;padding:0 14px;border-radius:999px;border:0;background:${C.TINT};font-size:13.5px;font-weight:700">Try ${MENU[similar(p.id, 1)[0]].name}</button>` : ''}${p.kind === 'time' && c.when !== 'asap' ? `<button class="press" data-when="asap" style="height:40px;padding:0 14px;border-radius:999px;border:0;background:${C.TINT};font-size:13.5px;font-weight:700">Get it now instead</button>` : ''}</div></div>`).join('')}</section>` : '';
  // your order
  const items = coCard(`${coH('Your order', `<button class="press" id="co-more" style="border:0;background:none;color:${C.RED};font-size:13.5px;font-weight:700;min-height:44px;margin:-12px -4px">Add more</button>`)}${lines.map((l) => `<div style="display:flex;gap:12px;align-items:center">${photo('52px', 52, l.name, tone(MENU[l.id].cat), 12, false)}<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;white-space:normal"><b style="font-size:14.5px">${l.name}</b>${l.summary ? `<span style="font-size:12.5px;color:${C.MUT}">${l.summary}</span>` : ''}<span style="font-size:13px;font-variant-numeric:tabular-nums">${money(l.unit * l.qty)}</span></span><span style="flex:none;display:flex;align-items:center;gap:2px;border-radius:999px;background:${C.TINT}"><button class="press" data-qm="${l.key}" aria-label="${l.qty === 1 ? 'Remove' : 'One fewer'} ${l.name}" style="width:40px;height:40px;border:0;background:none;font-size:20px;font-weight:700">${l.qty === 1 ? oi('x', 15, C.INK, 2.4) : '−'}</button><span style="min-width:16px;text-align:center;font-weight:700;font-variant-numeric:tabular-nums">${l.qty}</span><button class="press" data-qp="${l.key}" aria-label="One more ${l.name}" style="width:40px;height:40px;border:0;background:none;font-size:20px;font-weight:700">+</button></span></div>`).join('')}`);
  // one "goes great with it" row: paid add-ons that fit what's in the bag, not already in it
  const have = new Set(lines.map((l) => l.id)), ups = [...new Map(lines.flatMap((l) => (ENG.PAIR(OB[l.id]) || []).map((p) => [p.id, p]))).values()].filter((p) => !have.has(p.id) && MENU[p.id] && avail(p.id).ok).slice(0, 4);
  const up = ups.length ? `<section style="display:flex;flex-direction:column;gap:8px"><h2 style="margin:0;font-size:15.5px;font-weight:700">Goes great with your order</h2><div class="hscroll" style="display:flex;gap:10px;overflow-x:auto;margin:0 -20px;padding:2px 20px 6px">${ups.map((p) => `<button class="press" data-up="${p.id}" style="flex:none;width:150px;border:0;padding:8px;border-radius:16px;background:${C.SURF};box-shadow:${C.EL1};display:flex;gap:8px;align-items:center;text-align:left">${photo('44px', 44, MENU[p.id].name, tone(MENU[p.id].cat), 10, false)}<span style="flex:1;min-width:0;display:flex;flex-direction:column;white-space:normal"><b style="font-size:12.5px;line-height:1.25">${MENU[p.id].name}</b><span style="font-size:12px;color:${C.MUT}">+${money(MENU[p.id].price)}</span></span></button>`).join('')}</div></section>` : '';
  // who it's for
  const fld = (id, label, val, attrs) => `<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12.5px;font-weight:700;color:${C.MUT}">${label}</span><input id="${id}" value="${val.replace(/"/g, '&quot;')}" ${attrs} style="height:48px;border-radius:12px;border:0;box-shadow:inset 0 0 0 1.5px ${C.LINE};background:${C.G};padding:0 14px;font:inherit;font-size:15px;color:${C.INK}"></label>`;
  const who = coCard(`${coH(isDel ? 'Your details' : 'Name for the order')}${fld('co-name', isDel ? 'Name' : 'We’ll call this name at the counter', c.name, 'autocomplete="given-name" placeholder="Your first name" maxlength="24"')}${fld('co-phone', 'Text me when it’s ready (optional)', c.phone, 'type="tel" inputmode="tel" autocomplete="tel" placeholder="(619) 555-0123" maxlength="16"')}
    <label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12.5px;font-weight:700;color:${C.MUT}">Note for the café (optional)</span><textarea id="co-note" maxlength="140" rows="2" placeholder="Anything we should know?" style="border-radius:12px;border:0;box-shadow:inset 0 0 0 1.5px ${C.LINE};background:${C.G};padding:10px 14px;font:inherit;font-size:15px;color:${C.INK};resize:none">${c.note}</textarea></label>
    <button class="press" id="co-ut" role="switch" aria-checked="${c.utensils}" style="display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:48px;border:0;background:none;padding:0;text-align:left;white-space:normal"><span style="display:flex;flex-direction:column;gap:2px"><b style="font-size:14.5px">Utensils and napkins</b><span style="font-size:12.5px;color:${C.MUT}">Off unless you need them. Less waste.</span></span><span aria-hidden="true" style="flex:none;width:50px;height:30px;border-radius:15px;background:${c.utensils ? C.RED : C.LINE};position:relative;transition:background 200ms"><span style="position:absolute;top:3px;left:${c.utensils ? 23 : 3}px;width:24px;height:24px;border-radius:12px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:left 200ms"></span></span></button>`);
  // rewards
  const pts = S.user ? S.user.points : 0;
  const rw = S.user ? coCard(`${coH('Rewards', `<span style="font-size:13px;color:${C.MUT}">${pts} points</span>`)}<div style="display:flex;gap:8px">${cfg.rewards.map((r) => chip(c.reward === r.id, r.label.replace(' your order', ''), `data-rw="${r.id}" ${pts < r.points ? 'disabled' : ''}`, pts < r.points ? `${r.points - pts} more points` : `${r.points} points`)).join('')}</div>${q.notes.filter((n) => n.field === 'reward').map((n) => `<span style="font-size:12.5px;color:${STOP}">${n.text}</span>`).join('')}`)
    : coCard(`<div style="display:flex;gap:12px;align-items:center"><span style="flex:1;font-size:14px;line-height:1.45;white-space:normal"><b>Earn ${q.earn} points on this order.</b> Join Living Room Rewards for free.</span>${btn('Join', 'tint', 's', 'flex:none', 'id="co-join"')}</div>`);
  // promo
  const pn = q.notes.find((n) => n.field === 'promo');
  const promo = coCard(c.promoOpen || c.promoApplied ? `${coH('Promo code')}<div style="display:flex;gap:8px"><input id="co-promo" value="${c.promo.replace(/"/g, '&quot;')}" placeholder="Enter code" autocapitalize="characters" style="flex:1;min-width:0;height:48px;border-radius:12px;border:0;box-shadow:inset 0 0 0 1.5px ${pn ? STOP : C.LINE};background:${C.G};padding:0 14px;font:inherit;font-size:15px;text-transform:uppercase;color:${C.INK}"><button class="press" id="co-apply" style="flex:none;height:48px;padding:0 18px;border-radius:12px;border:0;background:${C.INK};color:${C.G};font-size:14px;font-weight:700">${q.promo ? 'Applied' : 'Apply'}</button></div>${pn ? `<span role="alert" style="font-size:12.5px;color:${STOP}">${pn.text}</span>` : q.promo ? `<span style="font-size:12.5px;color:#2E7D4F;font-weight:600">${q.promo.label}</span>` : ''}`
    : `<button class="press" id="co-popen" style="display:flex;justify-content:space-between;align-items:center;min-height:44px;border:0;background:none;padding:0;font-size:14.5px;font-weight:700;color:${C.INK}"><span>Have a promo code?</span>${oi('chev', 18, C.MUT, 2)}</button>`, 'padding:6px 16px');
  // tip: nothing chosen for you
  const tp = c.tip;
  const tip = isDel ? '' : coCard(`${coH('Add a tip', `<span style="font-size:12.5px;color:${C.MUT}">All tips go to the team</span>`)}<div style="display:flex;gap:6px">${chip(!tp, 'No tip', 'data-tip="0"')}${cfg.tipPresets.map((p) => chip(tp && tp.pct === p, `${Math.round(p * 100)}%`, `data-tip="${p}"`, money(Checkout.r2(q.subtotal * p)))).join('')}${chip(tp && tp.amount != null, 'Other', 'data-tip="other"', tp && tp.amount != null ? money(tp.amount) : '')}</div>${tp && tp.amount != null ? `<label style="display:flex;align-items:center;gap:8px"><span style="font-weight:700">$</span><input id="co-tipamt" inputmode="decimal" value="${tp.amount || ''}" placeholder="0.00" aria-label="Tip amount" style="flex:1;height:44px;border-radius:12px;border:0;box-shadow:inset 0 0 0 1.5px ${C.LINE};background:${C.G};padding:0 12px;font:inherit;font-size:15px"></label>` : ''}`);
  // payment (demo: nothing is charged)
  const PAY = [['apple', 'Apple Pay', ''], ['card', 'Visa ending 4242', 'Saved card'], ['gift', 'Living Room gift card', 'Balance $25.00']];
  const pay = coCard(`${coH('Pay with')}${PAY.map(([id, l, sub]) => `<button class="press" data-pay="${id}" role="radio" aria-checked="${c.pay === id}" style="display:flex;align-items:center;gap:12px;min-height:52px;border:0;background:none;padding:0;text-align:left"><span aria-hidden="true" style="flex:none;width:22px;height:22px;border-radius:11px;box-shadow:inset 0 0 0 2px ${c.pay === id ? C.RED : C.LINE};display:flex;align-items:center;justify-content:center">${c.pay === id ? `<span style="width:12px;height:12px;border-radius:6px;background:${C.RED}"></span>` : ''}</span><span style="flex:1;display:flex;flex-direction:column"><b style="font-size:14.5px">${l}</b>${sub ? `<span style="font-size:12.5px;color:${C.MUT}">${sub}</span>` : ''}</span></button>`).join('')}`);
  // totals
  const tot = coCard(`${coRow('Subtotal', money(q.subtotal))}${q.discount ? coRow(q.reward && q.promo ? 'Rewards and promo' : q.reward ? 'Rewards' : 'Promo', '−' + money(q.discount)) : ''}${q.fee ? coRow('Delivery fee', money(q.fee)) : ''}${coRow(`Tax (${(cfg.taxRate * 100).toFixed(2)}%)`, money(q.tax))}${q.tip ? coRow('Tip', money(q.tip)) : ''}<div style="height:1px;background:${C.LINE}"></div>${coRow('Total', money(q.total), true)}${S.user ? `<span style="font-size:12.5px;color:${C.MUT}">You’ll earn ${q.earn} points.</span>` : ''}`);
  sc.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px">${how}${prob}${items}${up}${who}${rw}${promo}${tip}${pay}${tot}<p style="margin:0;font-size:12px;line-height:1.5;color:${C.MUT};text-align:center">Demo: no real order is sent and no card is charged. Tax is confirmed by the café’s register.</p></div>`;
  sc.scrollTop = top;
  // the button says what's stopping it
  const block = probs.length ? 'Fix the problem above' : needName ? 'Add a name for the order' : isDel && !S.addr ? 'Add a delivery address' : '';
  const label = block || `Place order · ${money(q.total)}`;
  $('#co-bar').innerHTML = `<div style="display:flex;justify-content:space-between;font-size:12.5px;color:${C.MUT};margin-bottom:8px"><span>${isDine ? `Table ${S.table}` : isDel ? 'Delivery' : c.when === 'asap' ? `Ready in ${wa}–${wb} min` : `Ready ${dayWord(at).toLowerCase()} at ${fmtT(at)}`}</span><span>${lines.reduce((s, l) => s + l.qty, 0)} item${lines.reduce((s, l) => s + l.qty, 0) === 1 ? '' : 's'}</span></div><button class="press" id="b-place" ${block ? 'aria-disabled="true"' : ''} style="width:100%;height:56px;border-radius:999px;border:0;background:${block ? C.LINE : C.RED};color:${block ? C.MUT : '#fff'};font-size:16px;font-weight:800">${label}</button>`;
  wireCheckout(block);
}
function wireCheckout(block) {
  const c = S.co, re = () => drawCheckout();
  $$('#co [data-when]').forEach((b) => (b.onclick = () => { if (b.dataset.when === 'asap') { c.when = 'asap'; c.schedOpen = false; } else c.schedOpen = !c.schedOpen; re(); }));
  $$('#co [data-sday]').forEach((b) => (b.onclick = () => { c.schedDay = +b.dataset.sday; re(); }));
  $$('#co [data-slot]').forEach((b) => (b.onclick = () => { c.when = b.dataset.slot; c.schedOpen = false; re(); }));
  $$('#co [data-qp]').forEach((b) => (b.onclick = () => { const x = S.bag.find((y) => lineKey(y) === b.dataset.qp); if (x) S.bag.push(typeof x === 'string' ? x : { ...x }); syncChrome(); re(); }));
  $$('#co [data-qm]').forEach((b) => (b.onclick = () => { const k = S.bag.findIndex((y) => lineKey(y) === b.dataset.qm); if (k < 0) return; const [gone] = S.bag.splice(k, 1); syncChrome(); toast(`Removed ${MENU[lineId(gone)].name}`, () => { S.bag.push(gone); syncChrome(); if (!$('#co')) openCheckout(); else re(); }); re(); }));
  $$('#co [data-prm]').forEach((b) => (b.onclick = () => { S.bag = S.bag.filter((y) => lineId(y) !== b.dataset.prm); syncChrome(); re(); }));
  $$('#co [data-pswap]').forEach((b) => (b.onclick = () => { const id = b.dataset.pswap, alt = similar(id, 1)[0]; S.bag = S.bag.filter((y) => lineId(y) !== id); syncChrome(); closeCheckout(); dishSheet(alt); }));
  $$('#co [data-up]').forEach((b) => (b.onclick = () => { const id = b.dataset.up; bagPush(id, { id, unit: MENU[id].price, summary: '', key: id + '|' }, true); syncChrome(); toast(`Added ${MENU[id].name}`); re(); }));
  const more = $('#co-more'); if (more) more.onclick = () => { closeCheckout(); go('order'); };
  const keep = (id, k) => { const e = $(id); if (e) e.oninput = () => { c[k] = e.value; if (k === 'name') drawBar(); }; };
  keep('#co-name', 'name'); keep('#co-phone', 'phone'); keep('#co-note', 'note');
  const ut = $('#co-ut'); if (ut) ut.onclick = () => { c.utensils = !c.utensils; re(); };
  $$('#co [data-rw]').forEach((b) => (b.onclick = () => { if (b.disabled) return; c.reward = c.reward === b.dataset.rw ? null : b.dataset.rw; re(); }));
  const po = $('#co-popen'); if (po) po.onclick = () => { c.promoOpen = true; re(); setTimeout(() => { const i = $('#co-promo'); if (i) i.focus(); }, 50); };
  const pi = $('#co-promo'); if (pi) pi.oninput = () => { c.promo = pi.value; };
  const pa = $('#co-apply'); if (pa) pa.onclick = () => { c.promoApplied = c.promo; re(); };
  $$('#co [data-tip]').forEach((b) => (b.onclick = () => { const v = b.dataset.tip; c.tip = v === '0' ? null : v === 'other' ? { amount: (c.tip && c.tip.amount) || 0 } : { pct: +v }; re(); if (v === 'other') setTimeout(() => { const i = $('#co-tipamt'); if (i) i.focus(); }, 50); }));
  const ta = $('#co-tipamt'); if (ta) ta.onchange = () => { c.tip = { amount: Math.max(0, Math.round((parseFloat(ta.value) || 0) * 100) / 100) }; re(); };
  $$('#co [data-pay]').forEach((b) => (b.onclick = () => { c.pay = b.dataset.pay; re(); }));
  const j = $('#co-join'); if (j) j.onclick = () => { closeCheckout(); go('account'); };
  const pl = $('#b-place'); pl.onclick = () => {
    if (block) { const t = $('#co [role="alert"]') || (needNameEl()); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (!c.name.trim()) { const n = $('#co-name'); if (n) n.focus(); } return; }
    placeOk(() => placeOrder());
  };
}
const needNameEl = () => $('#co-name');
function drawBar() { // typing a name only re-draws the button, so the keyboard stays open
  const { probs, needName, q } = coState(), b = $('#b-place'); if (!b) return;
  const block = probs.length ? 'Fix the problem above' : needName ? 'Add a name for the order' : S.ful === 'delivery' && !S.addr ? 'Add a delivery address' : '';
  b.textContent = block || `Place order · ${money(q.total)}`; b.style.background = block ? C.LINE : C.RED; b.style.color = block ? C.MUT : '#fff';
  if (block) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
  wireCheckout(block);
}
// ---------- placing the order and following it ----------
function placeOrder() {
  const { lines, q, at } = coState(), c = S.co;
  const o = { no: 1040 + Math.floor(Math.random() * 60), lines, q, at: +at, asap: c.when === 'asap', name: c.name.trim(), ful: S.ful, table: S.table, cafe: cafeOf().name, placed: +now(), step: 0 };
  S.order = o; S.bag = []; S.co = null; syncChrome();
  if (S.user) { S.user.points = S.user.points - (q.reward ? q.reward.points : 0) + q.earn; S.user.orders = (S.user.orders || 0) + 1; store.set('user', S.user); }
  closeCheckout(); if (!S.kit) S.justOrdered = true;
  setTimeout(orderMoment, 200); setTimeout(() => { cupReact('ordered'); }, 4200);
  // demo: the order moves along on its own (the real app gets this from Toast)
  clearInterval(S.orderTick); S.orderTick = setInterval(() => { if (!S.order || S.order.step >= 2) return clearInterval(S.orderTick); S.order.step++; drawStatus(); syncOrderPill(); if (S.order.step === 2) toast(`${S.order.name ? S.order.name + ', your' : 'Your'} order is ready`); }, 9000);
}
const OSTEPS = [['Received', 'The café has your order'], ['Making it', 'Your barista is on it'], ['Ready', 'Come grab it at the pickup counter']];
function openStatus() {
  if (!S.order || $('#os')) return;
  const navH = $('#tabs') && $('#tabs').style.display !== 'none' ? 83 : 0;
  $('.screen').insertAdjacentHTML('beforeend', `<div id="os" role="dialog" aria-label="Your order" style="position:absolute;left:0;right:0;top:0;bottom:${navH}px;z-index:58;background:${C.G};display:flex;flex-direction:column;transform:translateY(100%);transition:transform 380ms cubic-bezier(.32,.72,0,1)">
    <header style="flex:none;height:56px;margin-top:44px;padding:0 12px;display:flex;align-items:center;justify-content:space-between"><span style="width:44px"></span><h1 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:500;font-size:24px">Your order</h1><button class="press" id="os-x" aria-label="Close" style="width:44px;height:44px;border-radius:22px;border:0;background:${C.SURF};box-shadow:${C.EL1};display:flex;align-items:center;justify-content:center">${oi('x', 18, C.INK, 2.4)}</button></header>
    <div id="os-sc" class="scroll" style="flex:1;overflow-y:auto;padding:8px 20px 24px"></div></div>`);
  requestAnimationFrame(() => { const e = $('#os'); if (e) e.style.transform = 'translateY(0)'; });
  $('#os-x').onclick = () => { const e = $('#os'); e.style.transform = 'translateY(100%)'; setTimeout(() => { e.remove(); syncOrderPill(); }, 380); };
  drawStatus();
}
function drawStatus() {
  const sc = $('#os-sc'), o = S.order; if (!sc || !o) return;
  const at = new Date(o.at), ready = o.step >= 2, dine = o.ful === 'dine', del = o.ful === 'delivery';
  const head = ready ? (dine ? 'On its way to your table' : del ? 'Out for delivery' : 'Ready for pickup') : o.asap ? `Ready around ${fmtT(at)}` : `Ready ${dayWord(at).toLowerCase()} at ${fmtT(at)}`;
  sc.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px">
    ${coCard(`<span style="font-size:12.5px;font-weight:700;letter-spacing:1px;color:${C.MUT}">ORDER #${o.no} · ${o.cafe.toUpperCase()}</span><h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:500;font-size:26px;line-height:1.15">${head}</h2>${o.name && !dine ? `<span style="font-size:14px;color:${C.MUT}">We’ll call <b style="color:${C.INK}">${o.name}</b> at the counter.</span>` : dine ? `<span style="font-size:14px;color:${C.MUT}">Table ${o.table}</span>` : ''}
      <ol aria-label="Order progress" style="list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:0">${OSTEPS.map(([t, d], i) => { const done = i <= o.step, now_ = i === o.step; return `<li style="display:flex;gap:12px;min-height:${i < 2 ? 58 : 40}px"><span style="flex:none;display:flex;flex-direction:column;align-items:center"><span style="width:24px;height:24px;border-radius:12px;background:${done ? C.RED : C.SURF};box-shadow:inset 0 0 0 2px ${done ? C.RED : C.LINE};display:flex;align-items:center;justify-content:center;${now_ && !ready ? 'animation:m-pulse 1.4s ease-in-out infinite' : ''}">${done ? oi('check', 14, '#fff', 3) : ''}</span>${i < 2 ? `<span style="flex:1;width:2px;background:${i < o.step ? C.RED : C.LINE}"></span>` : ''}</span><span style="display:flex;flex-direction:column;gap:2px;padding-top:2px"><b style="font-size:15px;color:${done ? C.INK : C.MUT}">${t}</b><span style="font-size:13px;color:${C.MUT}">${d}</span></span></li>`; }).join('')}</ol>`)}
    ${coCard(`${coH('What you ordered')}${o.lines.map((l) => `<div style="display:flex;justify-content:space-between;gap:12px;font-size:14px"><span style="white-space:normal">${l.qty} × ${l.name}${l.summary ? `<br><span style="font-size:12.5px;color:${C.MUT}">${l.summary}</span>` : ''}</span><span style="font-variant-numeric:tabular-nums">${money(l.unit * l.qty)}</span></div>`).join('')}<div style="height:1px;background:${C.LINE}"></div>${coRow('Total paid', money(o.q.total), true)}${o.q.earn && S.user ? `<span style="font-size:13px;color:#2E7D4F;font-weight:600">+${o.q.earn} points earned</span>` : ''}`)}
    ${S.user && o.lines[0] && !(S.user.usualItemId === o.lines[0].id && (S.user.usualNote || '').toLowerCase() === (o.lines[0].summary || '').toLowerCase()) ? `<button class="press" id="os-usual" style="min-height:52px;border-radius:999px;border:0;background:${C.TINT};font-size:15px;font-weight:700;color:${C.INK}">Make ${o.lines[0].name} my usual</button>` : ''}
    <p style="margin:0;font-size:12px;color:${C.MUT};text-align:center">Demo: the steps move on their own every few seconds.</p></div>`;
  const u = $('#os-usual'); if (u) u.onclick = () => { const l = o.lines[0], ln = S.order && S.order.lines[0]; S.user.usualItemId = l.id; S.user.usualNote = l.summary; const k = (l.key || '').split('|')[1]; try { const full = JSON.parse(k || '{}'); S.user.usualChoices = { temp: full.temp, milk: full.milk }; } catch {} store.set('user', S.user); toast(`${l.name} is your usual now`); u.remove(); };
}
// a small pill on Home and Order while an order is on its way; tap to follow it
function syncOrderPill() {
  const o = S.order; let p = $('#orderpill');
  if (!o || $('#os') || (o.step >= 2 && +now() - o.placed > 30 * 60000)) { if (p) p.remove(); return; }
  if (!p) { $('#chrome').insertAdjacentHTML('afterbegin', `<button id="orderpill" class="press" style="display:flex;margin:0 12px 10px;width:calc(100% - 24px);min-height:52px;border:0;border-radius:16px;background:${C.SURF};box-shadow:${C.EL2};align-items:center;gap:12px;padding:8px 14px;text-align:left"></button>`); p = $('#orderpill'); p.onclick = openStatus; }
  p.innerHTML = `<span aria-hidden="true" style="width:10px;height:10px;border-radius:5px;background:${o.step >= 2 ? '#2E7D4F' : C.RED};${o.step < 2 ? 'animation:m-pulse 1.4s ease-in-out infinite' : ''}"></span><span style="flex:1;display:flex;flex-direction:column;white-space:normal"><b style="font-size:14px">Order #${o.no} · ${OSTEPS[o.step][0]}</b><span style="font-size:12.5px;color:${C.MUT}">${o.step >= 2 ? 'Ready at the pickup counter' : `Ready around ${fmtT(new Date(o.at))}`}</span></span><span style="transform:rotate(-90deg);display:flex">${oi('chev', 16, C.MUT, 2)}</span>`;
}
// ---------- end checkout ----------
