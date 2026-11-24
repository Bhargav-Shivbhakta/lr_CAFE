// node --experimental-strip-types design-system/mascot/engine.test.mjs
import assert from 'node:assert/strict';
import { MOTIONS, HOLIDAY_SET, nextMotion, restMs, react, timeOfDay } from './engine.ts';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const seq = (state, k = 300) => { const r = []; let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); for (let i = 0; i < k; i++) r.push(nextMotion({ ...state, recent: r.slice(-3), random: rnd })); return r; };
t('every motion in every set exists', () => { for (const set of Object.values(HOLIDAY_SET)) for (const m of Object.keys(set)) assert.ok(MOTIONS[m], m); });
t('never the same motion twice in a row', () => { const s = seq({ hour: 14, kit: 'christmas' }); for (let i = 1; i < s.length; i++) assert.notEqual(s[i], s[i - 1]); });
t('at most one big motion in any three', () => { const s = seq({ hour: 14, kit: 'newyear' }); for (let i = 2; i < s.length; i++) assert.ok(s.slice(i - 2, i + 1).filter((m) => MOTIONS[m].energy === 3).length <= 1); });
t('a holiday takes over most of the loop', () => { const s = seq({ hour: 14, kit: 'christmas' }); const share = s.filter((m) => m in HOLIDAY_SET.christmas).length / s.length; assert.ok(share > 0.55, String(share)); });
t('night is quiet: only calm motions, and it dozes', () => { const s = seq({ hour: 23, kit: 'july4' }); assert.ok(s.every((m) => MOTIONS[m].energy === 1) && s.includes('doze')); });
t('Veterans Day stays calm, reactions too', () => { const s = seq({ hour: 12, kit: 'veterans' }); assert.ok(s.every((m) => MOTIONS[m].energy === 1)); assert.equal(react('ordered', 'veterans'), 'proud'); });
t('the cup is never still for long: rests are short by day', () => { for (let i = 0; i < 50; i++) assert.ok(restMs({ hour: 12, kit: null, recent: [] }) <= 3600); assert.equal(timeOfDay(8), 'morning'); });
t('reactions: added to bag, order placed, tapped', () => { assert.equal(react('added', null), 'gotit'); assert.equal(react('ordered', 'christmas'), 'cheer'); assert.equal(react('tapped', null), 'giggle'); });
console.log(`\n${n} mascot tests passed`);
