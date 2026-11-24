// Enforces the Living Room design rules. Fails (exit 1) on any error.
//   node design-system/scripts/check-design.mjs [folders to scan…]   (default: src)
//   node design-system/scripts/check-design.mjs --self-test          (proves every rule fires)
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const DS = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = join(DS, '..');
const T = JSON.parse(readFileSync(join(DS, 'tokens/tokens.json'), 'utf8'));
const { activeTheme, yearPlan } = await import(join(DS, 'themes/calendar.ts'));
const errors = [], warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// ---------- 1. The tokens themselves ----------
const lum = (h) => { const n = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0); };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
function contrast(where, fg, bg, min) { const v = cr(fg, bg); if (v < min) err(where, `contrast ${v.toFixed(2)}:1 is under ${min}:1 (${fg} on ${bg})`); }
function checkTokens() {
  for (const [id, p] of Object.entries(T.color.palettes)) {
    contrast(`palette ${id} text`, p.ink, p.ground, 4.5);
    contrast(`palette ${id} grey text`, p.muted, p.ground, 4.5);
    contrast(`palette ${id} button`, p.onPrimary, p.primary, 4.5);
    contrast(`palette ${id} card text`, p.deepInk, p.deep, 4.5);
  }
  const cream = T.color.palettes[T.choice.palette].ground;
  for (const [id, s] of Object.entries(T.themes.skins)) {
    contrast(`skin ${id} hero text`, s.heroInk, s.heroBg, 4.5);
    contrast(`skin ${id} eyebrow`, s.eyebrow, s.heroBg, 4.5);
    contrast(`skin ${id} accent`, s.accent, cream, 3);
    for (const o of s.pip) if (!T.mascot.outfits.includes(o) && o !== 'sparkles') err(`skin ${id}`, `Pip outfit "${o}" does not exist`);
  }
  for (const s of Object.keys(T.themes.seasons)) if (!T.themes.skins[s]) err(`season ${s}`, 'has no skin');
  const year = new Date().getFullYear();
  for (const h of T.themes.holidays) {
    if (!T.themes.skins[h.id]) err(`holiday ${h.id}`, 'has no skin');
    if (typeof h.runway !== 'number' || h.runway < 0 || h.runway > 30) err(`holiday ${h.id}`, 'runway must be 0 to 30 days');
    if (h.enabled && h.rule.type === 'table' && !h.rule.dates[String(year)]) err(`holiday ${h.id}`, `is on but has no date for ${year}`);
  }
  // Every day for two years must resolve to a real skin.
  for (let d = new Date(year, 0, 1); d < new Date(year + 2, 0, 1); d.setDate(d.getDate() + 1)) {
    const a = activeTheme(d, T.themes);
    if (!T.themes.skins[a.skin]) err(`calendar ${d.toISOString().slice(0, 10)}`, `skin "${a.skin}" does not exist`);
  }
  // Overlapping main windows: allowed, but say which one wins.
  const plan = yearPlan(year, T.themes).filter((p) => p.enabled);
  for (let i = 0; i < plan.length; i++) for (let j = i + 1; j < plan.length; j++) {
    const a = plan[i], b = plan[j];
    if (a.start <= b.end && b.start <= a.end) warnings.push(`calendar: ${a.id} and ${b.id} overlap; ${a.priority >= b.priority ? a.id : b.id} wins`);
  }
  for (const o of T.mascot.outfits) if (!readFileSync(join(DS, 'pip/Pip.tsx'), 'utf8').includes(`  ${o}: <>`)) err(`mascot outfit ${o}`, 'is not drawn in Pip.tsx');
  const cafe = JSON.parse(readFileSync(join(ROOT, 'data/cafe.json'), 'utf8'));
  for (const l of cafe.locations) for (const [day, h] of Object.entries(l.hours)) if (!/^\d\d:\d\d$/.test(h[0]) || !/^\d\d:\d\d$/.test(h[1])) err(`cafe ${l.id} ${day}`, 'hours must be "HH:MM"');
}

// ---------- 2. App code ----------
const space = new Set([0, 1, 2, ...Object.values(T.space)]);
const radii = new Set([0, ...Object.values(T.radius.styles[T.choice.corners])]);
const ms = new Set(T.motion.allowedMs);
const fonts = new Set(Object.values(T.font.pairs).flatMap((p) => [p.display, p.text]));
const RULES = [
  { re: /#[0-9a-fA-F]{3,8}\b(?![\w-]*=)|rgba?\(\s*\d/g, msg: 'raw colour: use a token, e.g. var(--primary)', level: 'error', skipIn: /\.svg$/ },
  { re: /font-?family\s*:\s*(['"]?)(?!var\(--font)([^;'"}]+)/gi, msg: 'font not from tokens: use var(--font-display) or var(--font-text)', level: 'error' },
  { re: /\b(fontSize|font-size)\s*:\s*['"]?(\d+(\.\d+)?)px/g, check: (m) => Number(m[2]) < T.font.minSize, msg: `text under ${T.font.minSize}px`, level: 'error' },
  { re: /\b(borderRadius|border-radius)\s*:\s*['"]?(\d+)px/g, check: (m) => !radii.has(Number(m[2])), msg: 'corner not in the radius scale: use var(--radius-*)', level: 'error' },
  { re: /\b(\d{2,5})ms\b/g, check: (m) => !ms.has(Number(m[1])), msg: 'duration not in the motion tokens: use var(--dur-*)', level: 'error' },
  { re: /\b(padding|margin|gap|rowGap|columnGap|row-gap|column-gap)[A-Za-z-]*\s*:\s*['"]?(\d+)px/g, check: (m) => !space.has(Number(m[2])), msg: 'spacing not on the 4-pt scale: use var(--space-*)', level: 'warn' },
  { re: /<(div|span|li|p)\b[^>]*\bonClick=/g, msg: 'click handler on a non-button: use <button> or <a> so keyboards and screen readers can reach it', level: 'error' },
  { re: /<img\b(?![^>]*\balt=)[^>]*>/g, msg: 'image without alt text', level: 'error' },
  { re: /spinner|Spinner|ActivityIndicator/g, msg: 'no spinners: use <CupLoader/> or <PipLoader/>', level: 'error' },
  { re: /['"`>][^'"`<>\n]*(?<![\/\w.])Pip\b(?![\w\/.])/g, msg: 'the cup has no name people can see: say "the cup" or "the Living Room cup" (Pip is only the code name)', level: 'error' },
  { re: /animation[^;\n]*infinite/g, check: (m, file, src) => !/CupLoader|PipLoader|m-shimmer|m-steam/.test(src), msg: 'looping animation outside a loader: one-shot only', level: 'error' },
];
function scanFile(file, rel) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const at = (i) => `${rel}:${src.slice(0, i).split('\n').length}`;
  for (const r of RULES) {
    if (r.skipIn && r.skipIn.test(file)) continue;
    for (const m of src.matchAll(r.re)) {
      const line = lines[src.slice(0, m.index).split('\n').length - 1];
      if (/design-allow/.test(line)) continue; // escape hatch, must say why: // design-allow: reason
      if (r.re.source.startsWith('font-?family') && fonts.has(m[2].trim().split(',')[0].replace(/['"]/g, ''))) { err(at(m.index), 'font name written directly: use var(--font-display) or var(--font-text)'); continue; }
      if (r.check && !r.check(m, file, src)) continue;
      (r.level === 'error' ? err : warn)(at(m.index), r.msg);
    }
  }
  if (/[\\/](checkout|payment|pay)[\\/.]/i.test(rel) && /from ['"][^'"]*pip\/(Pip|Loader)['"]/.test(src)) err(rel, 'Pip is not allowed on checkout or payment screens');
}
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.') || name === 'dist') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (p !== DS) walk(p); }
    else if (['.ts', '.tsx', '.css', '.html'].includes(extname(p))) scanFile(p, relative(ROOT, p));
  }
}

// ---------- 3. Run (or self-test: plant one mistake per rule and make sure each is caught) ----------
const args = process.argv.slice(2);
checkTokens();
if (args[0] === '--self-test') {
  const dir = mkdtempSync(join(tmpdir(), 'lr-design-'));
  mkdirSync(join(dir, 'checkout'));
  writeFileSync(join(dir, 'a.tsx'), `const s = { color: '#ff0000', fontSize: '9px', borderRadius: '7px', transition: 'all 333ms', padding: '13px' };\nexport const A = () => <div onClick={() => 1}><img src="x.png" /><Spinner /><p aria-label="Pip says hi">Hi</p></div>;`);
  writeFileSync(join(dir, 'b.css'), `.x { font-family: 'Comic Sans MS'; animation: spin 1s infinite; }`);
  writeFileSync(join(dir, 'checkout/Pay.tsx'), `import { Pip } from '../design-system/pip/Pip';`);
  const before = errors.length, wb = warnings.length;
  for (const f of ['a.tsx', 'b.css', 'checkout/Pay.tsx']) scanFile(join(dir, f), f);
  const found = errors.slice(before).join('\n') + '\n' + warnings.slice(wb).join('\n');
  rmSync(dir, { recursive: true, force: true });
  const expect = ['raw colour', 'text under', 'corner not', 'duration not', 'spacing not', 'non-button', 'without alt', 'no spinners', 'font not from tokens', 'looping animation', 'Pip is not allowed', 'has no name'];
  const missed = expect.filter((e) => !found.includes(e));
  errors.splice(before); warnings.splice(wb);
  if (missed.length) { console.error('SELF-TEST FAILED, rules that did not fire:', missed); process.exit(1); }
  console.log(`self-test: all ${expect.length} rules fired on planted mistakes`);
} else {
  const targets = args.length ? args : ['src'];
  for (const t of targets) { const p = join(ROOT, t); if (existsSync(p)) walk(p); }
}
for (const w of warnings) console.warn('warn  ' + w);
for (const e of errors) console.error('ERROR ' + e);
console.log(`design check: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
