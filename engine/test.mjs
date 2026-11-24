// Tests for the specials engine and the Home composer.  npm run test:engine
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = await import(join(ROOT, 'engine/specials.ts'));
const { composeHome } = await import(join(ROOT, 'engine/home.ts'));
const menu = JSON.parse(readFileSync(join(ROOT, 'data/menu.json'), 'utf8')).items;
const T = JSON.parse(readFileSync(join(ROOT, 'design-system/tokens/tokens.json'), 'utf8')).themes;
const skinNames = Object.fromEntries(Object.entries(T.skins).map(([k, v]) => [k, v.name]));
const at = (s, h = 18) => new Date(`${s}T${String(h).padStart(2, '0')}:00:00`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };

t('a special made on a Wednesday runs from today to Sunday', () => {
  const s = S.makeSpecial('pumpkin-chai', at('2026-11-25'));
  assert.equal(s.start, '2026-11-25'); assert.equal(s.end, '2026-11-29');
});
t('"next week" runs Monday to Sunday', () => {
  const s = S.makeSpecial('pumpkin-chai', at('2026-11-25'), { week: 'next' });
  assert.deepEqual([s.start, s.end], ['2026-11-30', '2026-12-06']);
});
t('validation catches the owner-facing mistakes', () => {
  const bad = { id: 'x', itemId: 'nope', start: '2026-12-10', end: '2026-12-01', headline: 'A'.repeat(41), deal: { type: 'percentOff', percent: 80 } };
  const e = S.validate(bad, menu);
  assert.ok(e.some((m) => m.includes('no longer on the menu')));
  assert.ok(e.some((m) => m.includes('before the start')));
  assert.ok(e.some((m) => m.includes('keep it to 40')));
  assert.ok(e.some((m) => m.includes('1 to 50')));
  assert.ok(S.validate({ id: 'y', itemId: 'chai', start: '2026-11-23', end: '2026-11-29', headline: 'BEST CHAI EVER!!' }, menu).some((m) => m.includes('calm')));
  assert.deepEqual(S.validate(S.makeSpecial('chai', at('2026-11-23')), menu), []);
});
t('card text comes from the menu when the owner writes nothing', () => {
  const s = S.makeSpecial('pumpkin-chai', at('2026-11-23'));
  const c = S.cardFor(s, menu, at('2026-11-23'), 'Thanksgiving week');
  assert.equal(c.title, 'Pumpkin chai latte'); assert.equal(c.eyebrow, 'Thanksgiving week special');
  assert.equal(c.meta, '$7.25 · Through Sun, Nov 29'); assert.ok(c.text.length > 0);
});
t('a deal shows in the eyebrow, and the last day says so', () => {
  const s = S.makeSpecial('chai', at('2026-11-23'), { deal: { type: 'points', times: 2 } });
  const c = S.cardFor(s, menu, at('2026-11-29'));
  assert.equal(c.eyebrow, "This week's special · Double points"); assert.equal(c.meta, 'Last day today');
});
t('expired and future specials do not show', () => {
  const past = { id: 'a', itemId: 'chai', start: '2026-11-01', end: '2026-11-08' };
  const future = { id: 'b', itemId: 'chai', start: '2026-12-01', end: '2026-12-07' };
  assert.equal(S.isActive(past, at('2026-11-23')), false); assert.equal(S.isActive(future, at('2026-11-23')), false);
});
t('location-only specials show only at that café', () => {
  const s = { id: 'c', itemId: 'chai', start: '2026-11-23', end: '2026-11-29', locations: ['lajolla'] };
  assert.equal(S.isActive(s, at('2026-11-24'), 'college'), false); assert.equal(S.isActive(s, at('2026-11-24'), 'lajolla'), true);
});
t('pinned first, then deals, then ending soonest', () => {
  const r = S.rank([{ id: '1', end: '2026-11-29' }, { id: '2', end: '2026-11-27' }, { id: '3', end: '2026-12-01', deal: { type: 'points', times: 2 } }, { id: '4', end: '2026-12-05', pinned: true }]);
  assert.deepEqual(r.map((x) => x.id), ['4', '3', '2', '1']);
});
const base = { menu, themes: T, skinNames, location: 'college', specials: [] };
t('Home is never empty: with no specials it auto-picks seasonal items', () => {
  const h = composeHome({ ...base, now: at('2026-11-10'), user: null });
  const hero = h.sections.find((s) => s.type === 'hero');
  assert.ok(hero.cards.length >= 1 && hero.cards.every((c) => c.auto));
  assert.ok(hero.cards.some((c) => menu.find((m) => m.id === c.itemId).cat === 'fall'));
});
t('owner specials replace the automatic picks, max 5 in the carousel, the rest in the feed', () => {
  const ids = ['pumpkin-chai', 'cookie-butter-latte', 'psl', 'chai', 'dirty-chai', 'matcha', 'mocha-frappe'];
  const specials = ids.map((id) => S.makeSpecial(id, at('2026-11-23')));
  const h = composeHome({ ...base, specials, now: at('2026-11-24'), user: { name: 'Bhargav', points: 72, tier: 'Regular' } });
  assert.equal(h.sections.find((s) => s.type === 'hero').cards.length, 5);
  assert.equal(h.sections.find((s) => s.type === 'feed').cards.length, 2);
  assert.equal(h.skin, 'thanksgiving');
});
t('section order: greeting, tracker, countdown, join, hero, usual, popular', () => {
  const g = composeHome({ ...base, now: at('2027-01-30', 9), user: null, activeOrder: { number: '214', step: 1, readyInMin: 6 } });
  assert.deepEqual(g.sections.map((s) => s.type).slice(0, 5), ['greeting', 'tracker', 'countdown', 'join', 'hero']);
  assert.equal(g.sections[0].hello, 'Good morning');
  const m = composeHome({ ...base, now: at('2026-11-24'), user: { name: 'B', points: 1, tier: 'Guest', usualItemId: 'dirty-chai' } });
  assert.deepEqual(m.sections.map((s) => s.type), ['greeting', 'hero', 'usual', 'popular']);
});
t('popular never repeats an item already in specials or the usual', () => {
  const specials = [S.makeSpecial('breakfast-burrito', at('2026-11-23'))];
  const h = composeHome({ ...base, specials, now: at('2026-11-24'), user: { name: 'B', points: 1, tier: 'Guest', usualItemId: 'breakfast-croissant' } });
  const pop = h.sections.find((s) => s.type === 'popular').itemIds;
  assert.ok(!pop.includes('breakfast-burrito') && !pop.includes('breakfast-croissant'));
});
console.log(`\n${n} engine tests passed`);
