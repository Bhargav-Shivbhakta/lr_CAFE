// Re-crop every app photo around the dish, using tools/photos/focus.json (x, y, zoom per item).
// Shapes: -sq 600×600 (square tiles), -card 600×450 (4:3 cards), -wide 800×500, -hero 820×400 (the big special card), -th 240×240.
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
const focus = JSON.parse(readFileSync('tools/photos/focus.json', 'utf8'));
const db = JSON.parse(readFileSync('data/photos.json', 'utf8'));
const pack = process.argv[2];
const rows = Object.fromEntries(readFileSync(`${pack}/manifest.tsv`, 'utf8').trim().split('\n').slice(1).map((l) => l.split('\t')).map(([i, , slug]) => [slug, `${pack}/app_webp/${i}_${slug}.webp`]));
const map = JSON.parse(readFileSync(process.argv[3], 'utf8')), srcOf = Object.fromEntries(Object.entries(map).map(([slug, id]) => [id, rows[slug]]));
function box(S, fx, fy, z, aspect) {
  let w = z * S, h = w / aspect; if (h > S) { h = S; w = h * aspect; } if (w > S) { w = S; h = w / aspect; }
  const left = Math.min(Math.max(fx * S - w / 2, 0), S - w), top = Math.min(Math.max(fy * S - h / 2, 0), S - h);
  return { left: Math.round(left), top: Math.round(top), width: Math.round(w), height: Math.round(h) };
}
for (const [id, rec] of Object.entries(db.items)) {
  const [fx, fy, z, zsq] = focus[id] || [0.5, 0.5, 0.9], src = srcOf[id], S = 1200;
  const out = (suffix, W, H, zoom) => sharp(src).extract(box(S, fx, fy, zoom, W / H)).resize(W, H).webp({ quality: 80 }).toFile(`assets/menu/${id}-${suffix}.webp`);
  await out('sq', 600, 600, zsq ?? Math.min(1, z + 0.03));
  await out('card', 600, 450, z);
  await out('wide', 800, 500, Math.max(z, 0.62));
  await out('hero', 820, 400, Math.max(z, 0.6)); // the big special card (about 2:1)
  await out('th', 240, 240, zsq ?? z);
  Object.assign(rec, { card: `assets/menu/${id}-card.webp`, hero: `assets/menu/${id}-hero.webp`, focus: { x: fx, y: fy, zoom: z } });
}
writeFileSync('data/photos.json', JSON.stringify(db, null, 2) + '\n');
console.log('re-cropped', Object.keys(db.items).length);
