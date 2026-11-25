# Living Room Coffeehouse app

**How it fits together:** see [ARCHITECTURE.md](ARCHITECTURE.md), the system map with every engine, data file and screen.

**A native iOS and Android app** (React Native with Expo, TypeScript), for the App Store and Google Play. Not a web app. The clickable mockup is a web page only for review. See `design-system/RULES.md` §19.

A fresh start. The first version is saved on the `old-app-v1` branch.

This rebuild goes in order, one decision at a time:

1. **Navigation** (decided): four tabs, Home · Order · Rewards · Account, with a floating bag bar that appears when the bag has items. The member QR code lives at the top of Rewards, on the Account profile card, and opens with a long press on either tab.
2. **Design system** (in progress): `design-system/`.
3. Approved in the mockup: opening, location and map, café detail and scheduling, members going straight to Home, show-around tips. Built next in the Expo app.
4. Home page and the specials post creator (to discuss).
5. The rest of the app, screen by screen.

## Design system

Every colour, font, size, corner, shadow, timing and seasonal theme comes from one file:

```
design-system/tokens/tokens.json   ← the only place values are written
design-system/css/tokens.css       ← generated CSS variables
design-system/tokens/tokens.ts     ← generated, typed values for the app
design-system/themes/calendar.ts   ← picks today's seasonal or holiday skin
```

```
design-system/RULES.md             ← the rules, in plain words
design-system/css/motion.css       ← every animation, timed from the tokens
design-system/pip/Pip.tsx          ← Pip the mascot: 17 poses, 14 outfits, 20 animations
design-system/pip/Loader.tsx       ← CupLoader and PipLoader (no spinners anywhere)
design-system/icons/Icon.tsx       ← the 20-icon set
design-system/scripts/check-design.mjs ← fails the build when a rule is broken
data/cafe.json                     ← locations, hours, sources, closures
```

Commands:

```
npm run tokens      # regenerate css/tokens.css and tokens/tokens.ts after editing tokens.json
npm run design      # check the app code against the rules
npm run check       # tokens + checker self-test + design check
```

### Seasonal and holiday themes

The app always uses the café red, the same fonts and the same layout. What rotates is the "skin": the colours of the hero and special cards, small accents and the mascot's outfit.

- **Four seasons** run all year: winter, spring, summer, autumn.
- **Holidays** have a lead-up (a countdown card on Home, 5 to 20 days) and a main window (the full holiday look). Each has an on/off switch and a date rule in `tokens.json`; fixed dates, "2nd Sunday of May", Thanksgiving and Easter are calculated automatically.
- **The café's birthday** is Thanksgiving Day: the College Area café opened on Thanksgiving Day 1991.
- The full calendar is in `design-system/RULES.md` § 10.
