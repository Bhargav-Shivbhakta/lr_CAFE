# Living Room — café ordering app (concept build)

A clean, simple ordering app for **The Living Room Coffeehouse** (San Diego, since 1991).
Built as a proposal: everything works end to end except real payment.

**What works now**
- Sign up with name + mobile number + 6-digit code (demo mode shows the code on screen)
- Full SDSU menu: 204 items in 29 categories, sourced from the café's public Toast ordering pages (21 items without a public price use placeholders), with their real milk and syrup options; search, favorites, previous items
- Bag, pickup or delivery, House Key reward redemption, tax, points earned
- Place order → live order tracking (received → brewing → ready)
- House Key rewards: points, tiers, visit streak, birthday reward, double-points happy hour
- Scan tab with member QR, 4 locations with a store picker, events, order history and reorder
- "Coming soon" slots already in navigation: Save my seat, Study mode, Gift cards, Catering, Scan and pay

**What's left:** payments (Stripe or Toast), real SMS (Supabase + Twilio), Toast menu/order sync, real photos, separate La Jolla and Rancho menus (the demo uses the SDSU menu everywhere).

**Menu data:** edit `src/data/menu.source.json` (one record per item: id, category, name, description, price, flags).

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # static site in dist/ (deploy to Vercel/Netlify)
npm run build:preview  # one self-contained HTML file in dist-preview/
```

## Deploy

**GitHub Pages (already set up):** every push to `main` builds the app and publishes it to the `gh-pages` branch via `.github/workflows/deploy.yml`. Live at `https://<user>.github.io/living-room-app/`.

**Or Vercel:**

```bash
git remote add origin https://github.com/<you>/living-room-app.git
git push -u origin main
```
Then in Vercel: **Add New → Project → import the repo → Deploy**. No settings needed (Vite is auto-detected; `vercel.json` handles routing).

## Adding photos
Drop images in `src/assets/menu/` named by item id (e.g. `dirty-chai.jpg`; ids are in `src/data/menu.source.json`).
They're bundled and used automatically; items without a photo keep the illustrated placeholder.
Square, centered, 800×800 JPG/WebP on a plain background works best (they're shown in circles).

See **ARCHITECTURE.md** for how the app is structured and how to add features.
