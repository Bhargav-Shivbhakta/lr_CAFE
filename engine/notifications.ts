// Notification engine: decides which notifications go out, when, and what the cup says.
// Pure functions, no imports from the app, so the phone, the server and the tests run the same code.
//
// Rules (also in design-system/RULES.md §20):
// - Order updates always go out (the person is waiting) and never count against the limits.
// - Everything else is "marketing": at most 1 a day and 3 a week, never in quiet hours (9 PM to 7 AM, when the cafés open),
//   never within 4 hours of another, only in categories the person turned on.
// - The cup is the picture on every notification, dressed for the holiday. It is never named.
// - The cup never guilt-trips: no "we miss you", no sad faces, no streak threats.
// - Veterans Day is respectful: no jokes, no offers in the wording.
import { activeTheme } from '../design-system/themes/calendar.ts';
import type { ThemeConfig } from '../design-system/themes/calendar.ts';

export type Category = 'orders' | 'offers' | 'holidays' | 'news';
export type Kind =
  | 'order_making' | 'order_ready'
  | 'holiday_soon' | 'holiday_today' | 'sticker_last_day'
  | 'usual_time' | 'points_close' | 'birthday' | 'new_special' | 'new_since_visit';
export interface Person {
  name?: string; member: boolean; points?: number; nextRewardAt?: number;
  usualItem?: string; usualHour?: number; usualWeekdays?: number[]; // e.g. orders around 8 on weekdays
  lastOrderAt?: string; orderedToday?: boolean; birthday?: string; // 'MM-DD'
  stickers?: string[]; // 'christmas-2026'
  optIn: Partial<Record<Category, boolean>>;
}
export interface Sent { id: string; kind: Kind; at: string }
export interface Context {
  now: Date; person: Person; cafe: { id: string; name: string; readyMin?: [number, number] };
  themes: ThemeConfig; holidayNames: Record<string, string>;
  specials?: { title: string; start: string }[];
  activeOrder?: { number: string; step: 'making' | 'ready'; readyInMin?: number };
  sent: Sent[];
}
export interface Note {
  id: string; kind: Kind; category: Category; title: string; body: string;
  cup: { pose: string; kit: string | null }; // the picture: which pose, which holiday outfit
  link: string; timeSensitive: boolean;
}

export const LIMITS = { perDay: 1, perWeek: 3, gapHours: 4, quietFrom: 21, quietTo: 7 };
/** Everything but order updates and the usual-time nudge waits for the daytime window (9:30 AM to 7:30 PM). */
export const DAYTIME = [9 * 60 + 30, 19 * 60 + 30];
const inDaytime = (d: Date) => { const m = d.getHours() * 60 + d.getMinutes(); return m >= DAYTIME[0] && m < DAYTIME[1]; };
const DAY = 86400000;
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const md = (d: Date) => ymd(d).slice(5);
const first = (name?: string) => (name ? name.split(' ')[0] : '');
export const isQuiet = (d: Date) => d.getHours() >= LIMITS.quietFrom || d.getHours() < LIMITS.quietTo;

// calendar holiday id → holiday kit (the look and the cup's outfit)
export const KIT_OF: Record<string, string> = { valentines: 'valentines', holidaySeason: 'christmas', thanksgiving: 'thanksgiving', anniversary: 'thanksgiving', newYear: 'newyear', july4: 'july4', veterans: 'veterans', halloween: 'halloween', coffeeDay: 'coffeeday', mothersDay: 'mothersday', fathersDay: 'fathersday', backToSchool: 'backtoschool' };

// What the cup says. Short, warm, specific; one idea per notification.
const HOLIDAY_TODAY: Record<string, [string, string]> = {
  valentines: ['Valentine’s week is here', 'Something sweet for two at {cafe}. Specials all week.'],
  christmas: ['The lights are up', 'The holiday menu is on at {cafe}. Tuxedo mocha, anyone?'],
  thanksgiving: ['Happy Thanksgiving week', '35 years of Thanksgivings at the Living Room. Pastry boxes to order ahead.'],
  newyear: ['One more coffee before midnight?', 'New Year’s brunch is ready at {cafe}.'],
  july4: ['Happy 4th', 'Iced and ready for the parade at {cafe}.'],
  veterans: ['Thank you for your service', 'Today we honor everyone who served.'],
  halloween: ['Pumpkin everything', 'Spooky-cozy week at {cafe}. Pumpkin chai is back.'],
  coffeeday: ['It’s National Coffee Day', 'Thank you for every cup. Our baristas picked their favorites.'],
  mothersday: ['Brunch for Mom?', 'Order ahead for Sunday at {cafe}, and skip the line.'],
  fathersday: ['Dad’s order is ready to go', 'Big breakfast, strong coffee at {cafe}.'],
  backtoschool: ['Welcome back to campus', 'Study fuel for the first weeks of classes, from your SDSU café.'],
};
const HOLIDAY_SOON: Record<string, string> = {
  valentines: 'Valentine’s week starts {when}. Plan something sweet.',
  christmas: 'The holiday menu arrives {when}.',
  thanksgiving: 'Thanksgiving week starts {when}. Pastry boxes open for pre-order.',
  newyear: 'New Year’s Eve is {when}.',
  july4: 'The 4th is {when}. Iced drinks for the parade.',
  halloween: 'Halloween week starts {when}. Pumpkin everything.',
  coffeeday: 'National Coffee Day is {when}.',
  mothersday: 'Mother’s Day is {when}. Celebrate with us: brunch at the Living Room.',
  fathersday: 'Father’s Day is {when}. Celebrate with us: a breakfast burrito or a short rib grilled cheese.',
};

/** Every notification that could go out right now, best first, before limits. */
export function candidates(c: Context): Note[] {
  const p = c.person, out: Note[] = [], day = ymd(c.now), name = first(p.name);
  const th = activeTheme(c.now, c.themes, c.cafe.id), kit = th.phase === 'main' && th.holiday ? KIT_OF[th.holiday] || null : null;
  const fill = (s: string) => s.replace('{cafe}', c.cafe.name);
  const [a, b] = c.cafe.readyMin || [10, 12];
  // orders: always, best first
  if (c.activeOrder?.step === 'ready') out.push({ id: `ready-${c.activeOrder.number}`, kind: 'order_ready', category: 'orders', title: 'Ready at the counter', body: `Order #${c.activeOrder.number} is on the shelf at ${c.cafe.name}.`, cup: { pose: 'ready', kit }, link: 'order', timeSensitive: true });
  if (c.activeOrder?.step === 'making') out.push({ id: `making-${c.activeOrder.number}`, kind: 'order_making', category: 'orders', title: 'We’re making your order', body: `About ${c.activeOrder.readyInMin ?? a} minutes at ${c.cafe.name}.`, cup: { pose: 'brew', kit }, link: 'order', timeSensitive: false });
  // birthday
  if (p.member && p.birthday === md(c.now)) out.push({ id: `bday-${day}`, kind: 'birthday', category: 'offers', title: `Happy birthday${name ? ', ' + name : ''}`, body: 'Your birthday treat is on your Rewards card today.', cup: { pose: 'party', kit }, link: 'rewards', timeSensitive: false });
  // holiday: first day
  if (kit && th.holiday) {
    const startToday = th.daysLeft !== null && isFirstDay(c, th.holiday);
    if (startToday && HOLIDAY_TODAY[kit]) out.push({ id: `hol-${th.holiday}-${c.now.getFullYear()}`, kind: 'holiday_today', category: 'holidays', title: HOLIDAY_TODAY[kit][0], body: fill(HOLIDAY_TODAY[kit][1]), cup: { pose: 'act', kit }, link: 'home', timeSensitive: false });
    // last day to collect the sticker (members who haven't ordered during it)
    const tag = `${kit}-${c.now.getFullYear()}`;
    if (th.daysLeft === 1 && p.member && !(p.stickers || []).includes(tag) && kit !== 'veterans') out.push({ id: `sticker-${tag}`, kind: 'sticker_last_day', category: 'holidays', title: `Last day for the ${c.holidayNames[th.holiday] || 'holiday'} sticker`, body: 'Order anything today and it’s yours, on your Rewards card.', cup: { pose: 'sticker', kit }, link: 'home', timeSensitive: false });
  }
  // holiday: lead-up, 3 days and 1 day before
  if (th.phase === 'runway' && th.holiday && (th.daysUntil === 3 || th.daysUntil === 1)) {
    const k = KIT_OF[th.holiday];
    if (k && HOLIDAY_SOON[k]) out.push({ id: `soon-${th.holiday}-${c.now.getFullYear()}-${th.daysUntil}`, kind: 'holiday_soon', category: 'holidays', title: c.holidayNames[th.holiday] || 'Coming up', body: HOLIDAY_SOON[k].replace('{when}', th.daysUntil === 1 ? 'tomorrow' : 'in 3 days'), cup: { pose: 'wave', kit: k }, link: 'home', timeSensitive: false });
  }
  // the usual, 20 minutes before they usually order, on their usual days
  if (p.usualItem && p.usualHour !== undefined && !p.orderedToday) {
    const mins = c.now.getHours() * 60 + c.now.getMinutes(), target = p.usualHour * 60 - 20;
    const dayOk = !p.usualWeekdays || p.usualWeekdays.includes(c.now.getDay());
    if (dayOk && mins >= target && mins < target + 30) out.push({ id: `usual-${day}`, kind: 'usual_time', category: 'offers', title: `${p.usualItem} o’clock?`, body: `One tap and it’s ready in ${a}–${b} min at ${c.cafe.name}.`, cup: { pose: 'wave', kit }, link: 'reorder', timeSensitive: false });
  }
  // a free drink is close
  if (p.member && p.points !== undefined && p.nextRewardAt && p.nextRewardAt - p.points > 0 && p.nextRewardAt - p.points <= 30) out.push({ id: `points-${p.points}`, kind: 'points_close', category: 'offers', title: `${p.nextRewardAt - p.points} points to a free drink`, body: 'One more coffee and it’s on us.', cup: { pose: 'thumb', kit }, link: 'rewards', timeSensitive: false });
  // new specials this week at their café (Mondays)
  const fresh = (c.specials || []).filter((s) => s.start === day);
  if (fresh.length) out.push({ id: `special-${day}`, kind: 'new_special', category: 'news', title: `New this week at ${c.cafe.name}`, body: fresh.map((s) => s.title).slice(0, 2).join(' and ') + '.', cup: { pose: 'wave', kit }, link: 'home', timeSensitive: false });
  // been a while: tell them what's new, never guilt
  if (p.lastOrderAt && (c.now.getTime() - new Date(p.lastOrderAt + 'T12:00:00').getTime()) / DAY >= 21 && c.specials?.length) out.push({ id: `since-${day}`, kind: 'new_since_visit', category: 'news', title: 'New since your last visit', body: `${c.specials[0].title} is on at ${c.cafe.name}.`, cup: { pose: 'wave', kit }, link: 'home', timeSensitive: false });
  return out;
}

function isFirstDay(c: Context, holiday: string) {
  const y = new Date(c.now.getTime() - DAY);
  const t = activeTheme(y, c.themes, c.cafe.id);
  return !(t.phase === 'main' && t.holiday === holiday);
}

/** What actually goes out now, after opt-ins, quiet hours, spacing and limits. */
export function decide(c: Context): Note[] {
  const all = candidates(c).filter((n) => !c.sent.some((s) => s.id === n.id));
  const orders = all.filter((n) => n.category === 'orders' && c.person.optIn.orders !== false);
  if (isQuiet(c.now)) return orders;
  const t = c.now.getTime(), marketing = c.sent.filter((s) => !s.kind.startsWith('order_'));
  const today = marketing.filter((s) => s.at.slice(0, 10) === ymd(c.now)).length;
  const week = marketing.filter((s) => t - new Date(s.at).getTime() < 7 * DAY).length;
  const recent = marketing.some((s) => t - new Date(s.at).getTime() < LIMITS.gapHours * 3600000);
  if (today >= LIMITS.perDay || week >= LIMITS.perWeek || recent) return orders;
  const pick = all.find((n) => n.category !== 'orders' && c.person.optIn[n.category] && (n.kind === 'usual_time' || inDaytime(c.now)));
  return pick ? [...orders, pick] : orders;
}

/** Simulate a whole day (every 10 minutes) — used by the preview and the tests. */
export function day(c: Omit<Context, 'now' | 'sent'>, date: string, sent: Sent[] = []): (Note & { at: string })[] {
  const log = [...sent], out: (Note & { at: string })[] = [];
  for (let m = 0; m < 24 * 60; m += 10) {
    const now = new Date(`${date}T${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00`);
    for (const n of decide({ ...c, now, sent: log })) { const at = now.toISOString(); log.push({ id: n.id, kind: n.kind, at }); out.push({ ...n, at: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` }); }
  }
  return out;
}
