// Bag engine tests: the one door into the bag. Run: node engine/bag.test.mjs
import fs from 'node:fs';
const src = fs.readFileSync(new URL('./bag-engine.js', import.meta.url), 'utf8');
const Bag = new Function(src + '\nreturn Bag;')();
let n = 0; const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } n++; };
const latte = [{ key: 'temp', req: true, def: 'Hot' }, { key: 'milk', req: true, def: 'Whole milk' }];
const eggs = [{ key: 'eggs', req: true }];
ok(Bag.plan({ available: true, groups: latte, pairs: [{ id: 'cookie' }] }).do === 'sheet', 'a latte from Home opens the dish page (customize, goes great with it)');
ok(Bag.plan({ available: true, groups: eggs, pairs: [] }).why === 'choose', 'eggs must be picked first');
ok(Bag.plan({ available: false, groups: [], pairs: [] }).why === 'unavailable', 'sold out or after hours opens the page that says why');
ok(Bag.plan({ available: true, groups: [], pairs: [{ id: 'fries' }] }).do === 'sheet', 'something to pair → offer it');
ok(Bag.plan({ available: true, groups: [], pairs: [] }).do === 'add', 'a plain item with nothing to choose adds straight away');
ok(Bag.plan({ available: true, groups: [{ key: 'x', req: false }], pairs: [{ id: 'y' }], saved: {} }).do === 'add', 'an add-on picked at checkout goes in as is');
const u = Bag.plan({ available: true, groups: latte, pairs: [{ id: 'x' }], saved: { temp: 'Iced', milk: 'Oat milk' } });
ok(u.do === 'add' && u.choices.milk === 'Oat milk', 'Order again repeats the usual exactly');
ok(Bag.plan({ available: false, groups: [], pairs: [], saved: { a: 1 } }).do === 'sheet', 'even the usual is not added when sold out');
ok(Bag.lineKey('latte', { milk: 'Oat milk' }, 'extra hot') === 'latte|{"milk":"Oat milk"}|extra hot', 'one line key shape');
// guard: in the built app, nothing but toBag and the dish page's Add button may put a dish in the bag
const app = fs.readFileSync(new URL('../mockup/index.html', import.meta.url), 'utf8');
const calls = [...app.matchAll(/bagPush\(/g)].length;
ok(calls === 4, `bagPush appears 4 times (definition, toBag, dish page dish + pairings); found ${calls}: something is adding around the bag engine`);
ok(!/quickAdd\(|[^\w.]add\((?:it|b\.dataset|id)\b/.test(app), 'no old direct add calls left');
console.log(`${n} bag engine tests passed`);
