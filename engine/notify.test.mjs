// Notification engine tests: node --experimental-strip-types engine/notify.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { candidates, decide, day, isQuiet } from './notifications.ts';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'design-system/tokens/tokens.json'), 'utf8')).themes;
const holidayNames = Object.fromEntries(Object.entries(T.skins).map(([k, v]) => [k, v.name]));
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const me = { name: 'Bhargav', member: true, points: 72, nextRewardAt: 100, usualItem: 'Dirty chai', usualHour: 8, usualWeekdays: [1, 2, 3, 4, 5], optIn: { orders: true, offers: true, holidays: true, news: true } };
const base = { person: me, cafe: { id: 'college', name: 'College Area', readyMin: [10, 12] }, themes: T, holidayNames };
const at = (s) => new Date(s);
t('order ready always goes out, even in quiet hours and over the limits', () => {
  const sent = [{ id: 'x', kind: 'usual_time', at: '2026-11-24T08:00:00' }];
  const out = decide({ ...base, now: at('2026-11-24T22:30:00'), sent, activeOrder: { number: '214', step: 'ready' } });
  assert.deepEqual(out.map((x) => x.kind), ['order_ready']);
  assert.equal(out[0].timeSensitive, true);
});
t('quiet hours: nothing but orders between 9 PM and 7 AM', () => {
  assert.ok(isQuiet(at('2026-11-24T21:00:00')) && isQuiet(at('2026-11-24T06:59:00')) && !isQuiet(at('2026-11-24T07:00:00')));
  assert.equal(decide({ ...base, now: at('2026-12-01T06:00:00'), sent: [] }).length, 0);
});
t('at most one marketing notification a day and three a week', () => {
  const d = day(base, '2026-12-01');
  assert.equal(d.filter((x) => x.category !== 'orders').length, 1);
  let sent = [], total = 0;
  for (const date of ['2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04', '2026-12-05']) { const r = day(base, date, sent); total += r.length; sent = sent.concat(r.map((x) => ({ id: x.id, kind: x.kind, at: new Date(`${date}T${x.at}:00`).toISOString() }))); }
  assert.ok(total <= 3, `sent ${total}`);
});
t('Christmas first day: a holiday notification with the cup dressed for Christmas', () => {
  const d = day({ ...base, person: { ...me, usualItem: undefined, points: 10 } }, '2026-12-01');
  assert.equal(d[0].kind, 'holiday_today'); assert.equal(d[0].cup.kit, 'christmas'); assert.ok(d[0].at >= '09:30' && d[0].at < '19:30');
});
t('the usual: 20 minutes before they usually order, only on their days, not if already ordered', () => {
  const c = { ...base, person: { ...me, points: 10 } };
  assert.equal(decide({ ...c, now: at('2026-10-06T07:45:00'), sent: [] })[0].kind, 'usual_time');
  assert.equal(decide({ ...c, now: at('2026-10-10T07:45:00'), sent: [] }).length, 0); // Saturday
  assert.equal(decide({ ...c, person: { ...c.person, orderedToday: true }, now: at('2026-10-06T07:45:00'), sent: [] }).length, 0);
});
t('lead-up: 3 days and 1 day before a holiday', () => {
  const k = candidates({ ...base, now: at('2027-02-05T10:00:00'), sent: [] }).find((x) => x.kind === 'holiday_soon');
  assert.ok(k && /in 3 days/.test(k.body) && k.cup.kit === 'valentines');
});
t('opt-outs are respected, and Veterans Day wording has no offer', () => {
  const off = { ...base, person: { ...me, optIn: { orders: true } } };
  assert.equal(day(off, '2026-12-01').length, 0);
  const v = candidates({ ...base, now: at('2026-11-11T10:00:00'), sent: [] }).find((x) => x.kind === 'holiday_today');
  assert.ok(v && !/free|off|deal|order/i.test(v.title + v.body));
});
t('Back to School only at College Area', () => {
  const la = candidates({ ...base, cafe: { id: 'lajolla', name: 'La Jolla' }, now: at('2026-08-19T10:00:00'), sent: [] });
  const co = candidates({ ...base, now: at('2026-08-19T10:00:00'), sent: [] });
  assert.ok(co.some((x) => x.cup.kit === 'backtoschool') && !la.some((x) => x.cup.kit === 'backtoschool'));
});
t('the cup never guilt-trips', () => {
  const all = ['2026-08-19', '2026-09-29', '2026-10-24', '2026-12-01', '2027-02-08', '2027-07-01'].flatMap((d) => day({ ...base, person: { ...me, lastOrderAt: '2026-01-01' }, specials: [{ title: 'Cookie butter latte', start: d }] }, d));
  assert.ok(all.length > 0 && all.every((x) => !/miss you|sad|streak|lose|don.t forget|come back/i.test(x.title + x.body)));
});
console.log(`\n${n} notification tests passed`);
