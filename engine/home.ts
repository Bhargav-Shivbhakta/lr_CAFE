// Builds the Home screen from data. Nobody arranges Home by hand: the owner adds
// specials, the calendar picks the look, and this function decides what shows, in what order.
import { activeTheme, type ThemeConfig } from '../design-system/themes/calendar.ts';
import { autoCard, autoPicks, cardFor, isActive, rank, LIMITS, type Card, type MenuItem, type Special } from './specials.ts';

export interface HomeContext {
  now: Date;
  menu: MenuItem[];
  specials: Special[];
  themes: ThemeConfig;
  skinNames: Record<string, string>;
  location: string;
  user: null | { name: string; points: number; tier: string; usualItemId?: string; usualNote?: string };
  activeOrder?: { number: string; step: 0 | 1 | 2; readyInMin: number } | null;
  bag?: { count: number; total: number } | null;
  /** Items ordered most in the last 14 days, from Toast. Falls back to items marked popular. */
  bestsellers?: string[];
}

export type Section =
  | { type: 'greeting'; hello: string; name: string | null; points: number | null; tier: string | null }
  | { type: 'tracker'; number: string; step: number; readyInMin: number }
  | { type: 'countdown'; holiday: string; name: string; daysUntil: number }
  | { type: 'join' }
  | { type: 'hero'; skin: string; cards: Card[] }
  | { type: 'usual'; itemId: string; note: string }
  | { type: 'popular'; itemIds: string[] }
  | { type: 'feed'; cards: Card[] };

export function hello(now: Date) {
  const h = now.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function composeHome(c: HomeContext): { skin: string; sections: Section[] } {
  const theme = activeTheme(c.now, c.themes, c.location);
  const occasion = theme.phase === 'main' && theme.holiday ? c.skinNames[theme.holiday] : null;
  const live = rank(c.specials.filter((s) => isActive(s, c.now, c.location)));
  let cards = live.map((s) => cardFor(s, c.menu, c.now, occasion)).filter((k) => k.title);
  if (cards.length === 0) cards = autoPicks(c.menu, theme.season).map((i) => autoCard(i, occasion));
  const hero = cards.slice(0, LIMITS.heroCards);
  const overflow = cards.slice(LIMITS.heroCards);
  const shownIds = new Set(cards.map((k) => k.itemId));

  const s: Section[] = [{ type: 'greeting', hello: hello(c.now), name: c.user?.name ?? null, points: c.user?.points ?? null, tier: c.user?.tier ?? null }];
  // What matters most right now goes first.
  if (c.activeOrder) s.push({ type: 'tracker', ...c.activeOrder });
  if (theme.phase === 'runway' && theme.holiday && theme.daysUntil !== null) s.push({ type: 'countdown', holiday: theme.holiday, name: c.skinNames[theme.holiday], daysUntil: theme.daysUntil });
  if (!c.user) s.push({ type: 'join' });
  s.push({ type: 'hero', skin: theme.skin, cards: hero });
  if (c.user?.usualItemId) s.push({ type: 'usual', itemId: c.user.usualItemId, note: c.user.usualNote ?? '' });
  const pool = (c.bestsellers?.length ? c.bestsellers : c.menu.filter((m) => m.flags.includes('p')).map((m) => m.id))
    .filter((id) => !shownIds.has(id) && id !== c.user?.usualItemId);
  if (pool.length) s.push({ type: 'popular', itemIds: pool.slice(0, 6) });
  if (overflow.length) s.push({ type: 'feed', cards: overflow });
  return { skin: theme.skin, sections: s };
}
