// Checkout engine tests. Run: node engine/checkout.test.mjs
import fs from 'node:fs';
const Checkout = new Function(fs.readFileSync(new URL('./checkout-engine.js', import.meta.url), 'utf8') + '\nreturn Checkout;')();
const cfg = JSON.parse(fs.readFileSync(new URL('../data/cafe.json', import.meta.url), 'utf8')).checkout;
let n = 0; const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } n++; };
const L = [{ id: 'latte', name: 'Latte', unit: 6.5, qty: 2 }, { id: 'burrito', name: 'Breakfast burrito', unit: 14, qty: 1 }]; // $27.00

let q = Checkout.quote({ lines: L, cfg });
ok(q.subtotal === 27 && q.tax === 2.09 && q.total === 29.09 && q.tip === 0, `plain pickup: 27 + 7.75% tax = 29.09 (got ${q.total})`);
ok(q.earn === 27, 'earns a point per dollar of food');
q = Checkout.quote({ lines: L, cfg, tip: { pct: 0.18 } });
ok(q.tip === 4.86 && q.total === 33.95, `18% tip on $27 = 4.86 (got ${q.tip}, total ${q.total})`);
q = Checkout.quote({ lines: L, cfg, reward: 'r100', points: 120, tip: { pct: 0.2 } });
ok(q.discount === 5 && q.food === 22 && q.tax === 1.71 && q.tip === 5.4, 'reward comes off before tax; tip stays on the full subtotal');
ok(q.earn === 22, 'points earned on what you paid for food');
ok(Checkout.quote({ lines: L, cfg, reward: 'r100', points: 40 }).notes[0].text.includes('60 more points'), 'not enough points says how many more');
ok(Checkout.quote({ lines: L, cfg, promo: 'study10' }).discount === 2.7, 'promo codes ignore case; 10% of 27');
ok(Checkout.quote({ lines: L, cfg, promo: 'WELCOME3' }).notes[0].text.includes('first order'), 'first-order code checks it is your first');
ok(Checkout.quote({ lines: [{ id: 'x', name: 'x', unit: 4, qty: 1 }], cfg, promo: 'WELCOME3', firstOrder: true }).notes[0].text.includes('$6.00 more'), 'minimum spend says how much more');
ok(Checkout.quote({ lines: L, cfg, promo: 'NOPE' }).notes[0].text === 'That code isn’t valid', 'bad code');
q = Checkout.quote({ lines: [{ id: 'c', name: 'c', unit: 4, qty: 1 }], cfg, reward: 'r100', points: 500 });
ok(q.discount === 4 && q.total === 0 && q.tax === 0, 'a reward never makes the total go below zero');
ok(Checkout.quote({ lines: L, cfg, ful: 'delivery' }).fee === cfg.deliveryFee, 'delivery adds the delivery fee');
ok(Checkout.quote({ lines: L, cfg, tip: { amount: -5 } }).tip === 0, 'no negative tips');

const hours = { sun: ['07:00', '22:00'], mon: ['07:00', '22:00'], tue: ['07:00', '22:00'], wed: ['07:00', '22:00'], thu: ['07:00', '22:00'], fri: ['07:00', '22:00'], sat: ['07:00', '22:00'] };
let s = Checkout.slots({ now: new Date(2026, 10, 24, 14, 2), hours, prepMin: 12 });
ok(s[0].time === '14:15' && s[0].day === 0, `first slot after prep, on the quarter hour (got ${s[0].time})`);
ok(s.filter((x) => x.day === 0).at(-1).time === '21:45', 'last slot 15 min before closing');
ok(s.some((x) => x.day === 1 && x.time === '07:15'), 'tomorrow starts after opening plus prep');
s = Checkout.slots({ now: new Date(2026, 10, 24, 21, 50), hours, prepMin: 12 });
ok(s[0].day === 1, 'after the last slot, only tomorrow is offered');

const availAt = (id, at) => (id === 'burrito' && at.getHours() >= 15 ? { ok: false, why: 'time', text: 'Breakfast is served 7 AM – 3 PM' } : { ok: true });
const openAt = (at) => at.getHours() >= 7 && at.getHours() < 22;
ok(Checkout.check({ lines: L, at: new Date(2026, 10, 24, 14, 30), availAt, openAt }).length === 0, 'breakfast at 2:30 PM is fine');
const p = Checkout.check({ lines: L, at: new Date(2026, 10, 24, 15, 30), availAt, openAt });
ok(p.length === 1 && p[0].id === 'burrito' && /earlier time/.test(p[0].fix), 'breakfast scheduled for 3:30 PM is caught, with a fix');
ok(Checkout.check({ lines: L, at: new Date(2026, 10, 24, 23, 0), availAt, openAt })[0].kind === 'closed', 'closed time is caught');
console.log(`${n} checkout engine tests passed`);
