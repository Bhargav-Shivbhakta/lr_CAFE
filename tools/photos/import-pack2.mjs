// Import photo pack 2 (SDSU, Nov 2026): 1200x1200 AI-generated illustrations, manifest.csv + webp/.
// These are DRAFTS for the café to check (ingredients, sides, cup branding), so every one is marked
// { kind: 'illustration', review: true }. Real photos (batch 1) always win over these.
// Usage: node tools/photos/import-pack2.mjs <pack folder> <map.json {map:{slug:id}, new:[slug]}>
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [pack, mapFile] = process.argv.slice(2);
const { map, new: fresh } = JSON.parse(readFileSync(mapFile, 'utf8'));
const menu = Object.fromEntries(JSON.parse(readFileSync('data/menu.json', 'utf8')).items.map((m) => [m.id, m]));
const db = JSON.parse(readFileSync('data/photos.json', 'utf8')); db.new ||= {};
const focus = JSON.parse(readFileSync('tools/photos/focus.json', 'utf8'));
// The pack is consistent: one drink or one plate in the middle of a café table. Crop by kind of dish,
// so the drink or the food fills the card and the table and chairs fall away.
const DRINK = new Set(['coffee-espresso', 'lattes', 'mochas', 'frappes', 'matcha', 'non-coffee', 'refreshers', 'smoothies', 'teas', 'fall']);
const rule = (id) => {
  const c = menu[id].cat;
  if (DRINK.has(c)) return [0.47, 0.46, 0.96, 0.9]; // the whole cup and the top of the drink, not just the logo
  if (c === 'breakfast-sides') return [0.5, 0.56, 0.62, 0.66];
  if (c === 'skillets') return [0.56, 0.56, 0.84, 0.88];
  if (c === 'pastries' || c === 'sweets-crepes') return [0.5, 0.55, 0.74, 0.78];
  return [0.5, 0.55, 0.84, 0.88];
};
function box(S, fx, fy, z, aspect) {
  let w = z * S, h = w / aspect; if (h > S) { h = S; w = h * aspect; } if (w > S) { w = S; h = w / aspect; }
  return { left: Math.round(Math.min(Math.max(fx * S - w / 2, 0), S - w)), top: Math.round(Math.min(Math.max(fy * S - h / 2, 0), S - h)), width: Math.round(w), height: Math.round(h) };
}
let n = 0;
for (const [slug, id] of Object.entries(map)) {
  if (db.items[id] && (db.items[id].batch || 1) === 1) continue; // a real photo stays
  const src = join(pack, 'webp', `${slug}.webp`), f = focus[id] || rule(id); focus[id] = f;
  const [fx, fy, z, zsq] = f, out = (suffix, W, H, zoom) => sharp(src).extract(box(1200, fx, fy, zoom, W / H)).resize(W, H).webp({ quality: 80 }).toFile(`assets/menu/${id}-${suffix}.webp`);
  await out('sq', 600, 600, zsq ?? z); await out('card', 600, 450, z); await out('wide', 800, 500, Math.max(z, 0.62)); await out('hero', 820, 400, Math.max(z, 0.6)); await out('th', 240, 240, zsq ?? z);
  db.items[id] = { name: menu[id].name, sq: `assets/menu/${id}-sq.webp`, card: `assets/menu/${id}-card.webp`, wide: `assets/menu/${id}-wide.webp`, hero: `assets/menu/${id}-hero.webp`, th: `assets/menu/${id}-th.webp`, source: 'Photo pack 2 (SDSU), AI-generated illustration', kind: 'illustration', review: true, batch: 2, focus: { x: fx, y: fy, zoom: z } };
  n++;
}
mkdirSync('assets/menu/new', { recursive: true });
for (const slug of fresh) {
  await sharp(join(pack, 'webp', `${slug}.webp`)).extract(box(1200, 0.5, 0.55, 0.84, 1)).resize(600, 600).webp({ quality: 80 }).toFile(`assets/menu/new/${slug}-sq.webp`);
  db.new[slug] = { name: slug.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()), sq: `assets/menu/new/${slug}-sq.webp`, kind: 'illustration', review: true, batch: 2, note: 'In the SDSU photo pack but not on the app menu yet: add it (name, price, category) and move the photo.' };
}
db.pack2 = { location: 'college', items: n, note: 'AI-generated illustrations, drafts for café review: check ingredients, portions, sides and garnishes, and the cup branding and wording, before publishing. Bomb Alaska was left out of the pack (recipe not confirmed).' };
writeFileSync('data/photos.json', JSON.stringify(db, null, 2) + '\n');
writeFileSync('tools/photos/focus.json', JSON.stringify(focus, null, 1) + '\n');
console.log('imported', n, 'illustrations;', fresh.length, 'waiting for a menu entry;', Object.keys(db.items).length, 'menu items now have a picture');
