// The cup's everyday moves, shared by the library page and the app mockup.
const Cup = ((POSE) => {
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);
const an = (el, fr, ms, o = {}) => (el && el.animate ? el.animate(fr, { duration: ms, fill: 'forwards', easing: 'cubic-bezier(.3,.7,.4,1)', ...o }).finished.catch(() => {}) : Promise.resolve());
const SPR = 'cubic-bezier(.34,1.56,.64,1)';

// A stage is a banner box with one cup in it. Every run gets a fresh handle; starting another run
// makes the old one go quiet, so there is only ever one cup doing one thing.
function bind(box, cup = box.querySelector('.cup'), opts = {}) {
  const g = (cup.gen = (cup.gen || 0) + 1), alive = () => cup.gen === g && cup.isConnected;
  const s = {
    box, cup, alive, opts,
    set(k, cls = 'pip--idle') { if (!alive()) return null; cup.innerHTML = POSE[k].replace('class=""', `class="pip ${cls}"`); return cup.querySelector('svg'); },
    q: (sel) => cup.querySelector(sel),
    an: (el, fr, ms, o) => (alive() ? an(el, fr, ms, o) : Promise.resolve()),
    wait: (ms) => wait(ms),
    pt(x, y) { const br = box.getBoundingClientRect(), r = cup.querySelector('svg').getBoundingClientRect(); return [r.left - br.left + ((x + 10) / 140) * r.width, r.top - br.top + ((y + 8) / 140) * r.height]; },
    fx(html, css, life) { if (!alive()) return document.createElement('div'); const d = document.createElement('div'); d.className = 'fx'; d.style.cssText = 'position:absolute;' + css; d.innerHTML = html; box.appendChild(d); if (life) setTimeout(() => d.remove(), life); return d; },
    pillPos() { if (opts.pill !== 'cup') return 'left:8px;right:8px;bottom:10px;text-align:center'; const br = box.getBoundingClientRect(), r = cup.getBoundingClientRect(); return `right:${Math.max(8, br.right - r.right)}px;top:${r.bottom - br.top + 4}px;text-align:right;max-width:${br.width - 16}px`; },
    pill(text, ms = 1800) { const d = s.fx(`<span class="pill">${text}</span>`, s.pillPos() + ';opacity:0', ms + 400); an(d, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none', offset: .15 }, { opacity: 1, offset: .85 }, { opacity: 0 }], ms + 300); return d; },
    part(kind, col, x, y, size, fr, ms, delay = 0) { const [px, py] = s.pt(x, y); const d = s.fx(SHAPE[kind](col), `left:${px}px;top:${py}px;width:${size}px;height:${size}px;opacity:0;pointer-events:none`, ms + delay + 60); an(d, fr, ms, { delay }); },
    sparkle(n = 6) { for (let i = 0; i < n; i++) { const a = rnd(0, Math.PI * 2), r = rnd(30, 60); s.part('star', ['#C9A24B', '#E2C27E', '#FFFFFF'][i % 3], 60, 60, rnd(7, 11), [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, offset: .3 }, { opacity: 0, transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) scale(1)` }], 900, i * 60); } },
    move(fr, ms, o) { return s.an(cup, fr, ms, o); },
  };
  return s;
}
function reset(box, cup = box.querySelector('.cup')) { cup.gen = (cup.gen || 0) + 1; box.querySelectorAll('.fx').forEach((e) => e.remove()); cup.getAnimations?.({ subtree: true }).forEach((a) => a.cancel()); cup.style.transform = ''; }
const SHAPE = {
  star: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 1q2 9 11 11q-9 2-11 11q-2-9-11-11q9-2 11-11z" fill="${c}"/></svg>`,
  note: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M9 18a3 3 0 1 1-2-2.8V4l12-2v13a3 3 0 1 1-2-2.8V6.3L9 7.6z" fill="${c}"/></svg>`,
  drop: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2q7 9 7 14a7 7 0 0 1-14 0q0-5 7-14z" fill="${c}"/></svg>`,
  heart: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill="${c}"/></svg>`,
  puff: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="10" fill="${c}"/></svg>`,
};
const pp = (s) => s.q('.pp');
const latteHeart = (s) => s.q('path[fill="#B07A4A"]');

// ---------------- the library ----------------
const MOVES = [
  // always on
  { id: 'breathe', layer: 'always', name: 'Breathe and blink', when: 'All the time', len: 'Loops', desc: 'The base under everything. A slow breath, a blink every few seconds, eyes drifting. It is never a frozen picture.',
    run: async (s) => { s.set('idle'); await s.wait(5200); } },
  { id: 'steam', layer: 'always', name: 'Steam curl', when: 'All the time', len: 'Loops', desc: 'Soft puffs of steam rise from the cup, so it always looks freshly poured.',
    run: async (s) => { s.set('steam'); for (let i = 0; i < 3 && s.alive(); i++) await s.an(s.q('.puffs'), [{ opacity: 0, transform: 'translateY(10px) scale(.8)' }, { opacity: 1, offset: .3 }, { opacity: 0, transform: 'translateY(-26px) scale(1.15)' }], 1700, { fill: 'none' }); } },
  { id: 'follow', layer: 'always', name: 'Eyes follow you', when: 'When you touch or scroll', len: 'Live', desc: 'Its eyes follow your finger and your scrolling. Try moving your pointer over this card.',
    run: async (s) => { s.set('idle', ''); const dot = s.fx('', 'width:14px;height:14px;border-radius:7px;background:rgba(43,29,22,.25);left:0;top:0;pointer-events:none'); const W = s.box.clientWidth, H = s.box.clientHeight, t0 = performance.now();
      await new Promise((res) => { const step = (t) => { const k = (t - t0) / 4200; if (k > 1 || !s.alive()) { dot.remove(); return res(); } const x = W * (0.12 + 0.36 * (1 + Math.sin(k * 6.28 * 1.3)) / 1), y = H * (0.25 + 0.25 * (1 + Math.cos(k * 6.28)));
        dot.style.transform = `translate(${x}px,${y}px)`; look(s, x, y); requestAnimationFrame(step); }; requestAnimationFrame(step); }); } },
  // fidgets
  { id: 'look', layer: 'fidget', name: 'Looks around', when: 'Any time', len: '2.5 s', desc: 'Glances left, then right, like it heard something across the room.',
    run: async (s) => { s.set('idle'); await s.an(pp(s), [{ transform: 'none' }, { transform: 'translate(-4px,-1px)', offset: .2 }, { transform: 'translate(-4px,-1px)', offset: .42 }, { transform: 'translate(4px,-1px)', offset: .6 }, { transform: 'translate(4px,-1px)', offset: .82 }, { transform: 'none' }], 2500, { easing: 'ease-in-out' }); } },
  { id: 'glance', layer: 'fidget', name: 'Glances at you', when: 'Any time', len: '2 s', desc: 'Leans in a little, looks straight at you, and winks.',
    run: async (s) => { s.set('idle'); await s.an(s.q('.pw'), [{ transform: 'none' }, { transform: 'translateY(-3px) scale(1.05)' }], 500, { easing: SPR }); s.set('wink', ''); s.q('.pw').style.transform = 'translateY(-3px) scale(1.05)'; await s.wait(800); s.set('idle'); await s.an(s.q('.pw'), [{ transform: 'translateY(-3px) scale(1.05)' }, { transform: 'none' }], 400); } },
  { id: 'tilt', layer: 'fidget', name: 'Head tilt', when: 'Any time', len: '2 s', desc: 'A curious tilt to one side, a pause, and back. Like asking "what are you having?"',
    run: async (s) => { s.set('idle'); await s.an(s.q('.pw'), [{ transform: 'none' }, { transform: 'rotate(9deg)', offset: .25 }, { transform: 'rotate(9deg)', offset: .65 }, { transform: 'rotate(-3deg)', offset: .85 }, { transform: 'none' }], 2000, { easing: 'ease-in-out' }); } },
  { id: 'tap', layer: 'fidget', name: 'Foot tap', when: 'Lunch rush, waiting', len: '1.5 s', desc: 'Taps one foot to a beat, a little impatient during the busy hours.',
    run: async (s) => { s.set('idle'); const f = s.q('ellipse[cx="73"][cy="114"]'); f.style.cssText = 'transform-box:fill-box;transform-origin:0% 100%'; await s.an(f, [{ transform: 'none' }, { transform: 'translateY(-5px) rotate(-14deg)' }, { transform: 'none' }], 380, { iterations: 4, fill: 'none' }); } },
  { id: 'handle', layer: 'fidget', name: 'Handle wiggle', when: 'Any time', len: '1.2 s', desc: 'Wiggles its handle like a little wave of the hand.',
    run: async (s) => { s.set('idle'); const h = s.q('path[d^="M100 54"]'); h.style.cssText = 'transform-box:fill-box;transform-origin:0% 50%'; await s.an(h, [{ transform: 'none' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(10deg)' }, { transform: 'none' }], 600, { iterations: 2, fill: 'none' }); } },
  { id: 'sniff', layer: 'fidget', name: 'Smells the coffee', when: 'Morning, evening', len: '2.5 s', desc: 'Closes its eyes, breathes in its own aroma, and smiles.',
    run: async (s) => { s.set('sniff', ''); s.an(s.q('.pw'), [{ transform: 'none' }, { transform: 'scale(1.05,1.08)' }], 900, { easing: 'ease-in-out' }); await s.an(s.q('.puffs'), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1 }], 900); s.set('sniff2', ''); s.q('.pw').style.transform = 'scale(1.05,1.08)'; await s.an(s.q('.pw'), [{ transform: 'scale(1.05,1.08)' }, { transform: 'none' }], 700, { easing: SPR }); await s.wait(900); } },
  { id: 'drip', layer: 'fidget', name: 'Oops, a drip', when: 'Afternoon', len: '2.6 s', desc: 'Notices a drip running down its side, wobbles, and shakes it off.',
    run: async (s) => { s.set('drip', 'pip--oops'); await s.wait(2600); } },
  { id: 'stretch', layer: 'fidget', name: 'Stretch', when: 'Morning', len: '3.5 s', desc: 'A big slow stretch with both arms up, then settles.',
    run: async (s) => { s.set('stretch', 'pip--stretch'); await s.wait(3600); } },
  { id: 'yawn', layer: 'fidget', name: 'Yawn', when: 'Early morning, late evening', len: '2 s', desc: 'A wide yawn with arms up. Only in the first hours and late at night.',
    run: async (s) => { s.set('yawn', ''); const m = s.q('.pmo'); await s.an(m, [{ transform: 'scale(1)' }, { transform: 'scale(1.9,2.3)', offset: .45 }, { transform: 'scale(1.9,2.3)', offset: .7 }, { transform: 'scale(1)' }], 1800, { easing: 'ease-in-out' }); s.set('idle'); } },
  // café moments
  { id: 'latte', layer: 'moment', name: 'Latte art', when: 'Morning, afternoon', len: '4 s', desc: 'Stirs its own foam with a spoon until a latte-art heart appears on top. Sparkle, proud smile.',
    run: async (s) => { s.set('latte', ''); const h = latteHeart(s); h.style.opacity = 0; await s.an(s.q('.spoon'), [{ transform: 'none' }, { transform: 'translate(-12px,1.5px)' }, { transform: 'translate(-24px,0)' }, { transform: 'translate(-12px,-1.5px)' }, { transform: 'none' }], 700, { iterations: 3, fill: 'none', easing: 'linear' });
      await s.an(s.q('.spoon'), [{ opacity: 1 }, { opacity: 0, transform: 'translate(16px,-16px)' }], 300); s.set('latte2', ''); const h2 = latteHeart(s); h2.style.cssText = 'transform-box:fill-box;transform-origin:50% 50%'; await s.an(h2, [{ transform: 'scale(0)' }, { transform: 'scale(2)' }, { transform: 'scale(1.4)' }], 600, { easing: SPR }); s.sparkle(); await s.wait(1300); } },
  { id: 'pour', layer: 'moment', name: 'Barista pour', when: 'Morning, lunch', len: '4 s', desc: 'A steel milk pitcher swoops in and pours into the cup. It watches, then beams with a fresh heart on top.',
    run: async (s) => { s.set('pourA', ''); latteHeart(s).style.opacity = 0; const p = s.q('.pitcher'); await s.an(p, [{ opacity: 0, transform: 'translate(30px,-24px) rotate(30deg)' }, { opacity: 1, transform: 'none' }], 600, { easing: SPR });
      await s.an(s.q('.stream'), [{ strokeDashoffset: 60 }, { strokeDashoffset: 0 }], 350, { easing: 'linear' }); s.an(s.q('.pw'), [{ transform: 'none' }, { transform: 'translateY(2px) scale(1.03,.97)' }, { transform: 'none' }], 500, { iterations: 2, fill: 'none' }); await s.wait(1000);
      await s.an(s.q('.stream'), [{ strokeDashoffset: 0 }, { strokeDashoffset: -60 }], 300, { easing: 'linear' }); await s.an(p, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate(30px,-24px) rotate(30deg)' }], 400);
      s.set('pourB', ''); const h = latteHeart(s); h.style.cssText = 'transform-box:fill-box;transform-origin:50% 50%'; await s.an(h, [{ transform: 'scale(0)' }, { transform: 'scale(1.8)' }, { transform: 'scale(1.3)' }], 500, { easing: SPR }); await s.wait(1100); } },
  { id: 'paper', layer: 'moment', name: 'Morning paper', when: 'Morning', len: '4.5 s', desc: 'Reads a tiny "LR Daily", eyes scanning the lines over the top, then lowers it and winks.',
    run: async (s) => { s.set('paper', ''); await s.an(s.q('.paper'), [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], 600, { easing: SPR });
      for (let i = 0; i < 2 && s.alive(); i++) await s.an(pp(s), [{ transform: 'translate(-4px,2px)' }, { transform: 'translate(4px,2px)' }], 800, { easing: 'ease-in-out', fill: 'none' });
      await s.an(s.q('.paper'), [{ transform: 'none' }, { transform: 'rotate(-3deg)' }, { transform: 'none' }], 400, { fill: 'none' }); await s.wait(400);
      await s.an(s.q('.paper'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(30px)' }], 500); s.set('wink', ''); await s.wait(900); } },
  { id: 'name', layer: 'moment', name: 'Your name on the cup', when: 'When you have an account', len: '4 s', desc: 'Writes your name on itself with a marker, like a barista does, then gives you a thumbs-up.',
    run: async (s) => { s.set('name', ''); const t = s.q('.name'), m = s.q('.marker'); await s.an(m, [{ opacity: 0, transform: 'translate(-36px,-10px)' }, { opacity: 1, transform: 'translate(-36px,0)' }], 300);
      s.an(m, [{ transform: 'translate(-36px,0)' }, { transform: 'translate(-28px,-3px)' }, { transform: 'translate(-20px,1px)' }, { transform: 'translate(-12px,-3px)' }, { transform: 'translate(-4px,1px)' }, { transform: 'translate(0,0)' }], 1500, { easing: 'linear' });
      await s.an(t, [{ clipPath: 'inset(-4px 100% -4px 0)' }, { clipPath: 'inset(-4px 0 -4px 0)' }], 1500, { easing: 'linear' }); await s.wait(200); s.set('nameDone', 'pip--thumb'); s.sparkle(4); await s.wait(1800); } },
  { id: 'special', layer: 'moment', name: "Today's special", when: 'Lunch', len: '5.5 s', desc: "Carries today's special on a tray across the banner, stops to show it off, and walks on. Tap it and it opens the dish.",
    travel: true,
    run: async (s) => { const br = s.box.getBoundingClientRect(), W = br.width, home = 0, cw = s.cup.getBoundingClientRect().left - br.left; s.set('idle', 'pip--hop'); await s.wait(250);
      await s.move([{ transform: 'none' }, { transform: `translateX(${W - cw + 20}px)` }], 450, { easing: 'ease-in' }); s.set('tray', ''); s.cup.firstElementChild.classList.add('waddle');
      await s.move([{ transform: `translateX(${W - cw + 20}px)` }, { transform: `translateX(${W / 2 - cw - 50}px)` }], 1500, { easing: 'ease-out' });
      s.pill(`Today's special<small>${s.opts.special || 'Short rib grilled cheese'}</small>`, 1500); await s.an(s.q('.tray'), [{ transform: 'none' }, { transform: 'translateY(-8px)' }, { transform: 'none' }], 700, { easing: SPR, fill: 'none' }); await s.wait(800);
      s.set('tray', ''); s.cup.firstElementChild.classList.add('waddle'); await s.move([{ transform: `translateX(${W / 2 - cw - 50}px)` }, { transform: `translateX(${-cw - 140}px)` }], 1200, { easing: 'ease-in' });
      s.set('idle'); await s.move([{ transform: `translateX(${-cw - 140}px)` }, { transform: `translateX(${home}px)` }], 900, { easing: 'cubic-bezier(.2,.8,.2,1)' }); s.cup.getAnimations().forEach((a) => a.cancel()); s.set('idle', 'pip--squish'); await s.wait(700); } },
  { id: 'wipe', layer: 'moment', name: 'Wipes the counter', when: 'Evening', len: '3.5 s', desc: 'Polishes the counter with a towel until it shines, then a satisfied nod.',
    run: async (s) => { s.set('wipe', ''); await s.an(s.q('.wiper'), [{ transform: 'none' }, { transform: 'translate(-30px,2px)' }], 340, { iterations: 6, direction: 'alternate', fill: 'none', easing: 'ease-in-out' });
      s.part('star', '#FFFFFF', 100, 118, 14, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1.2)' }, { opacity: 0, transform: 'scale(.6)' }], 700); s.set('happy', 'pip--thumb'); await s.wait(1400); } },
  { id: 'music', layer: 'moment', name: 'Headphones', when: 'Afternoon', len: '4 s', desc: 'Puts on headphones and sways to the café playlist, eyes closed, little music notes floating up.',
    run: async (s) => { s.set('music', ''); const pw = s.q('.pw'); s.an(pw, [{ transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg) translateY(-2px)' }], 450, { iterations: 8, direction: 'alternate', easing: 'ease-in-out', fill: 'none' });
      for (let i = 0; i < 6 && s.alive(); i++) { s.part('note', ['#8C5A3C', '#C9A24B'][i % 2], i % 2 ? 108 : 2, 50, 15, [{ opacity: 0, transform: 'none' }, { opacity: 1, offset: .2 }, { opacity: 0, transform: `translate(${i % 2 ? 14 : -14}px,-46px) rotate(${i % 2 ? 20 : -20}deg)` }], 1500); await s.wait(600); } } },
  { id: 'laptop', layer: 'moment', name: 'Study break', when: 'Afternoon at College Area', len: '4 s', desc: 'Types away on a tiny laptop, then throws its arms up: done! Fits the SDSU crowd.',
    run: async (s) => { s.set('laptop', ''); await s.an(s.q('.laptop'), [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], 450, { easing: SPR });
      s.an(s.q('circle.al'), [{ transform: 'none' }, { transform: 'translateY(-3px)' }], 120, { iterations: 14, direction: 'alternate', fill: 'none' }); s.an(s.q('circle.ar'), [{ transform: 'translateY(-3px)' }, { transform: 'none' }], 140, { iterations: 12, direction: 'alternate', fill: 'none' });
      await s.an(pp(s), [{ transform: 'translate(-3px,3px)' }, { transform: 'translate(3px,3px)' }], 600, { iterations: 3, direction: 'alternate', fill: 'none' }); s.set('laptopDone', 'pip--hop'); await s.wait(1500); } },
  { id: 'refill', layer: 'moment', name: 'Refill', when: 'Afternoon, evening', len: '4 s', desc: 'Notices it is running low. A coffee pot comes in and tops it up. Happy sigh, steam returns.',
    run: async (s) => { s.set('empty', ''); await s.an(s.q('.pw'), [{ transform: 'none' }, { transform: 'rotate(-6deg)' }, { transform: 'none' }], 700, { fill: 'none' }); const p = s.q('.pot');
      await s.an(p, [{ opacity: 0, transform: 'translate(30px,-20px) rotate(25deg)' }, { opacity: 1, transform: 'none' }], 550, { easing: SPR }); await s.an(s.q('.stream'), [{ strokeDashoffset: 60 }, { strokeDashoffset: 0 }], 300, { easing: 'linear' }); await s.wait(1000);
      await s.an(s.q('.stream'), [{ strokeDashoffset: 0 }, { strokeDashoffset: -60 }], 300, { easing: 'linear' }); await s.an(p, [{ opacity: 1 }, { opacity: 0, transform: 'translate(30px,-20px) rotate(25deg)' }], 350); s.set('full', 'pip--squish'); await s.wait(1300); } },
  { id: 'sugar', layer: 'moment', name: 'Sugar cube', when: 'Any time', len: '3 s', desc: 'Holds up a sugar cube, drops it in with a little splash, and its eyes go starry.',
    run: async (s) => { s.set('sugar', ''); await s.wait(500); await s.an(s.q('.cube'), [{ transform: 'none' }, { transform: 'translate(-24px,-16px) rotate(-90deg)', offset: .45 }, { transform: 'translate(-48px,28px) rotate(-200deg)', opacity: 1, offset: .9 }, { transform: 'translate(-48px,34px) rotate(-200deg)', opacity: 0 }], 800, { easing: 'ease-in' });
      for (let i = 0; i < 6; i++) s.part('drop', '#8C5A3C', 58, 34, 7, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${(i - 2.5) * 9}px,${-rnd(14, 26)}px)` }], 500); s.set('sugar2', 'pip--squish'); await s.wait(1600); } },
  // big
  { id: 'dance', layer: 'big', name: 'Little shuffle dance', when: 'Afternoon, rarely', len: '3 s', desc: 'A short happy shuffle with arms up and music notes. At most once every few minutes.',
    run: async (s) => { const svg = s.set('dance', 'pip--dance'); svg.style.setProperty('--pip-plays', 3); for (let i = 0; i < 4; i++) s.part('note', '#C9A24B', i % 2 ? 110 : 0, 40, 14, [{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 0, transform: `translate(${i % 2 ? 16 : -16}px,-40px)` }], 1200, i * 600); await s.wait(3000); } },
  { id: 'twirl', layer: 'big', name: 'Twirl', when: 'Rarely, or when you refresh', len: '2.6 s', desc: 'A full spin on the spot with a sparkle.',
    run: async (s) => { s.set('happy', 'pip--twirl'); s.sparkle(); await s.wait(2600); } },
  { id: 'flourish', layer: 'big', name: 'Flip flourish', when: 'Rarely, or when you refresh', len: '1.6 s', desc: 'Hops up, does a full flip in the air, and lands with a squish. Never spills a drop.',
    run: async (s) => { s.set('happy', ''); await s.an(s.q('.pw'), [{ transform: 'none' }, { transform: 'scale(1.1,.9)', offset: .15 }, { transform: 'translateY(-34px) rotate(180deg)', offset: .55 }, { transform: 'translateY(0) rotate(360deg)', offset: .88 }, { transform: 'scale(1.1,.9)', offset: .94 }, { transform: 'none' }], 1300, { easing: 'ease-in-out' }); s.sparkle(); await s.wait(600); } },
  // time of day
  { id: 'open', layer: 'day', name: 'Opening up', when: '6–7 AM', len: '3.5 s', desc: 'Sleepy, holding the CLOSED sign. Wakes up, flips it to OPEN, and perks up.',
    run: async (s) => { s.set('signClosed', ''); await s.wait(1200); await s.an(s.q('.sign'), [{ transform: 'none' }, { transform: 'scaleX(0)' }], 220, { easing: 'ease-in' }); s.set('signOpen', ''); s.q('.sign').style.cssText = 'transform-box:fill-box;transform-origin:50% 50%'; await s.an(s.q('.sign'), [{ transform: 'scaleX(0)' }, { transform: 'none' }], 300, { easing: SPR }); s.sparkle(5); await s.wait(1600); } },
  { id: 'night', layer: 'day', name: 'Closed for the night', when: 'After closing', len: 'Loops', desc: 'Holds a "BACK AT 7" sign, gets sleepy, and dozes off. If you tap it, it wakes up and waves.',
    run: async (s) => { s.set('back7', ''); await s.wait(1400); s.set('sleep', 'pip--sleep'); await s.wait(4000); } },
  // reacts to the app
  { id: 'usual', layer: 'app', name: 'Your usual', when: 'You have a usual order', len: '3 s', desc: 'Holds up a card with your usual drink. One tap on it and it is in your bag.',
    run: async (s) => { s.set('usual', ''); const c = s.q('.card'); c.style.cssText = 'transform-box:fill-box;transform-origin:100% 100%'; await s.an(c, [{ transform: 'scale(0)' }, { transform: 'none' }], 450, { easing: SPR }); await s.wait(1800); await s.an(c, [{ transform: 'none' }, { transform: 'scale(0)' }], 250); s.set('wink', ''); await s.wait(600); } },
  { id: 'reward', layer: 'app', name: 'One drink from a reward', when: 'Points almost there', len: '3 s', desc: 'Counts four gold stars over its head; the fifth one pulses. "1 more drink."',
    run: async (s) => { s.set('reward', ''); const st = [...s.cup.querySelectorAll('.stars path')]; st.forEach((p) => (p.style.cssText = 'transform-box:fill-box;transform-origin:50% 50%'));
      for (let i = 0; i < 4; i++) { s.an(st[i], [{ transform: 'scale(0)' }, { transform: 'scale(1.4)' }, { transform: 'none' }], 300, { delay: i * 180, easing: SPR }); } await s.wait(800); s.pill(s.opts.reward || '1 more drink to a free one', 1600); await s.an(st[4], [{ transform: 'none' }, { transform: 'scale(1.35)' }], 380, { iterations: 4, direction: 'alternate', fill: 'none' }); await s.wait(300); } },
  { id: 'bag', layer: 'app', name: 'Something in your bag', when: 'You left items in the bag', len: '2.5 s', desc: 'Looks over at the bag and points, as a friendly reminder. No nagging, once per visit.',
    run: async (s) => { s.set('idle', ''); const b = s.fx('<svg width="34" height="34" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6z" fill="#2B1D16"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="#2B1D16" stroke-width="2" fill="none"/></svg><b>1</b>', 'left:22px;top:22px', 2600); b.className = 'fx bagi';
      await s.an(pp(s), [{ transform: 'none' }, { transform: 'translate(-5px,-2px)' }], 300); s.set('point', 'pip--wave'); s.q('.pp').style.transform = 'translate(-5px,-2px)'; an(b, [{ transform: 'none' }, { transform: 'translateY(-6px)' }, { transform: 'none' }], 400, { iterations: 3, fill: 'none' }); await s.wait(1800); s.set('idle'); } },
  { id: 'brew', layer: 'app', name: 'Making your order', when: 'Order in progress', len: 'Until ready', desc: 'While your order is being made it "brews": steam grows and a progress bar fills. When it is ready, it rings a bell.',
    run: async (s) => { s.set('brew', 'pip--sleep'); const bar = s.fx('<span class="pill prog"><span>Making your order…</span><i><em></em></i></span>', s.pillPos(), 4400); await s.an(bar.querySelector('em'), [{ width: '0%' }, { width: '100%' }], 2600, { easing: 'ease-in-out' }); bar.remove();
      s.set('bell', ''); const al = s.q('.al'); s.an(al, [{ transform: 'rotate(0)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0)' }], 400, { iterations: 3, fill: 'none' }); s.an(s.q('.pw'), [{ transform: 'none' }, { transform: 'translateY(-10px)' }, { transform: 'none' }], 500, { easing: SPR, fill: 'none' }); s.pill('Ready for pickup!', 1500); await s.wait(1700); } },
  { id: 'welcome', layer: 'app', name: 'Welcome back', when: 'First open after a while', len: '2 s', desc: 'A big wave with a little hop when you come back after a few days.',
    run: async (s) => { s.set('waveBig', 'pip--wave'); s.an(s.q('.pw'), [{ transform: 'none' }, { transform: 'translateY(-12px)' }, { transform: 'none' }], 600, { easing: SPR, fill: 'none' }); s.pill(`Welcome back${s.opts.name ? ', ' + s.opts.name : ''}`, 1500); await s.wait(1800); } },
  // touch
  { id: 'tapped', layer: 'touch', name: 'Tap: giggle', when: 'You tap it', len: '1.8 s', desc: 'Squishes and giggles. Tap the cup on this card to try it.',
    run: async (s) => { await finger(s, 1); s.set('happy', 'pip--squish'); await s.wait(1800); } },
  { id: 'dizzy', layer: 'touch', name: 'Too many taps: dizzy', when: 'You tap it 4+ times fast', len: '2.5 s', desc: 'Gets dizzy with swirly eyes and stars around its head, then shakes it off and laughs.',
    run: async (s) => { await finger(s, 4); s.set('dizzy', ''); s.an(s.q('.pw'), [{ transform: 'rotate(-9deg)' }, { transform: 'rotate(9deg)' }], 260, { iterations: 6, direction: 'alternate', fill: 'none', easing: 'ease-in-out' });
      for (let i = 0; i < 8; i++) s.part('star', '#C9A24B', 60 + Math.cos(i) * 40, 14 + Math.sin(i) * 8, 10, [{ opacity: 0 }, { opacity: 1, offset: .3 }, { opacity: 0, transform: `translate(${Math.cos(i + 1.5) * 24}px,${Math.sin(i + 1.5) * 6}px)` }], 700, i * 160);
      await s.wait(1600); s.set('happy', ''); await s.an(s.q('.pw'), [{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }], 90, { iterations: 4, direction: 'alternate', fill: 'none' }); await s.wait(700); } },
  { id: 'hold', layer: 'touch', name: 'Press and hold: love', when: 'You press and hold it', len: '2.4 s', desc: 'Heart eyes and a few hearts float up.',
    run: async (s) => { await finger(s, 0, true); s.set('love', 'pip--love'); for (let i = 0; i < 5; i++) s.part('heart', ['#E5485E', '#F4A3A8'][i % 2], 40 + i * 10, 30, 13, [{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 0, transform: `translate(${(i - 2) * 8}px,-44px)` }], 1300, i * 150); await s.wait(2400); } },
  { id: 'pull', layer: 'touch', name: 'Pull to refresh', when: 'You pull Home down', len: '1.6 s', desc: 'Does its flip flourish while Home refreshes.',
    run: async (s) => { const a = s.fx('<svg width="20" height="30" viewBox="0 0 20 30"><path d="M10 2v24M3 19l7 7 7-7" stroke="#8C5A3C" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>', 'left:50%;top:8px', 900); await an(a, [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1 }, { opacity: 0, transform: 'translateY(24px)' }], 800); await MOVES.find((m) => m.id === 'flourish').run(s); } },
];
async function finger(s, taps, hold) {
  const [x, y] = s.pt(60, 70); const f = s.fx('', `left:${x - 14}px;top:${y - 14}px;width:28px;height:28px;border-radius:14px;background:rgba(43,29,22,.28);border:2px solid rgba(255,255,255,.8);opacity:0;pointer-events:none`, 3000);
  if (hold) { await an(f, [{ opacity: 0, transform: 'scale(1.4)' }, { opacity: 1, transform: 'scale(1)', offset: .2 }, { opacity: 1, transform: 'scale(1.6)' }], 900); f.remove(); return; }
  for (let i = 0; i < taps; i++) await an(f, [{ opacity: 0, transform: 'scale(1.5)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.9)' }], taps > 1 ? 200 : 380, { fill: 'none' });
  f.remove();
}
function look(s, x, y) { const svg = s.cup.querySelector('svg'), p = svg && svg.querySelector('.pp'); if (!p) return; const br = s.box.getBoundingClientRect(), r = svg.getBoundingClientRect(); const cx = r.left - br.left + r.width / 2, cy = r.top - br.top + r.height / 2; const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1; p.style.transform = `translate(${(dx / d) * 4}px,${(dy / d) * 3}px)`; }
const STEPS = {"breathe": "Breathes slowly|Blinks|Eyes drift", "steam": "Steam puffs rise from the top", "glance": "Leans in|Winks at you", "yawn": "Arms up|Big yawn", "latte": "Stirs with a spoon|A heart appears in the foam|Smiles", "pour": "A milk pitcher pours in|A heart appears|Smiles", "paper": "Reads the LR Daily|Lowers it|Winks", "special": "Walks in with today's special|Shows it to you|Walks off", "music": "Headphones on|Sways to the music", "dance": "Arms up|Little happy dance", "twirl": "Spins once|Sparkle", "open": "Holds CLOSED|Flips the sign|OPEN", "night": "Holds BACK AT 7|Falls asleep", "usual": "Holds up a card with your usual drink", "reward": "4 gold stars over its head|The 5th one blinks: 1 more drink", "brew": "Steam while your order is made|Rings a bell: ready!", "welcome": "Big wave|Welcome back", "tapped": "You tap it|It giggles", "hold": "You press and hold|Heart eyes"};
const ALL = MOVES.slice(); MOVES.length = 0; ALL.forEach((m) => { if (STEPS[m.id]) { m.steps = STEPS[m.id].split('|'); MOVES.push(m); } });
const BY = Object.fromEntries(ALL.map((m) => [m.id, m]));


return { bind, reset, BY, MOVES, STEPS, wait, an, rnd, look };
})(typeof LPOSE !== 'undefined' ? LPOSE : POSE);
