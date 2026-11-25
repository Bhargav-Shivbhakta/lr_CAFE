
// ---------- search: understands what people type ----------
const STOP = new Set('i im want wanna a an the with and some something me give show for of to please any like get have do you got what whats is are can could would need looking my in on at from that this one or also just food'.split(' '));
const SYN = { cold: ['iced', 'cold', 'frappe'], ice: ['iced'], frozen: ['frappe', 'blended', 'smoothie'], shake: ['frappe', 'smoothie'], dessert: ['pastry', 'cookie', 'brownie', 'crepe', 'waffle', 'muffin'],
  sweet: ['pastry', 'cookie', 'mocha', 'pancake', 'crepe', 'waffle', 'muffin', 'brownie'], treat: ['pastry', 'cookie', 'brownie'], healthy: ['salad', 'bowl', 'fruit', 'granola', 'light', 'smoothie'], light: ['salad', 'bowl', 'fruit', 'light', 'soup'],
  meat: ['bacon', 'sausage', 'ham', 'steak', 'beef', 'chicken', 'turkey', 'chorizo', 'pastrami', 'salami'], pork: ['bacon', 'ham', 'sausage', 'chorizo', 'pepperoni'], beef: ['burger', 'steak', 'beef', 'rib', 'bolognese'],
  fish: ['salmon', 'tuna', 'shrimp', 'ahi', 'lox'], seafood: ['shrimp', 'salmon', 'tuna', 'ahi', 'lox'], spicy: ['chipotle', 'jalapeno', 'buffalo', 'diavola', 'honey', 'spicy', 'chorizo', 'ranchero', 'cajun', 'sriracha'],
  hot: ['hot', 'house', 'espresso', 'americano', 'cappuccino', 'latte', 'tea'], warm: ['hot', 'soup', 'latte'], noodle: ['pasta', 'rigatoni', 'alfredo', 'tortellini'], pasta: ['pasta', 'rigatoni', 'alfredo', 'bolognese'],
  dinner: ['lunch'], supper: ['lunch'], drink: ['drink'], drinks: ['drink'], caffeine: ['coffee', 'espresso', 'redbull', 'tea'], energy: ['redbull', 'espresso', 'coffee'], fruit: ['fruit', 'berry', 'banana', 'strawberry', 'orange', 'apple', 'smoothie', 'juice'],
  cheesy: ['cheese', 'cheesy', 'parmesan', 'mozzarella', 'alfredo', 'cheddar', 'swiss', 'provolone', 'feta', 'melt'], egg: ['egg', 'omelette', 'benedict', 'skillet'], bread: ['bagel', 'croissant', 'toast', 'bread'], snack: ['snack', 'fries', 'chips', 'cookie', 'hummus'],
  sandwich: ['sandwich', 'sub', 'panini', 'melt', 'club', 'blt'], chocolate: ['chocolate', 'mocha', 'nutella', 'brownie'], milk: ['milk', 'latte', 'steamer'], green: ['matcha', 'green', 'salad'], veggie: ['veggie', 'vegetarian', 'vegan'] };
// things we don't sell: say so, and point at the nearest thing we do
const SIMILAR = { sushi: ['Salmon', 'Ahi tuna', 'Shrimp'], poke: ['Ahi tuna', 'Salmon salad'], ramen: ['Soup', 'Pasta'], pho: ['Soup'], taco: ['Burrito', 'Quesadilla'], nacho: ['Quesadilla', 'Chips'],
  boba: ['Thai tea', 'Matcha', 'Iced tea'], decaf: ['Tea', 'Hot chocolate', 'Steamer'], donut: ['Muffin', 'Croissant', 'Cookie'], doughnut: ['Muffin', 'Croissant', 'Cookie'], cake: ['Brownie', 'Muffin', 'Cookie'],
  icecream: ['Frappe', 'Smoothie'], gelato: ['Frappe', 'Smoothie'], kid: ['Grilled cheese', 'Pancakes', 'Chicken tenders', 'Hot chocolate'], hotdog: ['Burger', 'Sandwich'], 'fried chicken': ['Chicken tenders', 'Wings'],
  beer: ['Italian soda', 'Red Bull', 'Lemonade'], wine: ['Italian soda', 'Hibiscus refresher'], soda: ['Italian soda', 'Red Bull', 'Lemonade'], bagel: ['Bagel'], oatmeal: ['Granola', 'Acai bowl'], yogurt: ['Granola', 'Acai bowl', 'Fruit bowl'],
  steak: ['Steak sandwich'], rice: ['Skillet', 'Burrito'], curry: ['Shakshouka', 'Soup'], dumpling: ['Quesadilla'], noodle: ['Pasta'], 'mac cheese': ['Chicken Alfredo', 'Grilled cheese', 'Quesadilla'], maccheese: ['Chicken Alfredo', 'Grilled cheese', 'Quesadilla'] };
const DIET = { vegan: 'vg', vegetarian: 'v', veg: 'v', veggie: 'v', 'gluten-free': 'gf', glutenfree: 'gf', gf: 'gf' };
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/®/g, '').replace(/[^a-z0-9$.\s-]/g, ' ');
const sing = (w) => w.length > 4 && /(ches|shes|xes|oes)$/.test(w) ? w.slice(0, -2) : w.length > 3 && w.endsWith('ies') ? w.slice(0, -3) + 'y' : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w;
function lev(a, b) { if (Math.abs(a.length - b.length) > 2) return 9; const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] ? d[i - 2][j - 2] + 1 : 9); return d[a.length][b.length]; }
const words = (s) => norm(s).split(/[\s-]+/).filter(Boolean).map(sing);
const INDEX = ITEMS.map((it) => { const w = WHERE[it.id] || ['', '', '']; const meal = w[0] === 'Drinks' ? 'drink beverage' : w[0];
  const fields = [[words(it.n), 5], [words(w[1] + ' ' + w[2] + ' ' + (CATNAME[it.c] || '')), 3], [words(meal), 3], [words(KEYS[it.id] || ''), 2], [words(it.d), 2]];
  return { it, fields }; });
const VOCAB = [...new Set(INDEX.flatMap((x) => x.fields[0][0].concat(x.fields[1][0])))].filter((w) => w.length > 2);
function hit(token, fields) { let best = 0;
  for (const [ws, wt] of fields) for (const w of ws) {
    let s = 0; if (w === token) s = 1; else if (token.length >= 3 && w.startsWith(token)) s = 0.8; else if (w.length >= 4 && token.startsWith(w)) s = 0.7;
    else if (token.length >= 5 && lev(token, w) <= (token.length >= 7 ? 2 : 1)) s = 0.6;
    if (s * wt > best) best = s * wt; }
  return best; }
function search(raw) {
  let q = norm(raw), max = null, notes = [], diets = [];
  const pm = q.match(/(under|below|less than|cheaper than|max|up to|<)\s*\$?\s*(\d+(\.\d+)?)/); if (pm) { max = +pm[2]; q = q.replace(pm[0], ' '); notes.push('under $' + pm[2]); }
  if (/\bcheap(est)?\b|\bbudget\b|\baffordable\b/.test(q)) { max = max || 8; q = q.replace(/\bcheap(est)?\b|\bbudget\b|\baffordable\b/g, ' '); notes.push('under $8'); }
  q = q.replace(/gluten[\s-]*free/g, 'gluten-free').replace(/\bno meat\b|\bmeatless\b|\bplant[\s-]*based\b/g, 'vegetarian').replace(/\bdairy[\s-]*free\b/g, 'vegan');
  let toks = q.split(/\s+/).filter(Boolean).filter((t) => !STOP.has(t));
  toks = toks.filter((t) => { if (DIET[t] && !(t === 'veggie' && toks.length > 1 && /burrito|crepe|wrap|patty|bagel|pizza|omelet/.test(q))) { diets.push(DIET[t]); return false; } return true; }).map(sing);
  diets = [...new Set(diets)]; diets.forEach((d) => notes.push({ vg: 'vegan', v: 'vegetarian', gf: 'gluten-free' }[d]));
  const okDiet = (it) => diets.every((d) => d === 'v' ? it.f.includes('v') || it.f.includes('vg') : it.f.includes(d)) && (max == null || it.p <= max);
  const score = (x, mode) => { let total = 0, n = 0;
    for (const t of toks) { const alts = [t].concat(SYN[t] || []); const s = Math.max(...alts.map((a) => hit(a, x.fields) * (a === t ? 1 : 0.6)));
      if (s > 0) { total += s; n++; } else if (mode === 'all') return 0; }
    return mode === 'all' ? total : (n ? total * n / toks.length : 0); };
  const pool = INDEX.filter((x) => okDiet(x.it));
  const rankS = (mode) => pool.map((x) => ({ it: x.it, s: toks.length ? score(x, mode) : 1 })).filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || (b.it.f.includes('p') - a.it.f.includes('p')) || a.it.p - b.it.p);
  const cut = (l) => { if (!l.length || !toks.length) return l.map((r) => r.it); const top = l[0].s; return l.filter((r) => r.s >= top * 0.55).map((r) => r.it); };
  let list = cut(rankS('all')), partial = false;
  const joined = toks.join(' '), flat = toks.join('');
  const sim = SIMILAR[joined] || SIMILAR[flat] || toks.map((t) => SIMILAR[t]).find(Boolean) || null;
  if (sim && !toks.every((t) => VOCAB.includes(t))) list = [];          // e.g. 'boba tea': don't pretend plain tea is boba
  if (!list.length && toks.length > 1 && !sim) { list = cut(rankS('any')); partial = list.length > 0; }
  const near = sim || toks.map((t) => VOCAB.map((w) => [w, lev(t, w)]).filter(([w, d]) => t.length >= 4 && d <= Math.max(1, Math.floor(t.length / 3))).sort((a, b) => a[1] - b[1])[0]).filter(Boolean).map(([w]) => w);
  return { list, partial, notes, toks, near };
}
