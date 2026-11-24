// Turns collected café photos into the app's house style.
//   npm run photos -- collected.json         (from the collector, URLs or local files)
//   npm run photos -- ./my-shots/            (a folder of your own photos named like the menu item)
//
// For every photo it:
//   1. matches it to a menu item in data/menu.json,
//   2. finds the food with an "attention" crop (keeps the busiest, most colourful part),
//   3. applies the Living Room grade: a little warmer, gentle contrast, a soft warm vignette,
//   4. writes the four shapes the design rules use (1:1, 4:3, 4:5, 16:10) as WebP,
//   5. records everything in data/photos.json, including where each photo came from.
// Photos stay on your computer until you commit them. Use only the café's own photos
// (their Toast menu, website or their own Instagram posts) or photos you took yourself.
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'public', 'photos');
const MENU = JSON.parse(readFileSync(join(ROOT, 'data/menu.json'), 'utf8')).items;
const SHAPES = { square: [800, 800], item: [1200, 900], special: [960, 1200], hero: [1600, 1000] };
const norm = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/®|™/g, '').replace(/[^a-z0-9]/g, '');

// Small edit distance, so "Dirty Chai" still finds "Dirty chai latte".
function match(name) {
  const n = norm(name);
  const exact = MENU.find((i) => norm(i.name) === n);
  if (exact) return exact;
  const contains = MENU.filter((i) => norm(i.name).includes(n) || n.includes(norm(i.name)));
  if (contains.length === 1) return contains[0];
  const dist = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
  const best = MENU.map((i) => ({ i, d: dist(n, norm(i.name)) / Math.max(n.length, norm(i.name).length) })).sort((a, b) => a.d - b.d)[0];
  return best && best.d <= 0.2 ? best.i : null;
}

async function load(src) {
  if (/^https?:/.test(src)) {
    const r = await fetch(src);
    if (!r.ok) throw new Error(`download failed (${r.status})`);
    return Buffer.from(await r.arrayBuffer());
  }
  return readFileSync(src);
}

// The Living Room grade. Kept subtle: food must still look like itself.
async function grade(input, [w, h]) {
  const base = sharp(input).rotate().resize(w, h, { fit: 'cover', position: sharp.strategy.attention })
    .modulate({ brightness: 1.02, saturation: 1.04 })
    .recomb([[1.025, 0, 0], [0, 1.0, 0], [0, 0, 0.965]])   // a touch warmer: lift red, ease blue
    .linear(1.04, -4);                                              // gentle contrast
  const vignette = Buffer.from(`<svg width="${w}" height="${h}"><defs><radialGradient id="v" cx="50%" cy="50%" r="75%"><stop offset="60%" stop-color="#2B1D16" stop-opacity="0"/><stop offset="100%" stop-color="#2B1D16" stop-opacity="0.18"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`);
  return base.composite([{ input: vignette, blend: 'over' }]).webp({ quality: 82 }).toBuffer();
}

function inputs(arg) {
  if (statSync(arg).isDirectory()) {
    return readdirSync(arg).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f)).map((f) => ({ name: basename(f, extname(f)).replace(/[-_]/g, ' '), image: join(arg, f), source: 'own photo' }));
  }
  return JSON.parse(readFileSync(arg, 'utf8')).map((c) => ({ ...c, source: c.source ?? c.image }));
}

const arg = process.argv[2];
if (!arg || !existsSync(arg)) { console.error('Give a collected.json file or a folder of photos.'); process.exit(1); }
const manifestPath = join(ROOT, 'data/photos.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
let ok = 0; const skipped = [];
for (const c of inputs(arg)) {
  const item = match(c.name);
  if (!item) { skipped.push(`${c.name} (no menu match)`); continue; }
  try {
    const buf = await load(c.image);
    const meta = await sharp(buf).metadata();
    if ((meta.width ?? 0) < 400) { skipped.push(`${c.name} (too small: ${meta.width}px)`); continue; }
    mkdirSync(join(OUT, item.id), { recursive: true });
    for (const [shape, size] of Object.entries(SHAPES)) writeFileSync(join(OUT, item.id, `${shape}.webp`), await grade(buf, size));
    manifest[item.id] = { name: item.name, source: c.source, original: `${meta.width}×${meta.height}`, shapes: Object.keys(SHAPES).map((s) => `/photos/${item.id}/${s}.webp`) };
    ok++;
  } catch (e) { skipped.push(`${c.name} (${e.message})`); }
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(`styled ${ok} photos → public/photos/ ; ${Object.keys(manifest).length} of ${MENU.length} menu items now have a photo`);
if (skipped.length) console.log('skipped:\n  ' + skipped.join('\n  '));
