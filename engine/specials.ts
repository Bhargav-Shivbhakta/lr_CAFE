// The specials engine. The owner picks menu items; everything else is automatic.
// Pure functions, no imports: the app, the owner tool and the tests share this code.
//
// A special is one menu item (or a café-wide promo) shown on Home for a date range.
// Making one takes a single tap: makeSpecial(itemId) fills the week, headline,
// description and photo from the menu. The owner can change any of it, or nothing.

export interface MenuItem { id: string; cat: string; name: string; desc: string; price: number; flags: string[] }

export type Deal =
  | { type: 'points'; times: 2 | 3 }          // double or triple House Key points
  | { type: 'amountOff'; dollars: number }     // e.g. $1 off
  | { type: 'percentOff'; percent: number };   // e.g. 10% off

export interface Special {
  id: string;
  /** The menu item. Leave out for a café-wide promo (e.g. "Double points on everything"). */
  itemId?: string;
  start: string;   // YYYY-MM-DD, inclusive
  end: string;     // YYYY-MM-DD, inclusive
  /** Optional: written by the owner. When empty the engine writes it. */
  headline?: string;
  blurb?: string;
  deal?: Deal;
  /** Empty or missing = every location. */
  locations?: string[];
  /** Pinned specials go first in the carousel. */
  pinned?: boolean;
  createdAt?: string;
}

export const LIMITS = { headline: 40, blurb: 110, heroCards: 5, maxWeeks: 8 } as const;

// ---------- dates ----------
const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Monday to Sunday around a date. A "special this week" ends on Sunday. */
export function weekOf(date: Date, offsetWeeks = 0) {
  const mon = addDays(date, -((date.getDay() + 6) % 7) + offsetWeeks * 7);
  return { start: ymd(mon), end: ymd(addDays(mon, 6)) };
}

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const friendlyDate = (s: string) => { const d = parse(s); return `${DAY[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`; };

// ---------- creating ----------
let counter = 0;
const newId = () => `sp_${Date.now().toString(36)}_${(counter++).toString(36)}`;

/** One tap: make any menu item a special. Defaults to this week, Monday to Sunday. */
export function makeSpecial(itemId: string | undefined, today: Date, opts: Partial<Special> & { week?: 'this' | 'next' } = {}): Special {
  const { week = 'this', ...rest } = opts;
  const w = weekOf(today, week === 'next' ? 1 : 0);
  // A special made mid-week starts today, not on a Monday already gone.
  const start = week === 'this' && ymd(today) > w.start ? ymd(today) : w.start;
  return { id: newId(), itemId, start, end: w.end, createdAt: new Date().toISOString(), ...rest };
}

export function makePromo(headline: string, blurb: string, deal: Deal, today: Date, week: 'this' | 'next' = 'this'): Special {
  return makeSpecial(undefined, today, { headline, blurb, deal, week });
}

// ---------- checking ----------
export function validate(s: Special, menu: MenuItem[]): string[] {
  const e: string[] = [];
  if (s.itemId && !menu.some((m) => m.id === s.itemId)) e.push('That item is no longer on the menu.');
  if (!s.itemId && !s.headline) e.push('A café-wide promo needs a headline.');
  if (!/^\d{4}-\d\d-\d\d$/.test(s.start) || !/^\d{4}-\d\d-\d\d$/.test(s.end)) e.push('Dates must be real dates.');
  else if (s.end < s.start) e.push('The end date is before the start date.');
  else if ((parse(s.end).getTime() - parse(s.start).getTime()) / 864e5 > LIMITS.maxWeeks * 7) e.push(`A special can run at most ${LIMITS.maxWeeks} weeks.`);
  if (s.headline && s.headline.length > LIMITS.headline) e.push(`Headline is ${s.headline.length} characters; keep it to ${LIMITS.headline}.`);
  if (s.blurb && s.blurb.length > LIMITS.blurb) e.push(`Description is ${s.blurb.length} characters; keep it to ${LIMITS.blurb}.`);
  if (s.deal?.type === 'amountOff' && !(s.deal.dollars > 0 && s.deal.dollars < 10)) e.push('Amount off must be between $0.01 and $9.99.');
  if (s.deal?.type === 'percentOff' && !(s.deal.percent > 0 && s.deal.percent <= 50)) e.push('Percent off must be 1 to 50.');
  if (/!!|[A-Z]{6,}/.test(`${s.headline ?? ''} ${s.blurb ?? ''}`)) e.push('Keep the tone calm: no "!!" and no all-caps words.');
  return e;
}

// ---------- showing ----------
export function isActive(s: Special, date: Date, location?: string) {
  const d = ymd(date);
  return s.start <= d && d <= s.end && (!location || !s.locations?.length || s.locations.includes(location));
}

export function dealLabel(d?: Deal) {
  if (!d) return null;
  if (d.type === 'points') return d.times === 2 ? 'Double points' : 'Triple points';
  if (d.type === 'amountOff') return `$${d.dollars.toFixed(2).replace(/\.00$/, '')} off`;
  return `${d.percent}% off`;
}
const money = (n: number) => `$${n.toFixed(2)}`;

export interface Card {
  specialId: string | null; itemId: string | null;
  eyebrow: string; title: string; text: string; meta: string; cta: string;
  photo: string | null; auto: boolean;
}

/** The Home card for a special. `occasion` is the calendar's holiday name, if any. */
export function cardFor(s: Special, menu: MenuItem[], date: Date, occasion?: string | null): Card {
  const item = s.itemId ? menu.find((m) => m.id === s.itemId) : undefined;
  const deal = dealLabel(s.deal);
  const lastDay = s.end === ymd(date);
  const eyebrow = [occasion ? `${occasion} special` : item ? "This week's special" : 'At the café', deal].filter(Boolean).join(' · ');
  const meta = lastDay ? 'Last day today' : `Through ${friendlyDate(s.end)}`;
  return {
    specialId: s.id, itemId: item?.id ?? null,
    eyebrow, title: s.headline || item?.name || '', text: s.blurb || item?.desc || '',
    meta: item && !deal ? `${money(item.price)} · ${meta}` : meta,
    cta: item ? 'Order now' : 'See the menu', photo: item ? `/photos/${item.id}/hero.webp` : null, auto: false,
  };
}

/** Sort: pinned, then deals, then item specials ending soonest. */
export function rank(list: Special[]) {
  return [...list].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || Number(!!b.deal) - Number(!!a.deal) || a.end.localeCompare(b.end));
}

/** When the owner has picked nothing, Home is never empty: seasonal, then new, then popular items. */
export function autoPicks(menu: MenuItem[], season: string, n = 3): MenuItem[] {
  const seasonal = menu.filter((m) => m.cat === (season === 'autumn' ? 'fall' : season));
  const fresh = menu.filter((m) => m.flags.includes('n'));
  const popular = menu.filter((m) => m.flags.includes('p'));
  const seen = new Set<string>();
  return [...seasonal, ...fresh, ...popular].filter((m) => !seen.has(m.id) && seen.add(m.id)).slice(0, n);
}

export function autoCard(item: MenuItem, occasion?: string | null): Card {
  return { specialId: null, itemId: item.id, eyebrow: occasion ? `${occasion} pick` : item.flags.includes('n') ? 'New on the menu' : 'A café favorite', title: item.name, text: item.desc, meta: money(item.price), cta: 'Order now', photo: `/photos/${item.id}/hero.webp`, auto: true };
}
