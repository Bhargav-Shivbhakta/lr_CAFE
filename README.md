# Living Room Coffeehouse app

A fresh start. The first version is saved on the `old-app-v1` branch.

This rebuild goes in order, one decision at a time:

1. **Navigation** (decided): four tabs, Home · Order · Rewards · Account, with a floating bag bar that appears when the bag has items. The member QR code lives at the top of Rewards, on the Account profile card, and opens with a long press on either tab.
2. **Design system** (in progress): `design-system/`.
3. Home page and the specials post creator.
4. The rest of the app, screen by screen.

## Design system

Every colour, font, size, corner, shadow, timing and seasonal theme comes from one file:

```
design-system/tokens/tokens.json   ← the only place values are written
design-system/css/tokens.css       ← generated CSS variables
design-system/tokens/tokens.ts     ← generated, typed values for the app
design-system/themes/calendar.ts   ← picks today's seasonal or holiday skin
```

After changing `tokens.json`, run:

```
npm run tokens
```

### Seasonal and holiday themes

The app always uses the café red, the same fonts and the same layout. What rotates is the "skin": the colours of the hero and special cards, small accents and the mascot's outfit.

- **Four seasons** run all year: winter, spring, summer, autumn.
- **Holidays** take over for a few days. Each one has an on/off switch and a date rule in `tokens.json`. Fixed dates, "2nd Sunday of May" and Easter are all calculated automatically.
- Holidays that need a date from the café (the anniversary, the first day of SDSU's fall semester) stay off until a date is filled in.
