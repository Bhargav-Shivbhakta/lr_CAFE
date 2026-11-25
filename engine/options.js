
// ---------- what can be changed on a dish ----------
// Drinks: the café's own online-order options at SDSU (Toast): milk choice, extra shots, half caff and flavor syrups, with their prices.
// Food: the choices the menu itself names (eggs, protein, cheese), free removals taken from each dish's ingredients,
// and paid extras priced from the café's own sides (avocado $3.00, bacon $4.00, an egg $2.25, fries $6.00…).
const DRK = new Set(['coffee-espresso', 'lattes', 'mochas', 'fall', 'teas', 'matcha', 'frappes', 'refreshers', 'smoothies', 'non-coffee']);
const P = (label, price) => ({ label, price: price || 0 });
function OPTS(it) {
  const c = it.c, n = it.n.toLowerCase(), G = [];
  const one = (key, name, choices, o = {}) => G.push({ key, name, type: 'one', choices, ...o });
  const many = (key, name, choices, o = {}) => G.push({ key, name, type: 'many', choices, ...o });
  if (DRK.has(c)) {
    const milky = ['lattes', 'mochas', 'matcha', 'fall'].includes(c) || /cappuccino|flat white|au lait|cortado|macchiato|steamer|hot chocolate|london fog|chai|tea au lait/.test(n);
    const fixedCold = /iced|cold brew|shaken|frappe|refresher|lemonade|juice|smoothie|soda|red bull|arnold palmer|thai|chocolate milk|cold milk/.test(n) || ['frappes', 'refreshers', 'smoothies'].includes(c);
    const espressoBased = ['lattes', 'mochas', 'fall', 'matcha'].includes(c) || /americano|cappuccino|flat white|cortado|macchiato|au lait|cold brew|iced coffee|house coffee|chai/.test(n);
    if (milky && !fixedCold) one('temp', 'Hot or iced', [P('Hot'), P('Iced')], { req: true, def: 'Hot' });
    if (milky) one('milk', 'Milk', [P('Whole milk'), P('2%'), P('Half & half'), P('Oat milk', 1), P('Almond milk', 1), P('Soy milk', 1), P('Coconut milk', 1), P('Heavy cream', 1.25)], { req: true, def: 'Whole milk' });
    if (espressoBased && !/refill/.test(n)) many('mods', 'Espresso', [P('Add single shot', 0.5), P('Add double shot', 1), P('Half caff')], { only1: ['Add single shot', 'Add double shot'] });
    if (espressoBased || c === 'teas' && !fixedCold) many('syrup', 'Add a flavor', [P('Vanilla', 0.75), P('Caramel', 0.75), P('Hazelnut', 0.75), P('Cinnamon', 0.75), P('Spiced brown sugar', 0.75)]);
  } else {
    if (it.f.includes('eggs')) one('eggs', 'Your eggs', [P('Scrambled'), P('Over easy'), P('Over medium'), P('Over hard'), P('Sunny side up')], { req: true });
    if (it.f.includes('protein')) one('protein', 'Your protein', [P('Bacon'), P('Sausage'), P('Ham'), P('Chorizo'), P('Turkey'), P('No protein')], { req: true });
    if (it.f.includes('cheese')) one('cheese', 'Your cheese', [P('Cheddar'), P('Pepper jack'), P('Swiss'), P('Provolone'), P('Mozzarella')], { req: true });
    const breakfast = ['burritos', 'bagels', 'croissants', 'omelettes', 'benedicts', 'skillets', 'light-breakfast', 'sweets-crepes'].includes(c);
    if (breakfast) many('extra', 'Add extras', [P('Avocado', 3), P('Bacon', 4), P('Sausage', 4), P('An egg', 2.25), P('Hash brown', 4)].filter((x) => !(n + ' ' + (it.d || '').toLowerCase()).includes(x.label.toLowerCase())));
    if (['burgers', 'traditional-sandwiches', 'signature-sandwiches', 'paninis', 'wraps', 'soups-salads', 'pizza', 'pastas'].includes(c))
      many('extra', 'Add extras', [P('Avocado', 3), P('Bacon', 4), P('An egg', 2.25)].filter((x) => !(n + ' ' + (it.d || '').toLowerCase()).includes(x.label.toLowerCase())));
    const parts = (it.d || '').toLowerCase().replace(/\(.*?\)/g, '').split(/,|&|\band\b|\bwith\b|\bon\b|\bserved\b|\btopped\b|\bin a\b/)
      .map((x) => x.trim().replace(/^(a|an|the|fresh|house|homemade|our|choice of)\s+/, '').replace(/\.$/, ''))
      .filter((x) => x && x.split(' ').length <= 3 && x.length > 2 && !/choice|side|bread|toast|plate|style|any|^\d|tortilla|\bbun\b|croissant|bagel|sourdough|wrap|\bor\b|protein|cheese of/.test(x));
    const uniq = [...new Set(parts)].slice(0, 6);
    if (uniq.length >= 2) many('out', 'Leave something out', uniq.map((x) => P('No ' + x)));
  }
  return G;
}
// goes well with: real dishes from the menu, at their menu price, added as their own line
function PAIR(it) {
  const c = it.c, n = it.n.toLowerCase();
  if (['burgers', 'traditional-sandwiches', 'signature-sandwiches', 'paninis', 'wraps'].includes(c) && !/fries/.test(n)) return ['fries', 'truffle-fries', 'chips'];
  if (['burritos', 'bagels', 'croissants', 'omelettes', 'benedicts', 'skillets', 'light-breakfast', 'sweets-crepes'].includes(c)) return ['side-bacon', 'side-hashbrown', 'side-avocado'];
  if (c === 'soups-salads') return /soup/.test(n) ? ['side-avocado', 'blueberry-scone'] : ['cup-soup', 'side-avocado'];
  if (['pizza', 'pastas', 'light-bites'].includes(c)) return ['truffle-fries', 'choc-chip-cookie'];
  if (DRK.has(c)) return ['choc-chip-cookie', 'blueberry-scone', 'plain-croissant'];
  if (c === 'pastries') return ['cafe-latte', 'house-coffee'];
  return [];
}
