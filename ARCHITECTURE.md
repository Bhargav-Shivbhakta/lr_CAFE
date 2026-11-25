# How the app is put together

The rule behind everything: **screens show things, engines decide things, data holds the facts.**
A screen never makes a decision another screen also makes. If two screens need the same behavior,
that behavior is an engine, and both screens call it. That is why the Home "+" can never again
work differently from the Order "+".

## System map

```mermaid
flowchart TB
  subgraph DATA["Data (facts, edited without touching code)"]
    menu[data/menu.json<br/>dishes, prices, photos]
    groups[data/order-groups.json<br/>meals, kinds, popular, removed dishes]
    cafe[data/cafe.json<br/>hours, meal times, closures]
    specials[data/specials.json<br/>owner's specials]
    hfood[data/holiday-food.json<br/>each holiday's food row]
    tokens[design-system/tokens/tokens.json<br/>colors, type, holiday dates]
  end

  subgraph ENGINES["Engines (decide; pure functions; tested)"]
    cal[Calendar<br/>themes/calendar.ts<br/>which holiday look is on]
    spec[Specials<br/>engine/specials.ts]
    home[Home builder<br/>engine/home.ts<br/>what Home shows, in what order]
    avail[Availability<br/>in order-browse.js<br/>meal hours, sold out, similar dishes]
    opts[Options<br/>engine/options.js<br/>customize choices, prices, pairings]
    search[Search<br/>engine/search-engine.js<br/>typos, diets, budget, 'we don't have X']
    bag[Bag<br/>engine/bag-engine.js<br/>THE ONE DOOR INTO THE BAG]
    notify[Notifications<br/>engine/notifications.ts]
    mascot[Cup<br/>design-system/mascot/engine.ts]
  end

  subgraph SCREENS["Screens (show only)"]
    shome[Home]
    sorder[Order: meals, kinds, search]
    sdish[Dish page: photo, goes great with it, customize]
    sbag[Bag]
    sacct[Rewards, Account]
  end

  tokens --> cal --> home
  specials --> spec --> home
  hfood --> home
  menu --> home
  cafe --> avail
  groups --> sorder
  menu --> search
  opts --> sdish
  avail --> sdish
  avail --> search
  home --> shome
  search --> sorder

  shome -- "every + / Order again" --> bag
  sorder -- "every +" --> bag
  bag -- "anything to choose or offer" --> sdish
  bag -- "plain item or saved usual" --> sbag
  sdish -- "Add to bag (with choices + pairings)" --> sbag
```

## The bag engine: the one door

Every "+", "Add" and "Order again" button calls `toBag(id)`, which asks `Bag.plan()`:

| Situation | What happens |
|---|---|
| Not available now (sold out, outside meal hours) | Dish page opens and says why, with similar dishes |
| "Order again" on the usual, with saved choices | Added exactly as saved (e.g. Dirty chai · Iced · Oat milk) |
| Something must be picked (eggs, protein) | Dish page opens |
| Anything to offer (customize, "Goes great with it") | Dish page opens |
| Plain item, nothing to choose or pair | Added straight away |

Only two places may put a line in the bag: `toBag()` and the dish page's Add button (`bagPush`).

## Guards that stop this from slipping again (run daily)

- `engine/bag.test.mjs`: the rule above, plus a check of the built app. If any screen calls `bagPush` directly, the test fails.
- `tools/qa/ui-check.mjs`: clicks every + on Home (every holiday) and in every meal on Order. It fails if a + skips the dish page.
- `tools/qa/calendar-check.mjs`: every holiday's dates for five years. It also checks each holiday has a food row whose items are on the menu.
- Text overflow, spelling and grammar, and security checks: see `tools/qa/README.md`.

## Adding something new

1. **New fact?** Put it in `data/` or `tokens.json`. Never put it in screen code.
2. **New decision two screens could need?** Make it an engine with tests, and have both screens call it.
3. **New button that adds food?** It must call `toBag(id)`. The tests fail otherwise.
4. Add a daily check for it in `tools/qa/`.

## Where the mockup fits

`mockup/index.html` is the clickable demo. It is built from these same engines and data files, so what you see there is what the real app (React Native + Toast) will do.
