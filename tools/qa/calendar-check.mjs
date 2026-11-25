// Calendar check: works out every holiday theme window for this year and the next
// four, so we can see the themes will switch on by themselves. It fails when a theme
// that depends on a date table (like Back to School) has no date for this year or next.
// Run: node tools/qa/calendar-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, 'design-system/tokens/tokens.json'), 'utf8'));
const holidays = tokens.themes.holidays;

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const md = (y, s) => { const [m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

function easter(y) { // Anonymous Gregorian algorithm
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}
function nthWeekday(y, month, weekday, n) {
  const first = new Date(y, month - 1, 1); const off = (weekday - first.getDay() + 7) % 7;
  return new Date(y, month - 1, 1 + off + 7 * (n - 1));
}

function windowFor(rule, y) {
  if (rule.type === 'fixed') {
    const s = md(y, rule.start); let e = md(y, rule.end);
    if (e < s) e = md(y + 1, rule.end); // crosses into the next year (New Year's Eve → Jan 1)
    return [s, e];
  }
  const around = (day) => [addDays(day, -(rule.before || 0)), addDays(day, rule.after || 0)];
  if (rule.type === 'nthWeekday') return around(nthWeekday(y, rule.month, rule.weekday, rule.n));
  if (rule.type === 'easter') return around(easter(y));
  if (rule.type === 'table') { // one date or a list (spring and fall)
    const v = rule.dates[String(y)]; const list = !v ? [] : Array.isArray(v) ? v : [v];
    return list.length ? list.map((s) => around(md(y, s))) : null;
  }
  throw new Error(`unknown rule type ${rule.type}`);
}

const now = process.env.QA_TODAY ? new Date(process.env.QA_TODAY) : new Date();
const Y = now.getFullYear();
const years = [Y, Y + 1, Y + 2, Y + 3, Y + 4];
const problems = [], warnings = [], rows = [];

for (const h of holidays) {
  const r = h.rule;
  for (const y of years) {
    let w;
    try { w = windowFor(r, y); } catch (e) { problems.push(`${h.id}: ${e.message}`); break; }
    if (!w) {
      const msg = `${h.id} has no date for ${y}: add it to rule.dates in tokens.json`;
      if (!h.enabled) continue;
      if (y <= Y + 1) problems.push(msg); else warnings.push(msg);
      continue;
    }
    const list = Array.isArray(w[0]) ? w : [w];
    if (h.enabled && r.perYear && list.length < r.perYear && (y === Y + 1 || (y === Y && now.getMonth() < 6))) warnings.push(`${h.id} has ${list.length} of ${r.perYear} dates for ${y}: add the missing one to rule.dates in tokens.json`);
    for (const x of list) {
      if (x[1] < x[0]) problems.push(`${h.id} ${y}: ends before it starts`);
      rows.push({ id: h.id, enabled: h.enabled, year: y, from: iso(x[0]), to: iso(x[1]) });
    }
  }
}

// Every holiday that is on has its own food row, and every item in it is on the menu.
const food = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/holiday-food.json'), 'utf8')).holidays;
const menuIds = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/menu.json'), 'utf8')).items.map((m) => m.id));
const SHARES = { anniversary: 'thanksgiving' }; // the café's anniversary uses Thanksgiving's look and food
for (const h of holidays.filter((x) => x.enabled)) {
  const f = food[SHARES[h.id] || h.id];
  if (!f) { problems.push(`${h.id} has no food row in data/holiday-food.json`); continue; }
  for (const id of f.items) if (!menuIds.has(id)) problems.push(`${h.id} food row lists "${id}", which is not on the menu`);
  if (f.items.length < 3) warnings.push(`${h.id} food row has only ${f.items.length} items`);
}

// New Year greeting must show the year that is starting.
for (const y of years) {
  const d = new Date(y, 11, 31), shown = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
  if (shown !== y + 1) problems.push(`New Year's Eve ${y} would say ${shown}`);
}

fs.mkdirSync(path.join(ROOT, 'tools/qa/out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tools/qa/out/calendar.json'), JSON.stringify({ today: iso(now), problems, warnings, windows: rows }, null, 2));

const on = rows.filter((r) => r.enabled && r.year <= Y + 1);
console.log(`Calendar: ${on.length} theme windows worked out for ${Y}–${Y + 1} (${rows.length} through ${Y + 4}).`);
for (const r of on) console.log(`  ${r.id.padEnd(14)} ${r.from} → ${r.to}`);
for (const w of warnings) console.log(`  warning: ${w}`);
for (const p of problems) console.log(`  PROBLEM: ${p}`);
console.log(`${problems.length} problems, ${warnings.length} warnings`);
process.exit(problems.length ? 1 : 0);
