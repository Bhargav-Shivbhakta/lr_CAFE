// Seasonal and holiday theme calendar.
// Pure functions, no imports, so the app AND the Node checker use the same code.
// The rules themselves live in tokens.json → themes.holidays. Do not hard-code dates here.

export type Rule =
  | { type: 'fixed'; start: string; end: string }
  | { type: 'table'; dates: Record<string, string>; before: number; after: number }
  | { type: 'easter'; before: number; after: number }
  | { type: 'nthWeekday'; month: number; weekday: number; n: number; before: number; after: number };

export interface Holiday { id: string; enabled: boolean; priority: number; rule: Rule; note?: string }
export interface ThemeConfig { seasons: Record<string, number[]>; holidays: Holiday[] }
export interface ActiveTheme { skin: string; season: string; holiday: string | null }

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

/** The n-th weekday (0 = Sunday) of a month, e.g. 4th Thursday of November. */
export function nthWeekday(y: number, month: number, weekday: number, n: number): number {
  const first = new Date(utc(y, month, 1)).getUTCDay();
  return utc(y, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
}

/** The [start, end] windows (inclusive, UTC day stamps) a rule covers around year y. */
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

export function seasonFor(date: Date, seasons: Record<string, number[]>): string {
  const m = date.getMonth() + 1;
  return Object.keys(seasons).find((k) => seasons[k].includes(m)) ?? 'base';
}

/** Which skin to show on a given day. Holidays beat seasons; higher priority beats lower. */
export function activeTheme(date: Date, cfg: ThemeConfig): ActiveTheme {
  const t = dayOf(date), y = date.getFullYear();
  const season = seasonFor(date, cfg.seasons);
  const hits = cfg.holidays
    .filter((h) => h.enabled && windows(h.rule, y).some(([a, b]) => t >= a && t <= b))
    .sort((a, b) => b.priority - a.priority);
  const holiday = hits[0]?.id ?? null;
  return { skin: holiday ?? season, season, holiday };
}

/** Every holiday window in a year, for the planning calendar and the checker. */
export function yearPlan(y: number, cfg: ThemeConfig) {
  return cfg.holidays.flatMap((h) =>
    windows(h.rule, y)
      .filter(([a, b]) => new Date(a).getUTCFullYear() === y || new Date(b).getUTCFullYear() === y)
      .map(([a, b]) => ({ id: h.id, enabled: h.enabled, priority: h.priority, start: new Date(a).toISOString().slice(0, 10), end: new Date(b).toISOString().slice(0, 10) })),
  ).sort((p, q) => p.start.localeCompare(q.start));
}
