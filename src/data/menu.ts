import type { Menu, MenuCategory, MenuItem } from '@/core/services/types';

/**
 * Living Room menu — collected from the café's public Toast ordering pages (Nov 2026).
 * Items marked `priceIsSample` had no public price; confirm before launch.
 * In production this file is replaced by the Toast menu sync (see core/services/adapters/toast.ts).
 * Photos: put files in /public/menu/<item-id>.jpg and set `image: '/menu/<item-id>.jpg'`.
 */
const categories: (MenuCategory & { art: string; tint: string })[] = [
  { id: 'lattes', name: 'Lattes & chai', section: 'Coffee & drinks', art: 'coffee', tint: '#E8D5BF' },
  { id: 'espresso', name: 'Coffee & espresso', section: 'Coffee & drinks', art: 'coffee', tint: '#D9C2A7' },
  { id: 'matcha', name: 'Ceremonial matcha', section: 'Coffee & drinks', art: 'leaf', tint: '#DCE6CC' },
  { id: 'frappes', name: 'Frappes', section: 'Coffee & drinks', art: 'cup', tint: '#EADCCB' },
  { id: 'refreshers', name: 'Refreshers & juices', section: 'Coffee & drinks', art: 'glass', tint: '#F4D3D6' },
  { id: 'croissants', name: 'Croissants', section: 'Food', art: 'croissant', tint: '#F2E1B9' },
  { id: 'burritos', name: 'Breakfast burritos', section: 'Food', art: 'sandwich', tint: '#F0D6B2' },
  { id: 'bagels', name: 'Bagels', section: 'Food', art: 'donut', tint: '#EED9B6' },
  { id: 'omelettes', name: 'Omelettes & eggs', section: 'Food', art: 'egg', tint: '#F6E6B4' },
  { id: 'benedicts', name: 'Benedicts', section: 'Food', art: 'egg', tint: '#F3DFB0' },
  { id: 'light-bites', name: 'Light bites', section: 'Food', art: 'salad', tint: '#EAE0BE' },
  { id: 'burgers', name: 'Burgers', section: 'Food', art: 'sandwich', tint: '#EBCBAE' },
  { id: 'paninis', name: 'Paninis, wraps & sandwiches', section: 'Food', art: 'sandwich', tint: '#E9D2B3' },
  { id: 'pizza-pasta', name: 'Pizza & pasta', section: 'Food', art: 'soup', tint: '#EDC3AE' },
  { id: 'pastries', name: 'Pastries & desserts', section: 'Sweets', art: 'cake', tint: '#F1D9C6' },
];

type Seed = [id: string, name: string, description: string, price: number, extra?: Partial<MenuItem>];
const DRINK = ['size', 'milk', 'temp', 'syrup', 'extras'];
const COLD = ['size', 'syrup'];
const EGGS = ['protein', 'cheese'];
const SAMPLE = { priceIsSample: true };

const seeds: Record<string, Seed[]> = {
  lattes: [
    ['couch-blend', 'The Couch Blend', 'App-only secret latte: spiced brown sugar, cinnamon and a double shot.', 7.25, { tags: ['app-only', 'new'], ...SAMPLE }],
    ['chai', 'Chai latte', 'Living Room signature and favorite: our delicious spiced chai.', 6.5, { tags: ['popular'] }],
    ['dirty-chai', 'Dirty chai latte', 'Chai latte with a double shot of espresso.', 7.25, { tags: ['popular'] }],
    ['spanish-latte', 'Spanish latte', 'Iced latte with condensed milk and oat milk, topped with cinnamon.', 6.5],
    ['vanilla-latte', 'Vanilla latte', 'Double shot, steamed milk and vanilla syrup.', 5.75],
    ['cafe-latte', 'Café latte', 'Double shot and silky steamed milk.', 4.75],
  ],
  espresso: [
    ['americano', 'Americano', 'Made with a coffee blend roasted especially for The Living Room.', 4],
    ['cafe-ca', 'Café CA', 'A Living Room house specialty.', 6],
  ],
  matcha: [
    ['matcha', 'Ceremonial matcha latte', 'Ceremonial-grade matcha sweetened with agave.', 6.75, { tags: ['vg'] }],
    ['earl-grey-matcha', 'Earl Grey matcha', 'Iced matcha with Earl Grey cold foam.', 7.25, { ...SAMPLE, tags: ['new'] }],
    ['cookie-butter-matcha', 'Cookie butter matcha', 'Matcha with Lotus cookie butter cold foam.', 7.5, SAMPLE],
  ],
  frappes: [
    ['mocha-frappe', 'Mocha frappe', 'Blended mocha, whipped cream.', 6.75],
    ['banana-mocha-frappe', 'Banana mocha frappe', 'Mocha blended with banana.', 6.5],
    ['cookie-catastrophe', 'Cookie Catastrophe', 'Blended cookies and cream.', 6.75, { tags: ['popular'] }],
    ['vanilla-bean-frappe', 'Vanilla bean frappe', 'Creamy blended vanilla bean.', 6.75],
    ['caramel-frappe', 'Caramel frappe', 'Blended caramel, whipped cream, caramel drizzle.', 6.75],
    ['pistachio-frappe', 'Pistachio frappe', 'Blended pistachio cream.', 6.75],
  ],
  refreshers: [
    ['green-lantern', 'Green Lantern', 'Green tea, lemonade and mango.', 5.5, { tags: ['vg', 'gf'] }],
    ['iced-lemonade', 'Iced lemonade', 'Fresh and bright.', 4.5, { ...SAMPLE, tags: ['vg', 'gf'] }],
    ['raspberry-mint', 'Raspberry mint refresher', 'Raspberry, mint, lots of ice.', 6.5, { ...SAMPLE, tags: ['vg', 'gf'] }],
    ['oj', 'Fresh orange juice', 'Orange juice, no pulp.', 7, { tags: ['vg', 'gf'] }],
  ],
  croissants: [
    ['breakfast-croissant', 'Breakfast croissant', 'Soft, flaky butter croissant, folded eggs, choice of protein and cheese.', 12, { tags: ['popular'], modifierGroups: EGGS }],
    ['sdsu-croissant', 'SDSU croissant', 'Flaky butter croissant, avocado, choice of protein, cheese and folded eggs.', 13, { modifierGroups: EGGS }],
    ['sob-croissant', 'SOB croissant', 'Buttery croissant, avocado, chorizo, pepper jack and folded eggs.', 13],
    ['aztec-melt', 'The Aztec Melt', 'Grilled sourdough, eggs, pepper jack, bacon, avocado and smoky chipotle mayo.', 14],
    ['turkey-croissant', 'Turkey & cheese croissant', 'House-baked turkey, bell peppers, onions and cheese with potato and fruit.', 12],
    ['quiche', 'Quiche Lorraine', 'House favorite. Savory French pie with bacon, eggs, cream and a buttery crust.', 13],
  ],
  burritos: [
    ['breakfast-burrito', 'Breakfast burrito', 'Tomato tortilla, eggs, choice of protein and cheese.', 12, { ...SAMPLE, modifierGroups: EGGS }],
    ['hashbrown-burrito', 'Hashbrown burrito', 'Eggs, choice of protein, cheddar and hashbrowns.', 12, { modifierGroups: ['protein'] }],
    ['chicken-sausage-burrito', 'Chicken sausage burrito', 'Chicken sausage, eggs, pepper jack, avocado, potato and chipotle mayo.', 14],
    ['cilantro-burrito', 'Cilantro burrito', 'Sweet and spicy cilantro dressing, chorizo, hashbrown, eggs, pepper jack and avocado.', 14],
    ['veggie-burrito', 'Veggie breakfast burrito', 'Scrambled eggs, veggie patties, cheese, diced potatoes and mashed avocado.', 13, { tags: ['v'] }],
  ],
  bagels: [
    ['bagel-cc', 'Bagel & cream cheese', 'Toasted bagel with cream cheese.', 4.25, { tags: ['v'] }],
    ['sunrise-bagel', 'Sunrise bagel', 'Folded eggs, choice of protein and cheese.', 12, { modifierGroups: EGGS }],
    ['hot-honey-bagel', 'Hot honey bagel', "Jalapeño cheddar bagel, whipped cream cheese, eggs, pepper jack, bacon and Mike's Hot Honey.", 13, { tags: ['popular'] }],
    ['smoked-salmon-bagel', 'Smoked salmon bagel', 'Cream cheese, lettuce, tomato, onions, cucumbers and capers.', 16],
    ['club-bagel', 'Club bagel', 'Chicken, bacon, avocado, tomato, lettuce and cream cheese.', 16],
  ],
  omelettes: [
    ['ca-omelette', 'CA omelette', 'House favorite. Tomatoes, bell peppers, onions, cheddar and avocado.', 17, { tags: ['v'] }],
    ['med-omelette', 'Mediterranean omelette', 'Spinach, olives, tomato and feta with potato or hashbrown and fruit.', 17, { tags: ['v'] }],
    ['denver-omelette', 'Denver omelette', 'Ham, bell peppers, onions and Swiss.', 17],
    ['works-omelette', 'Works omelette', 'Bacon, ham, tomatoes, bell peppers, onions and provolone.', 17],
    ['ranchero-omelette', 'Ranchero omelette', 'Bacon, mushrooms, jalapeños, onions, spicy ranchero sauce and pepper jack.', 17],
    ['byo-omelette', 'Build your own omelette', 'Choice of 4 toppings and cheese.', 19],
    ['two-eggs', '2 eggs any style', 'House potatoes or hashbrowns and bread.', 13],
  ],
  benedicts: [
    ['classic-benedict', 'Classic eggs Benedict', 'English muffin, Canadian bacon and house hollandaise with potato or hashbrown.', 16],
    ['lox-benedict', 'Lox Benedict', 'Cream cheese, smoked salmon, hollandaise, pickled red onions and capers.', 18],
    ['short-rib-benedict', 'Short rib eggs Benedict', 'Braised short rib, poached eggs and hollandaise on a toasted English muffin.', 19],
    ['ahi-benedict', 'Ahi tuna Benedict', 'Sashimi-grade seared ahi, arugula, garlic aioli and hollandaise.', 19],
  ],
  'light-bites': [
    ['wings', 'Buffalo hot wings', '6 house hot wings tossed in buffalo, ranch on the side.', 12],
    ['tenders', 'Chicken tenders & fries', '4 chicken tenders served with fries.', 12],
    ['truffle-fries', 'Truffle Parmesan fries', 'Crispy fries, truffle and Parmesan.', 7, { tags: ['v'] }],
    ['fries', 'French fries', 'Golden and salty.', 6, { tags: ['vg'] }],
    ['chips', 'Homemade chips basket', 'Made in house.', 6, { tags: ['vg'] }],
    ['quesadilla', 'Quesadilla', 'Melty cheese, grilled tortilla.', 9, { tags: ['v'] }],
    ['hummus', 'Homemade hummus', 'Creamy hummus, olive oil and warm pita.', 9, { tags: ['vg'] }],
  ],
  burgers: [
    ['cheeseburger', 'Cheeseburger', 'Lettuce, tomatoes, onions, 1000 Island and cheddar.', 15],
    ['mushroom-swiss', 'Mushroom Swiss burger', 'Sautéed mushrooms and onions, lettuce, tomatoes, garlic aioli and Swiss.', 16],
    ['sams-burger', "Sam's burger", 'Lettuce, onion, grilled tomato, house chipotle and pepper jack.', 17, { tags: ['popular'] }],
    ['garlic-bacon-burger', 'Garlic aioli bacon burger', 'Arugula, tomato, bacon, house garlic aioli and provolone.', 16],
    ['chipotle-chicken', 'Chipotle chicken sandwich', 'Honey mustard, lettuce, tomato, pickle, fried or grilled chicken and provolone on brioche, with fries.', 14],
    ['ahi-sandwich', 'Ahi tuna steak sandwich', 'Seared sashimi-grade ahi, arugula, tomato and house garlic aioli.', 18],
  ],
  paninis: [
    ['garlic-chicken-panini', 'Garlic aioli chicken panini', 'Grilled chicken, garlic aioli, arugula, tomato, bacon and provolone on sourdough, with chips and a pickle.', 16, { tags: ['popular'] }],
    ['santa-fe-panini', 'Santa Fe chicken panini', 'Grilled chicken, avocado, roasted bell pepper, grilled onions, chipotle mayo and pepper jack on sourdough.', 17],
    ['pesto-panini', 'Pesto chicken panini', 'Grilled chicken, house pesto, provolone, lettuce and tomatoes on French bread.', 16],
    ['caesar-wrap', 'Caesar chicken wrap', 'Grilled chicken, lettuce, Caesar dressing and Parmesan with chips and a pickle.', 13],
    ['buffalo-wrap', 'Spicy buffalo chicken wrap', 'Crispy chicken, buffalo sauce, ranch and greens.', 14, SAMPLE],
    ['ca-turkey', 'CA turkey', 'Turkey, avocado, Swiss, arugula, cucumber, mustard and raspberry vinaigrette, with chips and a pickle.', 13],
    ['tuna-melt', 'Grilled sourdough tuna melt', 'Sharp cheddar, house tuna, tomato, pickled onion and pickles.', 14],
    ['blt', 'BLT', 'Bacon, lettuce and tomato.', 12, SAMPLE],
  ],
  'pizza-pasta': [
    ['pesto-pizza', 'Pesto chicken pizza', '7-inch personal pizza with chicken, pesto and mozzarella.', 14, SAMPLE],
    ['lr-rigatoni', 'Living Room rigatoni', 'Signature LR sauce, sweet onion, Calabrian chillies and San Marzano tomato.', 17],
    ['shrimp-pasta', 'Spicy shrimp pasta', 'Red sauce, cherry tomato and cavatappi.', 19],
  ],
  pastries: [
    ['living-donut', 'Living donut', 'Glazed donut with vanilla ice cream and chocolate drizzle.', 12, { tags: ['v'] }],
    ['baklava', 'Baklava', 'Flaky layers, honey and nuts.', 5, { ...SAMPLE, tags: ['v'] }],
    ['macaroon', 'Chocolate coconut macaroon', 'Chewy coconut dipped in chocolate.', 4, { ...SAMPLE, tags: ['gf'] }],
    ['butter-croissant', 'Butter croissant', 'Baked fresh every morning.', 4.5, { ...SAMPLE, tags: ['v'] }],
  ],
};

const DRINK_CATS = ['lattes', 'espresso', 'matcha'];
const items: MenuItem[] = categories.flatMap((c) =>
  (seeds[c.id] ?? []).map(([id, name, description, price, extra]) => ({
    id, categoryId: c.id, name, description, price, art: c.art, tint: c.tint,
    modifierGroups: DRINK_CATS.includes(c.id) ? DRINK : c.id === 'frappes' || c.id === 'refreshers' ? COLD : undefined,
    ...extra,
  })),
);
items.find((i) => i.id === 'couch-blend')!.tint = '#2B1D16';

export const menu: Menu = {
  categories: categories.map(({ id, name, section }) => ({ id, name, section })),
  items,
  modifierGroups: [
    { id: 'size', name: 'Size', required: true, max: 1, options: [
      { id: 'reg', name: 'Regular', price: 0 }, { id: 'lg', name: 'Large', price: 0.75 }] },
    { id: 'milk', name: 'Milk', required: false, max: 1, options: [
      { id: 'whole', name: 'Whole', price: 0 }, { id: 'oat', name: 'Oat', price: 0.75 }, { id: 'almond', name: 'Almond', price: 0.75 }, { id: 'nonfat', name: 'Nonfat', price: 0 }] },
    { id: 'temp', name: 'Temperature', required: false, max: 1, options: [
      { id: 'hot', name: 'Hot', price: 0 }, { id: 'iced', name: 'Iced', price: 0 }, { id: 'xhot', name: 'Extra hot', price: 0 }] },
    { id: 'syrup', name: 'Flavor', required: false, max: 2, options: [
      { id: 'vanilla', name: 'Vanilla', price: 0.75 }, { id: 'caramel', name: 'Caramel', price: 0.75 }, { id: 'hazelnut', name: 'Hazelnut', price: 0.75 },
      { id: 'brown-sugar', name: 'Spiced brown sugar', price: 0.75 }, { id: 'pistachio', name: 'Pistachio', price: 0.75 }, { id: 'lavender', name: 'Lavender', price: 0.75 }, { id: 'sf-vanilla', name: 'Sugar-free vanilla', price: 0.75 }] },
    { id: 'extras', name: 'Extras', required: false, max: 2, options: [
      { id: 'shot', name: 'Extra shot', price: 1 }, { id: 'decaf', name: 'Make it decaf', price: 0 }] },
    { id: 'protein', name: 'Protein', required: true, max: 1, options: [
      { id: 'bacon', name: 'Bacon', price: 0 }, { id: 'ham', name: 'Ham', price: 0 }, { id: 'sausage', name: 'Sausage', price: 0 }, { id: 'turkey-bacon', name: 'Turkey bacon', price: 0 }] },
    { id: 'cheese', name: 'Cheese', required: false, max: 1, options: [
      { id: 'cheddar', name: 'Cheddar', price: 0 }, { id: 'swiss', name: 'Swiss', price: 0 }, { id: 'pepper-jack', name: 'Pepper jack', price: 0 }, { id: 'provolone', name: 'Provolone', price: 0 }] },
  ],
};

export const categoryArt = Object.fromEntries(categories.map((c) => [c.id, { art: c.art, tint: c.tint }]));
