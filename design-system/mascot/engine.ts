// The cup's animation engine.
// One place that knows every motion the cup can do, and a director that decides what it does next.
// Pure functions (no DOM), so the app, the mockup and the tests share it. The app's driver applies
// the chosen motion's CSS class to the cup and plays its stage effect.
//
// Rules (RULES.md §10):
// - The cup has its own stage on Home and is never frozen: it always breathes and blinks, and every
//   few seconds does something small. Big moves are rare, so it stays calm, not hyperactive.
// - It never repeats the same motion twice in a row, and at most 1 in 3 motions is "big".
// - At night (9 PM to 7 AM) it only does quiet things and dozes off.
// - On a holiday it dresses for it and the holiday's motions take over most of the loop.
// - Veterans Day: calm only. Reduce Motion: a still pose, no loop.
// - Events (added to bag, order placed, tapped) jump the queue with a reaction.

export type Energy = 1 | 2 | 3; // 1 quiet, 2 lively, 3 big
export interface Motion {
  cls: string;        // CSS class on the cup (pip.css / motion.css)
  ms: number;         // how long it lasts
  energy: Energy;
  fx?: string;        // optional stage effect: 'hearts' | 'snow' | 'leaves' | 'confetti' | 'sparks' | 'beans' | 'petals' | 'steam' | 'zzz' | 'bats' | 'stars'
  say?: string;       // what a screen reader hears, if anything
}

/** Every motion the cup can do. */
export const MOTIONS: Record<string, Motion> = {
  // always on, underneath everything
  idle: { cls: 'pip--idle', ms: 3000, energy: 1 },
  // quiet
  look: { cls: 'pip--search', ms: 2400, energy: 1 },
  breathe: { cls: 'pip--idle', ms: 3200, energy: 1, fx: 'steam' },
  peek: { cls: 'pip--peek', ms: 4000, energy: 1 },
  stretch: { cls: 'pip--stretch', ms: 3600, energy: 1 },
  doze: { cls: 'pip--sleep', ms: 6400, energy: 1, fx: 'zzz' },
  // lively
  wave: { cls: 'pip--wave', ms: 1600, energy: 2 },
  squish: { cls: 'pip--squish', ms: 1800, energy: 2 },
  hop: { cls: 'pip--hop', ms: 1600, energy: 2 },
  love: { cls: 'pip--love', ms: 2400, energy: 2, fx: 'hearts' },
  sneeze: { cls: 'pip--sneeze', ms: 3600, energy: 2 },
  shiver: { cls: 'pip--shiver', ms: 1200, energy: 2, fx: 'snow' },
  oops: { cls: 'pip--oops', ms: 2600, energy: 2 },
  // big
  dance: { cls: 'pip--dance', ms: 2000, energy: 3 },
  twirl: { cls: 'pip--twirl', ms: 2600, energy: 3 },
  // holiday moves (outfit comes from the holiday kit)
  jingle: { cls: 'pip--dance', ms: 2000, energy: 2, fx: 'snow' },
  snowfall: { cls: 'pip--idle', ms: 3200, energy: 1, fx: 'snow' },
  heartbeat: { cls: 'pip--love', ms: 2400, energy: 2, fx: 'hearts' },
  leafswirl: { cls: 'pip--twirl', ms: 2600, energy: 2, fx: 'leaves' },
  cozy: { cls: 'pip--idle', ms: 3200, energy: 1, fx: 'leaves' },
  pop: { cls: 'pip--hop', ms: 1600, energy: 3, fx: 'confetti' },
  sparkle: { cls: 'pip--wave', ms: 1600, energy: 2, fx: 'sparks' },
  fireworks: { cls: 'pip--hop', ms: 1600, energy: 3, fx: 'stars' },
  spooky: { cls: 'pip--peek', ms: 4000, energy: 2, fx: 'bats' },
  juggle: { cls: 'pip--squish', ms: 1800, energy: 2, fx: 'beans' },
  bloom: { cls: 'pip--love', ms: 2400, energy: 2, fx: 'petals' },
  proud: { cls: 'pip--wave', ms: 1600, energy: 1 },
  study: { cls: 'pip--search', ms: 2400, energy: 1, fx: 'stars' },
  // reactions to what the person does
  cheer: { cls: 'pip--dance', ms: 2000, energy: 3, fx: 'sparks', say: 'The cup cheers' },
  gotit: { cls: 'pip--hop', ms: 1600, energy: 2, fx: 'sparks' },
  giggle: { cls: 'pip--squish', ms: 1800, energy: 2 },
};

// what the cup tends to do, by time of day (weights)
const BY_TIME: Record<'morning' | 'day' | 'evening' | 'night', Record<string, number>> = {
  morning: { breathe: 3, wave: 2, sneeze: 1, peek: 1 },
  day: { breathe: 2, wave: 2, squish: 2, hop: 2, peek: 1, love: 1, dance: 1, twirl: 1 },
  evening: { breathe: 3, love: 2, wave: 1, squish: 1, peek: 1 },
  night: { breathe: 3, doze: 4 },
};
// holiday sets take most of the loop (weights added on top)
export const HOLIDAY_SET: Record<string, Record<string, number>> = {
  christmas: { jingle: 4, snowfall: 4, shiver: 2, wave: 1 },
  valentines: { heartbeat: 5, love: 2, wave: 1 },
  thanksgiving: { leafswirl: 3, cozy: 4, wave: 1 },
  newyear: { pop: 3, dance: 2, sparkle: 3 },
  july4: { fireworks: 3, sparkle: 4, wave: 1 },
  halloween: { spooky: 5, peek: 2, shiver: 1 },
  coffeeday: { juggle: 4, breathe: 3, dance: 1 },
  mothersday: { bloom: 5, love: 2 },
  fathersday: { proud: 4, wave: 2 },
  backtoschool: { study: 4, look: 2, hop: 1 },
  veterans: { proud: 3, breathe: 4 },
};
export const CALM_ONLY = new Set(['veterans']);
export const REACTIONS: Record<string, string> = { added: 'gotit', ordered: 'cheer', tapped: 'giggle', refreshed: 'twirl' };

export const timeOfDay = (h: number) => (h >= 21 || h < 7 ? 'night' : h < 11 ? 'morning' : h < 17 ? 'day' : 'evening');

export interface DirectorState { hour: number; kit: string | null; recent: string[]; random?: () => number }

/** Pick the next motion. Never the same twice in a row; at most one big motion in any three. */
export function nextMotion(s: DirectorState): string {
  const rnd = s.random || Math.random;
  const tod = timeOfDay(s.hour), w: Record<string, number> = { ...BY_TIME[tod] };
  if (s.kit && HOLIDAY_SET[s.kit] && tod !== 'night') for (const [k, v] of Object.entries(HOLIDAY_SET[s.kit])) w[k] = (w[k] || 0) + v * 2;
  const last = s.recent[s.recent.length - 1], bigRecently = s.recent.slice(-2).some((m) => MOTIONS[m]?.energy === 3);
  const allowed = Object.entries(w).filter(([m]) => {
    const mo = MOTIONS[m]; if (!mo || m === last) return false;
    if (s.kit && CALM_ONLY.has(s.kit) && mo.energy > 1) return false;
    if (tod === 'night' && mo.energy > 1) return false;
    if (bigRecently && mo.energy === 3) return false;
    return true;
  });
  const total = allowed.reduce((a, [, v]) => a + v, 0); let r = rnd() * total;
  for (const [m, v] of allowed) { r -= v; if (r <= 0) return m; }
  return allowed.length ? allowed[0][0] : 'breathe';
}

/** Rest between motions (the cup keeps breathing and blinking while it rests). */
export const restMs = (s: DirectorState) => { const r = (s.random || Math.random)(); const tod = timeOfDay(s.hour); return Math.round((tod === 'night' ? 4000 : 1400) + r * (tod === 'night' ? 3000 : 2200)); };

/** A reaction to something the person did, or null. */
export const react = (event: string, kit: string | null) => { const m = REACTIONS[event]; if (!m) return null; return kit && CALM_ONLY.has(kit) && MOTIONS[m].energy > 1 ? 'proud' : m; };

// ---------- stories: one cup, always ----------
// There is only ever ONE cup on screen. It lives in its stage on Home. A story takes it out of the stage
// and brings it back: every story starts and ends at 'stage'. Other places never draw a second cup while
// the stage is on screen; full-screen moments (tips, photo loading, order placed) borrow the cup and the
// stage stays empty until it returns.
export type Beat = { at: 'stage' | 'top-right' | 'top-left' | 'off-right' | 'off-left' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'loop'; ms: number; do?: string; prop?: string; fx?: string };
export const STORIES: Record<string, { name: string; travels: boolean; beats: Beat[] }> = {
  arrival: { name: 'Peek and wave', travels: false, beats: [{ at: 'stage', ms: 1200, do: 'peek' }, { at: 'stage', ms: 1600, do: 'wave' }] },
  christmas: { name: 'The sleigh', travels: true, beats: [{ at: 'stage', ms: 300, do: 'hop' }, { at: 'off-right', ms: 700 }, { at: 'off-left', ms: 5200, prop: 'sleigh', fx: 'sparks' }, { at: 'stage', ms: 900, do: 'squish' }] },
  valentines: { name: 'The heart balloon', travels: true, beats: [{ at: 'stage', ms: 300, do: 'hop' }, { at: 'loop', ms: 5200, prop: 'wings+balloon', fx: 'hearts' }, { at: 'stage', ms: 800, do: 'squish' }] },
  thanksgiving: { name: 'The pie parade', travels: true, beats: [{ at: 'stage', ms: 300, do: 'hop' }, { at: 'off-right', ms: 600 }, { at: 'top-center', ms: 1800, do: 'walks in with the pie', prop: 'pie', fx: 'leaves' }, { at: 'top-center', ms: 1300, do: 'lifts the pie up; steam and a burst of leaves' }, { at: 'off-left', ms: 1700, prop: 'pie', fx: 'leaves' }, { at: 'stage', ms: 900, do: 'squish' }] },
  newyear: { name: 'Countdown and popper', travels: true, beats: [{ at: 'stage', ms: 300, do: 'hop' }, { at: 'center', ms: 800, prop: 'party hat' }, { at: 'center', ms: 2700, do: 'countdown', fx: 'confetti' }, { at: 'stage', ms: 900, do: 'squish' }] },
  july4: { name: 'Sparkler and fireworks', travels: true, beats: [{ at: 'stage', ms: 300, do: 'hop' }, { at: 'bottom-center', ms: 900, prop: 'sparkler' }, { at: 'bottom-center', ms: 3000, fx: 'stars' }, { at: 'stage', ms: 900, do: 'squish' }] },
  halloween: { name: 'Broom across the moon', travels: true, beats: [{ at: 'stage', ms: 300, do: 'hop' }, { at: 'off-right', ms: 600 }, { at: 'off-left', ms: 4600, prop: 'broom', fx: 'bats' }, { at: 'stage', ms: 900, do: 'squish' }] },
  coffeeday: { name: 'Bean juggling', travels: true, beats: [{ at: 'stage', ms: 300, do: 'hop' }, { at: 'bottom-center', ms: 800 }, { at: 'bottom-center', ms: 3000, prop: 'beans', fx: 'beans' }, { at: 'stage', ms: 900, do: 'squish' }] },
  mothersday: { name: 'A bouquet', travels: true, beats: [{ at: 'stage', ms: 300, do: 'hop' }, { at: 'bottom-right', ms: 800 }, { at: 'bottom-left', ms: 2600, prop: 'bouquet', fx: 'petals' }, { at: 'stage', ms: 1000, do: 'squish' }] },
  fathersday: { name: 'Tie and thumbs-up', travels: false, beats: [{ at: 'stage', ms: 3600, do: 'thumb', prop: 'tie' }] },
  backtoschool: { name: 'Late for class', travels: true, beats: [{ at: 'stage', ms: 300, do: 'hop' }, { at: 'bottom-right', ms: 700 }, { at: 'off-left', ms: 2400, prop: 'backpack' }, { at: 'stage', ms: 900, do: 'squish' }] },
  veterans: { name: 'A quiet flag', travels: false, beats: [{ at: 'stage', ms: 4200, do: 'proud', prop: 'flag' }] },
};
export const storyFor = (kit: string | null) => (kit && STORIES[kit]) || null;
export const storyLength = (id: string) => STORIES[id].beats.reduce((a, b) => a + b.ms, 0);

// ---------- everyday library (approved Nov 2026) ----------
// On a normal day (no holiday) Home runs this library instead of the holiday loop. Every move is one
// clear idea in 2-3 steps, with props big enough to read. Approved: the 19 below. Dropped: looks
// around, head tilt, smells the coffee, stretch.
export type Layer = 'always' | 'fidget' | 'moment' | 'big' | 'day' | 'app' | 'touch';
export const EVERYDAY: Record<string, { name: string; layer: Layer; ms: number; steps: string[] }> = {
  breathe: { name: 'Breathe and blink', layer: 'always', ms: 0, steps: ['Breathes slowly', 'Blinks', 'Eyes drift'] },
  steam: { name: 'Steam curl', layer: 'always', ms: 0, steps: ['Steam puffs rise from the top'] },
  glance: { name: 'Glances at you', layer: 'fidget', ms: 1700, steps: ['Leans in', 'Winks at you'] },
  yawn: { name: 'Yawn', layer: 'fidget', ms: 1800, steps: ['Arms up', 'Big yawn'] },
  latte: { name: 'Latte art', layer: 'moment', ms: 4300, steps: ['Stirs with a spoon', 'A heart appears in the foam', 'Smiles'] },
  pour: { name: 'Barista pour', layer: 'moment', ms: 4300, steps: ['A milk pitcher pours in', 'A heart appears', 'Smiles'] },
  paper: { name: 'Morning paper', layer: 'moment', ms: 4500, steps: ['Reads the LR Daily', 'Lowers it', 'Winks'] },
  special: { name: "Today's special", layer: 'moment', ms: 5600, steps: ["Walks in with today's special", 'Shows it to you', 'Walks off'] },
  music: { name: 'Headphones', layer: 'moment', ms: 3600, steps: ['Headphones on', 'Sways to the music'] },
  dance: { name: 'Little shuffle dance', layer: 'big', ms: 3000, steps: ['Arms up', 'Little happy dance'] },
  twirl: { name: 'Twirl', layer: 'big', ms: 2600, steps: ['Spins once', 'Sparkle'] },
  open: { name: 'Opening up', layer: 'day', ms: 3300, steps: ['Holds CLOSED', 'Flips the sign', 'OPEN'] },
  night: { name: 'Closed for the night', layer: 'day', ms: 5400, steps: ['Holds BACK AT 7', 'Falls asleep'] },
  usual: { name: 'Your usual', layer: 'app', ms: 3100, steps: ['Holds up a card with your usual drink'] },
  reward: { name: 'One drink from a reward', layer: 'app', ms: 3000, steps: ['4 gold stars over its head', 'The 5th one blinks'] },
  brew: { name: 'Making your order', layer: 'app', ms: 4300, steps: ['Steam while your order is made', 'Rings a bell: ready!'] },
  welcome: { name: 'Welcome back', layer: 'app', ms: 1800, steps: ['Big wave', 'Welcome back'] },
  giggle: { name: 'Tap: giggle', layer: 'touch', ms: 1800, steps: ['You tap it', 'It giggles'] },
  love: { name: 'Press and hold: love', layer: 'touch', ms: 2400, steps: ['You press and hold', 'Heart eyes'] },
};
const DAY_POOLS: Record<'morning' | 'day' | 'evening', { fidget: string[]; moment: string[]; big: string[] }> = {
  morning: { fidget: ['glance', 'yawn'], moment: ['paper', 'latte', 'pour'], big: [] },
  day: { fidget: ['glance'], moment: ['special', 'pour', 'music', 'latte'], big: ['dance', 'twirl'] },
  evening: { fidget: ['glance', 'yawn'], moment: ['latte', 'pour', 'music'], big: [] },
};
export interface EverydayState { hour: number; turn: number; closed: boolean; hasUsual: boolean; nearReward: boolean; recent: string[]; random?: () => number }
/** What the cup does next on a normal day. Every 4th turn is a café moment (one in three of those is
 *  about you: your usual or your reward); a big move at most once every 12 turns, afternoons only; the
 *  rest are fidgets. After closing it only does 'night'. Never repeats within the last three. */
export function nextEveryday(s: EverydayState): string {
  if (s.closed) return 'night';
  const rnd = s.random || Math.random, tod = timeOfDay(s.hour), P = DAY_POOLS[tod === 'night' ? 'evening' : tod];
  const pick = (a: string[]) => { const c = a.filter((x) => !s.recent.slice(-3).includes(x)); const from = c.length ? c : a; return from[Math.floor(rnd() * from.length)]; };
  if (s.turn % 12 === 0 && P.big.length) return pick(P.big);
  if (s.turn % 4 === 0) {
    const mine = [s.hasUsual && tod !== 'evening' ? 'usual' : '', s.nearReward ? 'reward' : ''].filter(Boolean);
    if (mine.length && s.turn % 12 === 4) return pick(mine);
    return pick(P.moment);
  }
  return pick(P.fidget);
}
/** Events: tap -> giggle, press and hold -> love, order placed -> brew, back after 3+ days -> welcome, first open before 7:30 -> open. */
export const EVERYDAY_EVENTS: Record<string, string> = { tapped: 'giggle', held: 'love', ordered: 'brew', returning: 'welcome', opening: 'open' };
