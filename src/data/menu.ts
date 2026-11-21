import type { Menu, MenuItem } from '@/core/services/types';
import source from './menu.source.json';

/**
 * The Living Room SDSU / College menu, sourced from the café's public Toast ordering
 * pages (Nov 2026): 29 categories, 204 items, same structure as their current app.
 * Items flagged `s` had no current public price (placeholder until the Toast sync).
 * Photos: put files in src/assets/menu/<item-id>.jpg — they're picked up automatically.
 */
type Src = { categories: { id: string; name: string; section: string; art: string; tint: string }[];
  items: { id: string; cat: string; name: string; desc: string; price: number; flags: string[] }[] };
const src = source as Src;

// Any photo dropped into src/assets/menu/<item-id>.(jpg|png|webp) is bundled and used automatically.
const photos = import.meta.glob('../assets/menu/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const photoFor = (id: string) => Object.entries(photos).find(([path]) => path.split('/').pop()!.replace(/\.\w+$/, '') === id)?.[1];

const DRINK_CATS = ['coffee-espresso', 'fall', 'lattes', 'mochas', 'matcha', 'teas'];
const TAGS = ['p', 'n', 'a', 'v', 'vg', 'gf'] as const;
const TAG_MAP: Record<string, NonNullable<MenuItem['tags']>[number]> = { p: 'popular', n: 'new', a: 'app-only', v: 'v', vg: 'vg', gf: 'gf' };

function groupsFor(catId: string, flags: string[]): string[] | undefined {
  if (flags.includes('eggs')) return ['protein', 'cheese'];
  if (flags.includes('protein')) return ['protein'];
  if (flags.includes('cheese')) return ['cheese'];
  if (DRINK_CATS.includes(catId)) return ['temp', 'milk', 'syrup', 'extras'];
  if (catId === 'frappes' || catId === 'non-coffee') return ['milk', 'syrup'];
  if (catId === 'smoothies') return ['base'];
  return undefined;
}

const items: MenuItem[] = src.items.map((i) => {
  const c = src.categories.find((x) => x.id === i.cat)!;
  return {
    id: i.id, categoryId: i.cat, name: i.name, description: i.desc, price: i.price,
    priceIsSample: i.flags.includes('s') || undefined,
    soldOut: i.flags.includes('x') || undefined,
    tags: i.flags.filter((f) => (TAGS as readonly string[]).includes(f)).map((f) => TAG_MAP[f]),
    modifierGroups: groupsFor(i.cat, i.flags),
    art: i.flags.includes('a') ? 'sparkles' : c.art,
    tint: i.flags.includes('a') ? '#2B1D16' : c.tint,
    image: photoFor(i.id),
  };
});

export const menu: Menu = {
  categories: src.categories.map(({ id, name, section }) => ({ id, name, section })),
  items,
  // Option lists mirror the café's Toast modifiers (milks, syrups, temperatures).
  modifierGroups: [
    { id: 'temp', name: 'Temperature', required: true, max: 1, options: [
      { id: 'hot', name: 'Hot', price: 0 }, { id: 'iced', name: 'Iced', price: 0 }, { id: 'xhot', name: 'Extra hot', price: 0 }] },
    { id: 'milk', name: 'Milk', required: false, max: 1, options: [
      { id: 'whole', name: 'Whole', price: 0 }, { id: '2pct', name: '2%', price: 0 }, { id: 'half', name: 'Half & half', price: 0 },
      { id: 'oat', name: 'Oat', price: 0 }, { id: 'almond', name: 'Almond', price: 0 }, { id: 'soy', name: 'Soy', price: 1 },
      { id: 'coconut', name: 'Coconut', price: 1 }, { id: 'cream', name: 'Heavy cream', price: 1.25 }] },
    { id: 'syrup', name: 'Add a flavor', required: false, max: 2, options: [
      { id: 'vanilla', name: 'Vanilla', price: 0.75 }, { id: 'caramel', name: 'Caramel', price: 0.75 }, { id: 'hazelnut', name: 'Hazelnut', price: 0.75 },
      { id: 'brown-sugar', name: 'Spiced brown sugar', price: 0.75 }, { id: 'toffee', name: 'Sea salt caramel toffee', price: 0.75 },
      { id: 'marshmallow', name: 'Toasted marshmallow', price: 0.75 }, { id: 'pistachio', name: 'Pistachio', price: 0.75 },
      { id: 'lavender', name: 'Lavender', price: 0.75 }, { id: 'pumpkin', name: 'Pumpkin spice', price: 0.75 },
      { id: 'sf-vanilla', name: 'Sugar-free vanilla', price: 0.75 }, { id: 'sf-caramel', name: 'Sugar-free caramel', price: 0.75 }] },
    { id: 'extras', name: 'Extras', required: false, max: 2, options: [
      { id: 'shot', name: 'Extra shot', price: 1 }, { id: 'decaf', name: 'Make it decaf', price: 0 }, { id: 'half-caff', name: 'Half caff', price: 0 }] },
    { id: 'base', name: 'Blend with', required: true, max: 1, options: [
      { id: 'oj', name: 'Orange juice', price: 0 }, { id: 'apple', name: 'Apple juice', price: 0 }, { id: 'milk', name: 'Milk', price: 0 }] },
    { id: 'protein', name: 'Protein', required: true, max: 1, options: [
      { id: 'bacon', name: 'Bacon', price: 0 }, { id: 'ham', name: 'Ham', price: 0 }, { id: 'sausage', name: 'Sausage', price: 0 },
      { id: 'turkey-bacon', name: 'Turkey bacon', price: 0 }, { id: 'chicken-sausage', name: 'Chicken sausage', price: 0 }, { id: 'veggie', name: 'Veggie patty', price: 0 }] },
    { id: 'cheese', name: 'Cheese', required: false, max: 1, options: [
      { id: 'cheddar', name: 'Cheddar', price: 0 }, { id: 'swiss', name: 'Swiss', price: 0 }, { id: 'pepper-jack', name: 'Pepper jack', price: 0 }, { id: 'provolone', name: 'Provolone', price: 0 }] },
  ],
};

export const categoryArt = Object.fromEntries(src.categories.map((c) => [c.id, { art: c.art, tint: c.tint }]));
export const SECTIONS = [...new Set(src.categories.map((c) => c.section))];
