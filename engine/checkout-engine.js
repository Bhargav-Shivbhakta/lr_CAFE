// ---------- the checkout engine ----------
// Pure functions: the app, the server and the tests share them. No screen works out a price, a time or a
// problem with the order by itself; it asks this engine. Money is rounded to the cent at every step.
//
//   Checkout.quote()  → subtotal, rewards and promo discount, delivery fee, tax, tip, total, points earned
//   Checkout.slots()  → the pickup times you can choose (ASAP, then every 15 min until closing, today and tomorrow)
//   Checkout.check()  → what would stop this order going through at that time (sold out, meal over, closed)
//
// Rules:
//   - Discounts come off before tax. Tax is on what you actually pay for (after discounts).
//   - Tip % is worked out on the subtotal before discounts, so a reward never shrinks the barista's tip.
//   - Points are earned on what you pay for the food (after discounts, before tax, fee and tip).
//   - Only one promo code and one reward per order.
const Checkout = (() => {
  const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  const mins = (hm) => +hm.split(':')[0] * 60 + +hm.split(':')[1];
  const pad = (n) => String(n).padStart(2, '0');
  const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  function quote({ lines, cfg, ful = 'pickup', tip = null, reward = null, promo = '', points = 0, firstOrder = false }) {
    const notes = [];
    const subtotal = r2(lines.reduce((s, l) => s + l.unit * l.qty, 0));
    let discount = 0, rewardUsed = null, promoUsed = null;
    if (reward) {
      const rw = cfg.rewards.find((r) => r.id === reward);
      if (!rw) notes.push({ field: 'reward', text: 'That reward isn’t available' });
      else if (points < rw.points) notes.push({ field: 'reward', text: `You need ${rw.points - points} more points for this` });
      else { discount += Math.min(rw.off, subtotal); rewardUsed = rw; }
    }
    const code = (promo || '').trim().toUpperCase();
    if (code) {
      const pr = cfg.promos[code];
      if (!pr) notes.push({ field: 'promo', text: 'That code isn’t valid' });
      else if (pr.firstOrder && !firstOrder) notes.push({ field: 'promo', text: 'That code is for your first order' });
      else if (subtotal < (pr.min || 0)) notes.push({ field: 'promo', text: `Add ${money(pr.min - subtotal)} more to use this code` });
      else { discount += pr.pct ? r2(subtotal * pr.pct) : pr.off; promoUsed = { code, ...pr }; }
    }
    discount = r2(Math.min(discount, subtotal));
    const food = r2(subtotal - discount);
    const fee = ful === 'delivery' ? cfg.deliveryFee : 0;
    const tax = r2(food * cfg.taxRate);
    const tipAmt = !tip ? 0 : tip.pct != null ? r2(subtotal * tip.pct) : r2(Math.max(0, tip.amount || 0));
    const total = r2(food + fee + tax + tipAmt);
    const earn = Math.floor(food * cfg.pointsPerDollar);
    return { subtotal, discount, food, fee, tax, tip: tipAmt, total, earn, reward: rewardUsed, promo: promoUsed, notes };
  }

  // pickup times: the first is "as soon as it's ready"; then every `step` minutes until 15 min before closing
  function slots({ now, hours, prepMin, step = 15, days = 2 }) {
    const out = [];
    for (let d = 0; d < days; d++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      const h = hours[DAYS[day.getDay()]]; if (!h) continue;
      const open = mins(h[0]), last = mins(h[1]) - 15;
      let start = open + prepMin;
      if (d === 0) { const n = now.getHours() * 60 + now.getMinutes() + prepMin; start = Math.max(start, Math.ceil(n / step) * step); }
      start = Math.ceil(start / step) * step;
      for (let m = start; m <= last; m += step) {
        const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(m / 60), m % 60);
        out.push({ at, day: d, time: `${pad(Math.floor(m / 60))}:${pad(m % 60)}` });
      }
    }
    return out;
  }

  // anything that would stop the order at `at`: each problem names the dish and how to fix it
  function check({ lines, at, availAt, openAt }) {
    const problems = [];
    if (!openAt(at)) problems.push({ kind: 'closed', text: 'The café is closed then. Pick another time.' });
    const seen = new Set();
    for (const l of lines) {
      if (seen.has(l.id)) continue; seen.add(l.id);
      const a = availAt(l.id, at);
      if (!a.ok) problems.push({ kind: a.why, id: l.id, text: a.why === 'soldout' ? `${l.name} sold out` : `${l.name}: ${a.text}`, fix: a.why === 'soldout' ? 'Remove it or swap for something similar' : 'Pick an earlier time, or remove it' });
    }
    return problems;
  }

  function money(n) { return '$' + n.toFixed(2); }
  return { quote, slots, check, r2 };
})();
