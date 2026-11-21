# Living Room — café ordering app (concept build)

A clean, simple ordering app for **The Living Room Coffeehouse** (San Diego, since 1991).
Built as a proposal: everything works end to end except real payment.

**What works now**
- Sign up with name + mobile number + 6-digit code (demo mode shows the code on screen)
- Full menu (75 items, almost all real from the café's public Toast menu), search, categories, item options, favorites
- Bag, pickup or delivery, House Key reward redemption, tax, points earned
- Place order → live order tracking (received → brewing → ready)
- House Key rewards: points, tiers, visit streak, birthday reward, double-points happy hour
- Scan tab with member QR, 4 locations with a store picker, events, order history and reorder
- "Coming soon" slots already in navigation: Save my seat, Study mode, Gift cards, Catering, Scan and pay

**What's left:** payments (Stripe or Toast), real SMS (Supabase + Twilio), Toast menu/order sync, real photos.

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # static site in dist/ (deploy to Vercel/Netlify)
npm run build:preview  # one self-contained HTML file in dist-preview/
```

## Deploy (GitHub + Vercel)

```bash
git remote add origin https://github.com/<you>/living-room-app.git
git push -u origin main
```
Then in Vercel: **Add New → Project → import the repo → Deploy**. No settings needed (Vite is auto-detected; `vercel.json` handles routing).

## Adding photos
Drop images in `public/menu/` and set `image: '/menu/<item-id>.jpg'` on the item in `src/data/menu.ts`.
Every screen switches from the illustrated placeholder to the photo automatically.
Square, centered, 800×800 JPG/WebP on a plain background works best (they're shown in circles).

See **ARCHITECTURE.md** for how the app is structured and how to add features.
