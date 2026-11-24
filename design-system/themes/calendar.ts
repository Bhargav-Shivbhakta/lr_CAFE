// Seasonal and holiday theme calendar.
// Pure functions, no imports, so the app AND the Node checker run the same code.
// All dates and rules live in tokens.json → themes. Never hard-code a date here.

export type Rule =
  | { type: 'fixed'; start: string; end: string }
  | { type: 'table'; dates: Record<string, string>; before: number; after: number }
  | { type: 'easter'; before: number; after: number }
  | { type: 'nthWeekday'; month: number; weekday: number; n: number; before: number; after: number };

export interface Holiday { id: string; enabled: boolean; priority: number; runway: number; rule: Rule; note?: string; /** only these cafés; absent = every café */ locations?: string[] }
export interface ThemeConfig { seasons: Record<string, number[]>; holidays: Holiday[] }
export type Phase = 'season' | 'runway' | 'main';
export interface ActiveTheme {
  /** The skin to put on <html data-skin>. During a runway this is still the season. */
  skin: string;
  season: string;
  phase: Phase;
  /** The holiday in its main window, or the one being counted down to in a runway. */
  holiday: string | null;
  /** Days until the main window starts (runway only), e.g. 5 → "starts in 5 days". */
  daysUntil: number | null;
  /** Days left in the main window, counting today (main only). */
  daysLeft: number | null;
}

const DAY = 86_400_000;
const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
const dayOf = (date: Date) => utc(date.getFullYear(), date.getMonth() + 1, date.getDate());
const md = (s: string) => s.split('-').map(Number) as [number, number];

/** Easter Sunday (Gregorian), Anonymous Gregorian algorithm. */
export function easter(y: number): number {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(y, month, day);
}

/** The n-th weekday (0 = Sunday) of a month, e.g. the 4th Thursday of November. */
export function nthWeekday(y: number, month: number, weekday: number, n: number): number {
  const first = new Date(utc(y, month, 1)).getUTCDay();
  return utc(y, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
}

/** Main windows [start, end] (inclusive UTC day stamps) a rule produces for year y. */
export function windows(rule: Rule, y: number): Array<[number, number]> {
  switch (rule.type) {
    case 'fixed': {
      const [sm, sd] = md(rule.start), [em, ed] = md(rule.end);
      const wraps = em < sm || (em === sm && ed < sd);
      return wraps
        ? [[utc(y - 1, sm, sd), utc(y, em, ed)], [utc(y, sm, sd), utc(y + 1, em, ed)]]
        : [[utc(y, sm, sd), utc(y, em, ed)]];
    }
    case 'table': {
      const s = rule.dates[String(y)];
      if (!s) return [];
      const [m, d] = md(s), t = utc(y, m, d);
      return [[t - rule.before * DAY, t + rule.after * DAY]];
    }
    case 'easter': {
      const t = easter(y);
      return [[t - rule.before * DAY, t + rule.after * DAY]];
    }
    case 'nthWeekday': {
      const t = nthWeekday(y, rule.month, rule.weekday, rule.n);
      return [[t - rule.before * DAY, t + rule.after * DAY]];
    }
  }
}

/** Main windows near a date: this year's and next year's, so runways crossing New Year work. */
function nearWindows(h: Holiday, y: number) {
  return [...windows(h.rule, y), ...windows(h.rule, y + 1)];
}

export function seasonFor(date: Date, seasons: Record<string, number[]>): string {
  const m = date.getMonth() + 1;
  return Object.keys(seasons).find((k) => seasons[k].includes(m)) ?? 'base';
}

/** What the app should look like on a given day. */
/** Pass a café id to leave out holidays that run only at other cafés (Back to School is College Area only). */
export function activeTheme(date: Date, cfg: ThemeConfig, locationId?: string): ActiveTheme {
  const t = dayOf(date), y = date.getFullYear();
  const season = seasonFor(date, cfg.seasons);
  const on = cfg.holidays.filter((h) => h.enabled && (!h.locations || !locationId || h.locations.includes(locationId)));
  const byPriority = (a: { h: Holiday }, b: { h: Holiday }) => b.h.priority - a.h.priority;

  const mains = on.flatMap((h) => nearWindows(h, y - 1).filter(([a, b]) => t >= a && t <= b).map(([, b]) => ({ h, end: b }))).sort(byPriority);
  if (mains.length) {
    const { h, end } = mains[0];
    return { skin: h.id, season, phase: 'main', holiday: h.id, daysUntil: null, daysLeft: Math.round((end - t) / DAY) + 1 };
  }
  const runways = on
    .filter((h) => h.runway > 0)
    .flatMap((h) => nearWindows(h, y - 1).filter(([a]) => t >= a - h.runway * DAY && t < a).map(([a]) => ({ h, start: a })))
    .sort((p, q) => p.start - q.start || q.h.priority - p.h.priority);
  if (runways.length) {
    const { h, start } = runways[0];
    return { skin: season, season, phase: 'runway', holiday: h.id, daysUntil: Math.round((start - t) / DAY), daysLeft: null };
  }
  return { skin: season, season, phase: 'season', holiday: null, daysUntil: null, daysLeft: null };
}

/** Every holiday's runway and main window in a year, for planning and for the checker. */
export function yearPlan(y: number, cfg: ThemeConfig) {
  const iso = (n: number) => new Date(n).toISOString().slice(0, 10);
  return cfg.holidays
    .flatMap((h) =>
      windows(h.rule, y)
        .filter(([a]) => new Date(a).getUTCFullYear() === y)
        .map(([a, b]) => ({ id: h.id, enabled: h.enabled, priority: h.priority, runwayStart: iso(a - h.runway * DAY), start: iso(a), end: iso(b) })),
    )
    .sort((p, q) => p.start.localeCompare(q.start));
}

// ---------- Opening hours ----------
export interface Location { id: string; name: string; hours: Record<string, [string, string]> }
export interface Closure { date: string; locations: string[]; note: string; hours: [string, string] | null }
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const mins = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

/** Is a location open right now? Owner-set closures and holiday hours override the weekly hours. */
export function openStatus(now: Date, loc: Location, closures: Closure[] = []) {
  const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const special = closures.find((c) => c.date === ymd && (c.locations.length === 0 || c.locations.includes(loc.id)));
  if (special && special.hours === null) return { open: false, closesAt: null, note: special.note };
  const [o, c] = special?.hours ?? loc.hours[DAYS[now.getDay()]];
  const n = now.getHours() * 60 + now.getMinutes();
  // Closing times past midnight are written as 24:00, 25:00 and so on.
  const yesterday = special ? null : loc.hours[DAYS[(now.getDay() + 6) % 7]];
  if (yesterday && mins(yesterday[1]) > 1440 && n < mins(yesterday[1]) - 1440) return { open: true, closesAt: yesterday[1], note: special?.note ?? null };
  const open = n >= mins(o) && n < mins(c);
  return { open, closesAt: open ? c : null, opensAt: open ? null : o, note: special?.note ?? null };
}
