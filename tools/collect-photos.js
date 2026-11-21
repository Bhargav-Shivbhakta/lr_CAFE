// Living Room photo collector — paste into Chrome DevTools Console on
// https://order.toasttab.com/online/thelivingroomsdsu
// It only READS the page: scrolls through the menu so every photo loads,
// then copies a list of { name, image } to your clipboard. Nothing is sent anywhere.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // 1. Scroll to the bottom slowly so lazy-loaded photos appear.
  let last = -1;
  for (let i = 0; i < 400 && window.scrollY !== last; i++) {
    last = window.scrollY;
    window.scrollBy(0, 600);
    await sleep(250);
  }
  await sleep(1500);

  // 2. Find every photo: <img> tags and CSS background images.
  const urlOf = (el) => {
    if (el.tagName === 'IMG') return el.currentSrc || el.src || el.dataset.src || '';
    const m = getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    return m ? m[1] : '';
  };
  const els = [...document.querySelectorAll('img, [style*="background"], div, span')]
    .filter((el) => /^https?:/.test(urlOf(el)) && !/\.svg|logo|icon|banner|header/i.test(urlOf(el)));

  // 3. For each photo, find the menu item it belongs to (the nearest card that shows a $ price).
  const isPrice = (t) => /^\$?\d+(\.\d{2})?\+?$/.test(t.replace(/\s/g, ''));
  const found = new Map();
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (el.tagName === 'IMG' && (el.naturalWidth || r.width) < 60) continue;
    let node = el;
    for (let up = 0; up < 7 && node; up++, node = node.parentElement) {
      const text = (node.innerText || '').trim();
      if (!text.includes('$')) continue;
      const name = text.split('\n').map((t) => t.replace(/\s*\$\s*\d[\d.,]*\+?.*$/, '').trim())
        .find((t) => t.length > 1 && t.length < 70 && !isPrice(t) && !/^(featured|popular|out of stock|add)/i.test(t));
      if (name && !found.has(name)) found.set(name, urlOf(el));
      break;
    }
  }

  const list = [...found].map(([name, image]) => ({ name, image }));
  const json = JSON.stringify(list, null, 1);
  try { copy(json); console.log(`%cCopied ${list.length} photos to your clipboard. Paste them into the chat.`, 'color:green;font-size:16px'); }
  catch { console.log(json); console.log(`Found ${list.length} photos. Copy the text above.`); }
  return list.length;
})();
