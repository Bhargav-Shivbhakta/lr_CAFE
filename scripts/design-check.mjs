#!/usr/bin/env node
/**
 * Design checker (`npm run design`). Enforces the design standards in the blueprint:
 *  FAIL  a CSS variable used anywhere that isn't defined in the theme (a typo = invisible bug)
 *  WARN  raw colours (hex/rgb) inside features: use a token from src/core/theme/tokens.css
 *  WARN  font sizes outside the type scale, font families set inside features
 * Run with --strict to make warnings fail too.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd(), strict = process.argv.includes('--strict');
const walk = (d, out = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };
const files = walk(join(ROOT, 'src')).filter((p) => /\.(tsx?|css)$/.test(p));
const theme = files.filter((p) => p.includes('/theme/')).map((p) => readFileSync(p, 'utf8')).join('\n');
const defined = new Set([...theme.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
const TYPE_SCALE = new Set([10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 34, 44, 48, 52, 64]);

const fails = [], warns = [];
for (const p of files) {
  const t = readFileSync(p, 'utf8'), r = relative(ROOT, p);
  for (const m of t.matchAll(/var\((--[a-z0-9-]+)/gi)) if (!defined.has(m[1])) fails.push(`${r}  ${m[1]} is not defined in the theme`);
  if (!r.includes('src/features/')) continue;
  const hex = [...t.matchAll(/['"`]#[0-9a-fA-F]{3,8}['"`]|rgba?\(/g)].length;
  if (hex) warns.push(`${r}  ${hex} raw colour value(s): use tokens`);
  for (const m of t.matchAll(/fontSize:\s*([\d.]+)/g)) if (!TYPE_SCALE.has(Number(m[1]))) warns.push(`${r}  fontSize ${m[1]} is off the type scale`);
  if (/fontFamily:\s*['"`][^v]/.test(t)) warns.push(`${r}  sets a font family directly: use var(--font-ui) or var(--font-brand)`);
}
console.log('\nLiving Room design check\n');
console.log(`  ${fails.length ? '✘ FAIL' : '✔ PASS'}  Every CSS variable used is defined (${defined.size} tokens)`);
fails.forEach((f) => console.log(`           ${f}`));
console.log(`  ${warns.length ? '! WARN' : '✔ PASS'}  Features use tokens only${warns.length ? ` (${warns.length} to tidy)` : ''}`);
warns.slice(0, 30).forEach((w) => console.log(`           ${w}`));
console.log('');
process.exit(fails.length || (strict && warns.length) ? 1 : 0);
