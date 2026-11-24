// Import a finished photo pack (square 1200×1200 app photos + manifest.tsv) into the app.
// Usage: node tools/photos/import-pack.mjs <pack folder> <map.json: slug -> menu id>
// Writes assets/menu/<id>-sq.webp (600), -wide.webp (800×500, smart crop), -th.webp (240), and data/photos.json.
// Photos whose dish isn't on the app menu yet go to assets/menu/new/<slug>-sq.webp.
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const [pack, mapFile] = process.argv.slice(2);
const map = JSON.parse(readFileSync(mapFile, 'utf8'));
const rows = readFileSync(join(pack, 'manifest.tsv'), 'utf8').trim().split('\n').slice(1).map((l) => l.split('\t'));
const out = 'assets/menu'; mkdirSync(join(out, 'new'), { recursive: true });
const db = existsSync('data/photos.json') ? JSON.parse(readFileSync('data/photos.json', 'utf8')) : {};
db.items ||= {}; db.new ||= {};
for (const [index, name, slug, source] of rows) {
  const src = join(pack, 'app_webp', `${index}_${slug}.webp`), id = map[slug];
  const img = () => sharp(src);
  if (id) {
    await img().resize(600, 600).webp({ quality: 80 }).toFile(join(out, `${id}-sq.webp`));
    await img().resize(800, 500, { fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 80 }).toFile(join(out, `${id}-wide.webp`));
    await img().resize(240, 240).webp({ quality: 76 }).toFile(join(out, `${id}-th.webp`));
    db.items[id] = { name, sq: `${out}/${id}-sq.webp`, wide: `${out}/${id}-wide.webp`, th: `${out}/${id}-th.webp`, source, batch: 1 };
  } else {
    await img().resize(600, 600).webp({ quality: 80 }).toFile(join(out, 'new', `${slug}-sq.webp`));
    db.new[slug] = { name, sq: `${out}/new/${slug}-sq.webp`, source, batch: 1, note: 'Not on the app menu yet: add the item (name, price, category) and move the photo.' };
  }
}
db.checkWithCafe = { 'homemade-granola': 'Photo looks like a fruit bowl, nearly the same as Fresh fruit bowl.', 'pistachio-blondie': 'Photo shows a layered green drink, not a blondie.', 'cajun-shrimp-pasta': 'Matched to the menu’s Spicy shrimp pasta; confirm it is the same dish.' };
writeFileSync('data/photos.json', JSON.stringify(db, null, 2) + '\n');
console.log(Object.keys(db.items).length, 'menu items with photos;', Object.keys(db.new).length, 'new dishes waiting for a menu entry');
