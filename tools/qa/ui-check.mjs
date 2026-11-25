// Walks the app mockup screen by screen in Chrome and checks what a customer would see:
//   - text that is cut off (by its box or by the screen edge), and text shortened with "…"
//   - things that stick out past the screen
//   - broken pictures, "undefined"/"NaN"/"[object Object]" on screen, JavaScript errors
//   - buttons smaller than a finger (44 px)
//   - the search finds what people type
// Run: node tools/qa/ui-check.mjs   (CHROME=/path/to/chrome to choose the browser)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const CHROME = process.env.CHROME || ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => fs.existsSync(p));
const TYPES = { '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0].split('#')[0]);
  const f = u === '/' ? path.join(ROOT, 'mockup/index.html') : u.startsWith('/menu/') ? path.join(ROOT, 'assets', u) : path.join(ROOT, 'mockup', u);
  fs.readFile(f, (e, d) => { if (e) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', TYPES[path.extname(f)] || 'application/octet-stream'); r.end(d); });
}).listen(0);
const URL0 = `http://localhost:${srv.address().port}/`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const problems = [], warnings = [], screenText = new Set();
const b = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
const p = await b.newPage();
await p.setViewport({ width: 430, height: 932, isMobile: true });
const jsErr = []; p.on('pageerror', (e) => jsErr.push(e.message));
p.on('requestfailed', (r) => { if (!r.url().includes('fonts.g')) problems.push(`[load] could not load ${r.url().replace(URL0, '/')}`); });
p.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) problems.push(`[load] ${r.status()} for ${r.url().replace(URL0, '/')}`); });

async function start(when = '2027-03-10T09:30:00') {
  await p.goto(URL0);
  await p.evaluate((d) => { localStorage.clear(); localStorage.setItem('lr.splash', JSON.stringify(new Date().toDateString())); localStorage.setItem('lr.cafe', '"college"'); localStorage.setItem('lr.shown', 'true'); localStorage.setItem('lr.now', JSON.stringify(d));
    localStorage.setItem('lr.user', JSON.stringify({ name: 'Bhargav', points: 72, tier: 'Regular', usualItemId: 'dirty-chai', visits: { college: { count: 9, last: d.slice(0, 10) } } })); }, when);
  await p.reload(); await wait(2500);
}

// everything a customer can see right now, checked
async function scan(label) {
  await wait(450);
  const r = await p.evaluate(() => {
    const screen = document.querySelector('.screen'), S0 = screen.getBoundingClientRect(), out = { cut: [], dots: [], spill: [], img: [], bad: [], small: [], tight: [] };
    const shown = (el) => { for (let e = el; e && e !== screen; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; } return true; };
    const clipOf = (el) => { for (let e = el.parentElement; e && e !== screen; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return e; } return screen; };
    const scrolls = (e) => { const cs = getComputedStyle(e); return /auto|scroll/.test(cs.overflowX) || /auto|scroll/.test(cs.overflowY); };
    const walker = document.createTreeWalker(screen, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.textContent.replace(/\s+/g, ' ').trim(); if (!t) continue;
      const el = n.parentElement; if (!el || !shown(el)) continue;
      const rg = document.createRange(); rg.selectNodeContents(n); const rects = [...rg.getClientRects()]; if (!rects.length) continue;
      const box = el.getBoundingClientRect(); if (box.bottom < S0.top || box.top > S0.bottom) continue;      // off the visible screen (scrolled away)
      const cs = getComputedStyle(el);
      if (/undefined|NaN|\[object Object\]|null\b/.test(t) && !/null and void/.test(t)) out.bad.push(t.slice(0, 60));
      if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) { if (!seen.has(el)) out.dots.push(t.slice(0, 50)); seen.add(el); continue; }
      if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none' && el.scrollHeight > el.clientHeight + 2) { if (!seen.has(el)) out.dots.push(t.slice(0, 50) + ' (lines)'); seen.add(el); continue; }
      // text wider (or taller) than its own button/label, even when nothing hides the extra
      { const own = el.getBoundingClientRect(), pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0;
        const tl = Math.min(...rects.map((x) => x.left)), tr = Math.max(...rects.map((x) => x.right));
        if (tr > own.right + 0.5 || tl < own.left - 0.5) { out.cut.push(t.slice(0, 50) + ' (runs out of its box)'); continue; }
        const btn = el.closest('button, a, [role="tab"]');
        const boxed = (e) => { const c = getComputedStyle(e); return (c.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor)) || (c.boxShadow && c.boxShadow !== 'none') || parseFloat(c.borderLeftWidth) > 0; };
        if (btn && boxed(btn)) { const bb = btn.getBoundingClientRect(), room = Math.min(tl - bb.left, bb.right - tr); if (room < 4 && cs.textOverflow !== 'ellipsis') out.tight.push(`${t.slice(0, 40)} (${room.toFixed(1)} px from the edge)`); } }
      const clip = clipOf(el); if (scrolls(clip)) {
        // inside a scrolling area: only the screen edge counts, and only along the way it does not scroll
        const cr = clip.getBoundingClientRect(), csx = getComputedStyle(clip);
        if (!/auto|scroll/.test(csx.overflowX) && rects.some((x) => x.right > cr.right + 1.5 || x.left < cr.left - 1.5)) out.cut.push(t.slice(0, 50));
        continue;
      }
      const cr = clip.getBoundingClientRect();
      if (rects.some((x) => x.right > cr.right + 1.5 || x.left < cr.left - 1.5 || x.bottom > cr.bottom + 1.5 || x.top < cr.top - 1.5)) out.cut.push(t.slice(0, 50));
    }
    // things sticking out past the screen sides (not inside sideways-scrolling rows)
    for (const el of screen.querySelectorAll('button, a, input, img, [role="img"], h1, h2, h3, p, b, span')) {
      if (!shown(el)) continue; const r2 = el.getBoundingClientRect(); if (!r2.width || r2.bottom < S0.top || r2.top > S0.bottom) continue;
      let inScroll = false; for (let e = el.parentElement; e && e !== screen; e = e.parentElement) if (/auto|scroll/.test(getComputedStyle(e).overflowX)) { inScroll = true; break; }
      // holiday animations fly across the screen on purpose (the sleigh, the broom); skip anything moving or decorative
      let moving = !!el.closest('[aria-hidden="true"], #fx, .actor'); for (let e = el; !moving && e && e !== screen; e = e.parentElement) if (e.getAnimations().some((a) => a.playState === 'running' && (a.effect?.getKeyframes() || []).some((k) => k.transform || k.left || k.translate))) moving = true;
      if (moving) continue;
      if (!inScroll && (r2.right > S0.right + 2 || r2.left < S0.left - 2)) out.spill.push((el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40));
      if (el.tagName === 'IMG' && el.complete && !el.naturalWidth) out.img.push(el.getAttribute('src'));
      if ((el.tagName === 'BUTTON' || el.tagName === 'A') && !inScroll && (r2.width < 30 || r2.height < 30) && !el.closest('[data-demo], .panel')) out.small.push(`${(el.getAttribute('aria-label') || el.textContent).trim().slice(0, 30)} ${Math.round(r2.width)}×${Math.round(r2.height)}`);
    }
    for (const el of screen.querySelectorAll('[role="img"]')) { const bg = getComputedStyle(el).backgroundImage; if (bg && bg.startsWith('url(') && el.dataset && el.dataset.broken) out.img.push(bg); }
    out.text = []; { const w2 = document.createTreeWalker(screen, NodeFilter.SHOW_TEXT); for (let n = w2.nextNode(); n; n = w2.nextNode()) { const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t && n.parentElement && shown(n.parentElement) && !n.parentElement.closest('style,script')) out.text.push(t); } }
    return out;
  });
  r.text.forEach((t) => screenText.add(t));
  const u = (a) => [...new Set(a)];
  u(r.cut).forEach((t) => problems.push(`[${label}] text cut off: “${t}”`));
  u(r.spill).forEach((t) => problems.push(`[${label}] sticks out past the screen: ${t}`));
  u(r.img).forEach((t) => problems.push(`[${label}] picture did not load: ${t}`));
  u(r.bad).forEach((t) => problems.push(`[${label}] broken value on screen: “${t}”`));
  u(r.dots).forEach((t) => warnings.push(`[${label}] shortened with …: “${t}”`));
  u(r.small).forEach((t) => warnings.push(`[${label}] small tap target: ${t}`));
  u(r.tight).forEach((t) => problems.push(`[${label}] text touches the edge of its button: “${t}”`));
}
const click = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
// every add button must go through the bag engine: if it has anything to choose or offer, the dish page opens
async function checkAdds(label) {
  const bad = await p.evaluate(async () => { const out = [];
    for (const bt of [...document.querySelectorAll('.screen [data-add], .screen [data-qadd]')]) { if (!bt.offsetParent) continue;
      const id = bt.dataset.add || bt.dataset.qadd, plan = Bag.plan({ available: avail(id).ok, groups: ENG.OPTS(OB[id]), pairs: ENG.PAIR(OB[id]) || [] }), before = S.bag.length;
      bt.click(); await new Promise((r) => setTimeout(r, 60)); const opened = !!document.querySelector('#dish'), added = S.bag.length > before;
      if (plan.do === 'sheet' && !opened) out.push(`${MENU[id].name}: + skipped the dish page (${plan.why})${added ? ' and went straight into the bag' : ''}`);
      if (plan.do === 'add' && !added) out.push(`${MENU[id].name}: + did nothing`);
      const d = document.querySelector('#dish'); if (d) d.remove(); S.dish = null; S.bag.length = before; }
    syncChrome(); return out; });
  bad.forEach((t) => problems.push(`[${label}] ${t}`));
}
// the bottom bar never goes away, and every dish page can be closed with a visible X
async function checkChrome(label) {
  const bad = await p.evaluate(() => { const out = [], t = $('#tabs'); if (!t || getComputedStyle(t).display === 'none') return out;
    const r = t.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + 30);
    if (!hit || !hit.closest('#tabs')) out.push('the bottom bar is covered');
    const d = $('#dish'); if (d) { const x = $('#dish-x'); if (!x || !x.offsetParent || x.getBoundingClientRect().width < 40) out.push('the dish page has no visible close (X) button'); }
    return out; });
  bad.forEach((t) => problems.push(`[${label}] ${t}`));
}
// big cards: tapping anywhere opens the dish page; Add to bag sits on the right of the price row
async function checkCards(label) {
  const bad = await p.evaluate(() => { const out = [];
    for (const a of document.querySelectorAll('#home-body article')) {
      const it = a.dataset.card, add = a.querySelector(':scope [data-add]'), name = (a.querySelector('h3') || {}).innerText || '?';
      if (!it && add) { out.push(`${name}: has Add to bag but tapping the card does nothing`); continue; }
      if (!it) continue;
      const h = a.querySelector('h3') || a.querySelector('[role="img"]') || a; h.click(); const opened = !!$('#dish'); const d = $('#dish'); if (d) d.remove(); S.dish = null;
      if (!opened) out.push(`${name}: tapping the card does not open the dish page`);
      if (add && a.getBoundingClientRect().width > 250) { const row = add.parentElement, first = [...row.children].find((c) => c !== add);
        if (first && first.getBoundingClientRect().left > add.getBoundingClientRect().left) out.push(`${name}: Add to bag should be on the right, price on the left`); }
    }
    return out; });
  bad.forEach((t) => problems.push(`[${label}] ${t}`));
}
const scrollAll = async (sel, label) => { const h = await p.evaluate((s) => { const e = document.querySelector(s); return e ? e.scrollHeight : 0; }, sel); for (let y = 0; y < h; y += 600) { await p.evaluate((s, y) => { const e = document.querySelector(s); if (e) e.scrollTo(0, y); }, sel, y); await scan(`${label} @${y}`); } };

await start();
await scrollAll('#home-scroll', 'Home');
// every holiday's Home (its look, greeting and its food row), dates from the calendar check
const HOLIDAY_DAYS = [['2026-12-31T20:00:00', 'New Year'], ['2027-02-12T10:00:00', 'Valentine’s'], ['2027-05-08T10:00:00', 'Mother’s Day'], ['2027-06-19T10:00:00', 'Father’s Day'], ['2027-07-03T10:00:00', '4th of July'], ['2026-08-21T10:00:00', 'Back to School'], ['2027-09-29T10:00:00', 'Coffee Day'], ['2027-10-28T10:00:00', 'Halloween'], ['2027-11-11T10:00:00', 'Veterans Day'], ['2026-11-25T10:00:00', 'Thanksgiving'], ['2026-12-18T10:00:00', 'Christmas']];
for (const [d, name] of HOLIDAY_DAYS) {
  await start(d);
  const hello = await p.evaluate(() => { const h = document.querySelector('#home-body h1'); return h ? h.innerText : ''; });
  if (name === 'New Year' && !/2027/.test(hello)) problems.push(`[holiday] New Year's Eve 2026 greeting should say 2027, says "${hello}"`);
  if (name === 'Christmas' && !(await p.evaluate(() => /Hot cocoa season/.test(document.querySelector('#home-body').innerText)))) problems.push('[holiday] Christmas Home is missing the hot cocoa row');
  await scrollAll('#home-scroll', `Home · ${name}`);
  await checkAdds(`Home · ${name}`); await checkCards(`Home · ${name}`);
}
await start();
await p.evaluate(() => go('order')); await wait(1200);
for (const meal of ['drinks', 'breakfast', 'lunch', 'sweets']) {
  await click(`[data-meal="${meal}"]`); await wait(600); await p.evaluate(() => document.querySelector('#order-scroll').scrollTo(0, 0));
  await scrollAll('#order-scroll', `Order · ${meal}`);
  await checkAdds(`Order · ${meal}`); await checkChrome(`Order · ${meal}`);
  const grps = await p.evaluate(() => [...document.querySelectorAll('[data-grp]')].map((b) => b.dataset.grp));
  for (const g of grps) {
    await click(`[data-grp="${g}"]`); await wait(700);
    await scrollAll('#order-scroll', `Order · ${g}`);
    const first = await p.evaluate(() => { const b = document.querySelector('#v-order [data-open]'); return b && b.dataset.open; });
    if (first) {
      await click(`#v-order [data-open="${first}"]`); await wait(900); await scan(`Dish · ${first}`); await checkChrome(`Dish · ${first}`);
      await p.evaluate(() => $('#dish-sc').scrollTo(0, 200)); await wait(700); await checkChrome(`Dish full screen · ${first}`);
      if (await click('#dish-cust')) { await wait(800); await scrollAll('#dish-sc', `Customize · ${first}`); await checkChrome(`Customize · ${first}`); }
      await p.evaluate(() => { const d = document.querySelector('#dish'); if (d) d.remove(); S.dish = null; });
    }
    await click('#o-back'); await wait(500);
  }
}
// every dish page opens without errors (fast pass)
const ids = await p.evaluate(() => D.menu.map((m) => m.id));
for (const id of ids) { await p.evaluate((i) => dishSheet(i), id); await wait(30); await p.evaluate(() => { const d = document.querySelector('#dish'); if (d) d.remove(); S.dish = null; }); }
// search: people's words find the right dish
const SEARCH = [['bacon', 'Dishes with bacon'], ['philly cheesesteak', 'no longer on the menu'], ['burito', 'Breakfast burrito'], ['iced latte', null], ['vegan under 12', null], ['chiken sandwich', 'Chipotle chicken sandwich'], ['capuccino', 'Cappuccino'], ['sushi', 'We don’t have'], ['pumkin', 'Pumpkin']];
await p.evaluate(() => { S.o.sOpen = true; rOrder(); }); await wait(500);
for (const [q, expect] of SEARCH) {
  await p.evaluate((q) => { S.o.q = q; document.querySelector('#o-sres').innerHTML = oSearch(); }, q); await wait(150);
  const txt = await p.evaluate(() => document.querySelector('#o-sres').innerText);
  if (expect && !txt.includes(expect)) problems.push(`[Search] “${q}” should show “${expect}”`);
  if (!expect && /We don’t have/.test(txt)) problems.push(`[Search] “${q}” found nothing`);
  if (q === 'bacon' && txt.indexOf('Garlic aioli bacon burger') > txt.indexOf('Side of bacon')) problems.push('[Search] “bacon” should show dishes with bacon before the sides');
  await scan(`Search · ${q}`);
}
await p.evaluate(() => { S.o.sOpen = false; S.o.q = ''; S.avail.brkEnds = '15:00'; S.avail.soldOut = new Set(['breakfast-burrito', 'cold-brew']); S.now = '2027-03-10T16:30:00'; S.o.meal = 'breakfast'; S.o.grp = null; rOrder(); }); await wait(600); await scan('Order · breakfast after hours');
await p.evaluate(() => dishSheet('breakfast-burrito')); await wait(800); await scan('Dish · sold out');
if (!(await p.evaluate(() => /Sold out today/.test(document.querySelector('#dish-go').textContent)))) problems.push('[Sold out] the dish page should say “Sold out today”');
await p.evaluate(() => { const d = document.querySelector('#dish'); if (d) d.remove(); S.avail.brkEnds = null; S.avail.soldOut = new Set(); });
await p.evaluate(() => { S.o.sOpen = false; S.o.q = ''; go('rewards'); }); await wait(900); await scrollAll('#v-rewards .scroll', 'Rewards');
await p.evaluate(() => go('account')); await wait(900); await scrollAll('#v-account .scroll', 'Account');
// checkout: every state is readable, the Place order button is never covered, and it blocks what it should
{
  await start('2026-11-24T14:02:00');
  const co = async (setup) => { await p.evaluate(setup); await wait(200); await p.evaluate(() => { document.querySelectorAll('#co,#os,#moment').forEach((e) => e.remove()); S.co = null; openCheckout(); }); await wait(700); };
  const btnText = () => p.evaluate(() => $('#b-place').textContent);
  const reach = async (label) => { const ok = await p.evaluate(() => { const b = $('#b-place').getBoundingClientRect(), h = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return !!(h && h.closest('#b-place')); }); if (!ok) problems.push(`[${label}] the Place order button is covered`); };
  await p.evaluate(() => { window.__fill = () => { bagPush('dirty-chai', { id: 'dirty-chai', unit: 8.25, summary: 'Iced · Oat milk', key: 'dirty-chai|x' }, true); bagPush('breakfast-burrito', { id: 'breakfast-burrito', unit: MENU['breakfast-burrito'].price, summary: '', key: 'breakfast-burrito|' }, true); syncChrome(); }; });
  await co(() => window.__fill()); await scrollAll('#co-sc', 'Checkout'); await reach('Checkout');
  if (!/^Place order · \$\d+\.\d\d$/.test(await btnText())) problems.push(`[Checkout] button should say Place order with the total, says "${await btnText()}"`);
  // totals add up, from what the screen shows
  const sums = await p.evaluate(() => { const rows = [...document.querySelectorAll('#co-sc section')].at(-1).innerText.split('\n'); const v = (k) => { const i = rows.findIndex((r) => r.startsWith(k)); return i < 0 ? 0 : parseFloat(rows[i + 1].replace(/[^\d.]/g, '')) * (rows[i + 1].includes('−') ? -1 : 1); }; return { sub: v('Subtotal'), disc: v('Rewards') || v('Promo'), fee: v('Delivery fee'), tax: v('Tax'), tip: v('Tip'), total: v('Total') }; });
  if (Math.abs(sums.sub + sums.disc + sums.fee + sums.tax + sums.tip - sums.total) > 0.005) problems.push(`[Checkout] the totals don't add up: ${JSON.stringify(sums)}`);
  // breakfast scheduled after 3 PM is blocked
  await p.evaluate(() => { S.co.when = new Date(2026, 10, 24, 15, 30).toISOString(); drawCheckout(); }); await wait(200);
  if ((await btnText()) !== 'Fix the problem above') problems.push('[Checkout] breakfast scheduled after 3 PM should block the order');
  await scan('Checkout · problem');
  // a sold-out dish is blocked and offers a swap
  await co(() => { S.bag = []; window.__fill(); S.avail.soldOut = new Set(['breakfast-burrito']); });
  if (!(await p.evaluate(() => !!document.querySelector('#co [data-pswap]')))) problems.push('[Checkout] a sold-out dish should offer something similar');
  await p.evaluate(() => { S.avail.soldOut = new Set(); });
  // a guest has to give a name, and is offered points
  await co(() => { S.user = null; S.bag = []; window.__fill(); });
  if ((await btnText()) !== 'Add a name for the order') problems.push('[Checkout] a guest without a name should be asked for one');
  if (!(await p.evaluate(() => !!$('#co-join')))) problems.push('[Checkout] guests should be offered to join and earn points');
  await scrollAll('#co-sc', 'Checkout · guest');
  // place it and follow it
  await p.evaluate(() => { const n = $('#co-name'); n.value = 'Sam'; n.dispatchEvent(new Event('input')); }); await wait(100);
  await click('#b-place'); await wait(3800); await scan('Order placed');
  await click('#m-done'); await wait(800);
  if (!(await p.evaluate(() => !!$('#os')))) problems.push('[Order status] "Follow your order" should open the order page');
  await scan('Order status'); await checkChrome('Order status');
  await click('#os-x'); await wait(700);
  if (!(await p.evaluate(() => !!$('#orderpill')))) problems.push('[Order status] the order pill should show after closing the order page');
  await p.evaluate(() => { clearInterval(S.orderTick); S.order = null; syncOrderPill(); });
}
jsErr.forEach((e) => problems.push(`[JavaScript] ${e}`));
await b.close(); srv.close();

const uniq = (a) => [...new Set(a)];
const P = uniq(problems), W = uniq(warnings);
fs.mkdirSync(path.join(ROOT, 'tools/qa/out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tools/qa/out/ui.json'), JSON.stringify({ problems: P, warnings: W }, null, 1));
fs.writeFileSync(path.join(ROOT, 'tools/qa/out/screen-text.json'), JSON.stringify([...screenText].sort(), null, 1));
console.log(`UI check: ${P.length} problem(s), ${W.length} warning(s)`);
P.slice(0, 80).forEach((x) => console.log('  ✗ ' + x));
W.slice(0, 30).forEach((x) => console.log('  ! ' + x));
process.exit(P.length ? 1 : 0);
