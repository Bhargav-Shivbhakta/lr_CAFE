# Architecture, design rules and function rules

## 1. Big idea: everything is a feature module

```
src/
  core/                 ← the platform. Features depend on it; it never depends on a feature.
    registry/           ← FeatureModule type + nav/route/widget builders
    nav/                ← TabBar, More hub, auto "coming soon" screens
    services/           ← contracts (types.ts) + adapters (mock, toast, …) + locator (index.ts)
    store/              ← small global state (user, cart, orders, points)
    ui/                 ← the only UI kit: Button, Screen, ItemArt, Chips, Sheet, Progress, toast
    theme/tokens.css    ← the only place colors/type/spacing live
    config/flags.ts     ← feature flags + business rules (points, rewards, tiers, happy hour)
  features/<id>/        ← one folder per feature: screens + index.ts manifest
  features/index.ts     ← THE list of features. Plug in / pull out here.
  data/                 ← demo menu + locations (replaced by the Toast sync)
```

Each feature exports one `FeatureModule`:

```ts
{
  id: 'save-my-seat',               // also its URL: /save-my-seat
  title: 'Save my seat',
  icon: Armchair,
  status: 'soon' | 'beta' | 'live',
  nav: { placement: 'tab' | 'hub' | 'hidden', order: 2, hubSection: 'At the café' },
  routes: [{ path: '', element: Screen }, { path: ':id', element: Detail }],
  homeWidget: { order: 3, component: Card },   // optional card on Home
  Overlay: FloatingBar,                         // optional global UI (e.g. store bar)
  Badge: CountBadge,                            // optional tab badge
}
```

From that list the app **generates**: the tab bar, the "More" hub in Account, every route,
the Home widgets, and overlays. Nothing else needs editing.

### Navigation that fits features we haven't built yet
- **5 tabs, fixed:** Home · Order · Scan · Rewards · Account. If a 6th tab is ever added, the 5th slot turns into **More** automatically.
- **Everything else goes in the hub** (Account → *At the café / Ordering / Your account / Help*). The hub has room for dozens of features.
- **`status: 'soon'`** gives a feature a nav entry and a "Tell me when it opens" screen before any code exists. This doubles as demand research.
- **Feature flags** (`config/flags.ts`) hide a feature everywhere in one line, e.g. per location or for a launch date.

### Adding a feature (5 minutes)
1. `mkdir src/features/catering` and write the screen(s).
2. Export a `FeatureModule` from `src/features/catering/index.ts`.
3. Register it in `src/features/index.ts` (and remove its placeholder from `features/soon`).
Done — it now has navigation, routing, and an optional Home card.

### Integrations (swap without touching screens)
Screens only import from `core/services`. Each service has a contract in `services/types.ts`:

| Service | Now | Production |
|---|---|---|
| MenuService | mock (`data/menu.ts`) | Toast Menus API via a server function |
| OrderService | mock (simulated kitchen) | Toast Orders API |
| PaymentService | mock (no charge) | Stripe (Apple/Google Pay) or Toast payments |
| AuthService | demo code on screen | Supabase phone auth + Twilio SMS |
| Notifications | — | Expo push / OneSignal for "order ready" |

Pick the adapter with env vars (`.env.example`). Secrets never go in the browser — Toast/Stripe calls go through a server function.

## 2. Design rules
1. **Tokens only.** Colors, fonts, radii and spacing come from `theme/tokens.css`. No raw hex in features.
2. **One accent.** Living Room red is for the main action on a screen, the active tab and key labels. Everything else is neutral.
3. **One main button per screen.** Secondary actions are outline or text.
4. **Type:** one sans family for the whole UI, bold headings. The serif appears only in the wordmark.
5. **Round product images**, same size per list (64 in lists, 128 in grids, 210 on the item page).
6. **8-pt spacing**, 16px card corners, pill buttons, tap targets ≥ 44px.
7. **White space over decoration.** No gradients, no heavy borders; soft shadow on cards only.
8. **Copy:** warm, short, sentence case. "Pull up a chair", "Your usual", "Start an order". No "please", no exclamation marks.

## 3. Function rules
1. **Browse freely, sign in only when needed** (checkout, rewards, scan).
2. **Checkout is always one tap away** — the store bar shows on Home and the menu.
3. **Prices are honest:** add-on prices show on the option; totals update live; tax shown before paying.
4. **Every input is validated** with a clear message next to the field.
5. **Closed or unavailable things explain themselves** (sold out, location not taking app orders).
6. **One checkout path** (`core/commerce.ts`) used by the bag and one-tap "Your usual".
7. **Loyalty rules live in config**, not in screens (points per $, rewards, tiers, happy hour).
8. **Nothing breaks offline/demo:** storage falls back to memory; mock adapters need no network.
