# Living Room design rules

These are hard rules. `npm run design` checks them and the build fails on any error. Values live in `tokens/tokens.json` and nowhere else. Where a line below names a number, the number comes from that file.

If a rule truly has to be broken, put `// design-allow: <reason>` on that line. Reviewers read every one.

## 1. Decided

| | Choice |
| --- | --- |
| Navigation | Home · Order · Rewards · Account, plus a floating bag bar once the bag has items |
| Palette | Heritage Red (light), Espresso Bar (dark mode) |
| Fonts | Fraunces for headings, Inter for everything else, all year |
| Corners | Soft: 6 / 12 / 20 / 28 / pill |
| Shadows | Soft warm |
| Icons | Line, 1.8 pt stroke, 20-icon set |
| Motion | Balanced |
| Mascot | The Living Room cup. Never named in the app (`Pip` is only the code name) |

To change one, edit `choice` in `tokens.json` and run `npm run tokens`.

## 2. Brand: the Living Room logo

- `brand/logo.png` is the café's own logo (the red couch with two regulars at the table, the hand-lettered wordmark and COFFEEHOUSE). Source file: `brand/logo-original.png`, supplied for this project.
- **Full logo:** on a white card only (its table and faces are white), at least 120 px wide. Used for the opening moment, the About page and the App Store icon artwork.
- **Wordmark** (`brand/wordmark.png`, the lettering alone with a transparent background): the app header, at least 24 px tall, on cream or white.
- Never recolour, stretch, redraw or crop the people out of the logo. Never put Pip on, over or inside the logo.
- Where the logo is too small to read (map pins, tiny icons), use the plain white couch shape instead.

## 3. Colour

- Only token colours. No hex or rgb values in app code.
- **Café red** (`--primary`) is for actions and the active tab. Never a large background, never body text.
- **Ink** for all text and icons. **Muted** for secondary text; it still passes 4.5:1.
- **Brass** for rewards, tiers and small details. Never for text under 24 px.
- **Error red** (`--error`) only for problems, always with an icon and a sentence, so it is never mistaken for the café red.
- **Success green** always comes with a tick or words.
- Every text colour meets 4.5:1 on its background (3:1 for 24 px and up). The checker measures every palette and every seasonal skin.

## 4. Type

- Two fonts only: `var(--font-display)` and `var(--font-text)`. Never a font name in app code.
- Use the scale classes: `.t-display`, `.t-title`, `.t-heading`, `.t-body`, `.t-label`, `.t-caption`, `.t-eyebrow`.
- Nothing under 11 px. Prices use tabular figures.
- Text grows with the phone's text-size setting up to 200% without breaking layouts.

## 5. Space and layout

- Gaps come from the 4-pt scale: 4, 8, 12, 16, 20, 24, 32, 40, 56.
- Screen edges 20, between cards 12, between sections 32.
- Header 56, tab bar 49 plus 34 for the home indicator, bag bar 56 floating 12 above the tabs.
- Nothing crosses the 20 pt margin except full-bleed photos and the specials carousel.
- Every tap target is at least 44 × 44 pt.

## 6. Corners and depth

- Radius tokens only: xs 6 (tags), sm 12 (inputs, list photos, chips), md 20 (cards), lg 28 (sheets), pill (buttons, search, segmented controls).
- Four depth levels: 0 page, 1 cards, 2 floating (bag bar, toasts, banners), 3 sheets and dialogs over a dimmed page. In dark mode, shadows become fine outlines.

## 7. Buttons

- Three levels, in order of importance: filled, tinted, outline or text. **One filled button per screen.**
- Three sizes: large 52 (the bottom action, full width), medium 44 (in cards and sheets), small 32 (dense rows only; the tap area still reaches 44).
- Four states on every button: default, pressed (darker, scales to 0.97), disabled (pale, with the reason nearby), loading (mini cup, words say what is happening).

## 8. Icons

- Only the 20 icons in `icons/Icon.tsx`, one stroke weight.
- An icon that acts alone needs a spoken label. Colour never carries meaning alone.

## 9. Motion

- Durations and curves come from `--dur-*` and `--ease-*`. The checker rejects any other millisecond value.
- Motion explains what happened. It is never decoration for its own sake.
- **No spinners.** Use `<CupLoader/>` for short waits and `<PipLoader/>` for long ones.
- Only loaders, the steam on the hero card and Pip's idle may loop. Everything else plays once.
- One celebration at a time. Rewards, tier-up and order-ready never play together.
- Nothing moves on checkout, payment or error screens except the press and the wrong-code shake.
- Exits run at about 70% of the entrance time.
- Reduced motion is respected everywhere; loaders show a still, full cup.

## 10. Mascot (the Living Room cup)

- The cup has **no name people can see**. `Pip` is only the code name for files and components. Never write it in on-screen text, aria-labels, notifications, emails or posts; say "the cup" or "the Living Room cup". `npm run design` checks this.

- Use `<Pip/>` from `pip/Pip.tsx`. Never redraw, recolour, stretch or outline Pip.
- **Never on checkout, payment or price screens.** The checker blocks it.
- One Pip per screen, no bigger than a third of it. Sizes: 24, 40, 64, 96, 150, 200.
- One-shot animations play at most 3 times, then Pip rests.
- Pip never guilt-trips: no "Pip misses you", no sad faces for staying away.
- Pip stays quiet in quiet hours (9 PM to 8 AM). A setting in Account turns Pip's animations off.
- Pip is for waiting, celebrating and gentle apologies. A serious problem, like a failed payment, gets plain words and no mascot.

## 11. Seasonal and holiday themes

- The calendar in `themes/calendar.ts` decides the look of every day. Nobody switches themes by hand.
- A skin changes **only** the hero and special card colours, the eyebrow, the accent, the tint and Pip's outfit. It never changes the café red, fonts, layout, buttons, prices or the tab bar.
- Each holiday has three phases:
  - **Lead-up (runway):** the season's skin stays; Home shows a countdown card in the holiday's colours and Pip holds the outfit. Specials and pre-orders can be announced.
  - **Main:** the full holiday skin, Pip wears the outfit.
  - **Back to the season** the day after.
- Precedence: any holiday's main window beats any lead-up; within a phase the higher priority wins; holidays beat seasons.
- Turned on (lead-up → main):

| Holiday | Lead-up | Main |
| --- | --- | --- |
| New Year | 5 days | Dec 31 – Jan 1 |
| Valentine's week | 14 days | Feb 8 – 14 |
| Mother's Day | 14 days | the week ending on the 2nd Sunday of May |
| Fourth of July | 10 days | Jul 1 – 4 |
| National Coffee Day | 7 days | Sep 29 |
| Halloween | 14 days | Oct 24 – 31 |
| Thanksgiving and the café's birthday week | 10 days | Monday to Sunday of Thanksgiving week |
| The café's birthday | | Thanksgiving Day (opened Thanksgiving Day 1991) |
| Christmas season | 20 days | Dec 1 – 26 |

- Ready but off: Lunar New Year, St. Patrick's, Easter, Father's Day, Día de los Muertos, Back to school (needs SDSU's first day each year).

## 12. Opening hours

- Hours come from `data/cafe.json` until the app reads them live from Toast.
- The café is treated as open every day. A closure or special hours only appear if a date is added to `closures`. No location publishes holiday closures.
- The app never says "closed" from a guess. When unsure, it shows the regular hours.

## 13. Photos

- Every food photo goes through `npm run photos`, which matches it to a menu item, crops to the food and applies the Living Room grade (a touch warmer, gentle contrast, soft vignette). No photo reaches the app unstyled.
- Sources: the café's own photos (Toast menu, website, their own posts) or photos taken at the café. `data/photos.json` records where each one came from. No customer review photos or stock.
- Shapes: 1:1 for menu lists (radius 12), 4:3 for item pages, 4:5 for holiday specials, 16:10 for the Home hero and posts (radius 20).
- Warm daylight from the side, real wood and café mugs, food from above, drinks at 45°.
- Text over a photo sits on a dark warm fade so it passes 4.5:1. No heavy filters, no stock photos of other cafés.

## 14. Voice

| Say | Not |
| --- | --- |
| Your usual? | Reorder previous item |
| Ready in about 8 minutes | Order status: processing |
| That code didn't match. Try again. | Error 401: invalid OTP |
| Double points all week | 2X PTS PROMO!!! |
| We're out of almond milk today | Item unavailable |

Short, warm, plain. No exclamation marks in a row, no all-caps sentences, no emoji in system messages.

## 15. Arriving in the app

- **Guests can order.** Nobody is forced to sign up. A phone number is asked for only when it is needed: to earn points, save favorites or get order texts.
- Launch screen: plain cream in Home's exact colours, no text, so Home appears instantly.
- First open of each day, about 4 seconds (the word is complete by 1.9 s; the greeting stays long enough to read), tap to skip, never again that day. Built only from the café's own logo, split into three layers (`brand/layer-*.png`):
  1. a warm pool of lamplight glows up behind a white card;
  2. the couch scene settles in; then "Living Room" appears one whole letter at a time (`brand/letter-0…9.png`, positions in `brand/letters.json`), slowly enough to read; then "COFFEEHOUSE" slides into place. Never wipe across the letters: a cut-off letter is unreadable;
  3. steam rises from the cup on the logo's table;
  4. a line fades in. Guests: "A European café" on one line, "with a *Californian flair*" in italic beneath it (the flair in café red), then a small spaced "SAN DIEGO · SINCE 1991" between two brass rules. Members: "Good evening, Bhargav" and "Your dirty chai latte is one tap away";
  5. the logo glides up toward the header and Home appears.
- No mascot and no other props in the opening.
- **After the café is decided:**
  - **Members** see a welcome screen once a day: their name, their café (with "Your usual" or "Your café" and its status), their points and how far to the next reward, and their usual drink with "Add". "Take me in" goes to Home; tapping the café changes it.
  - **Newcomers** are shown around the real Home screen, not a tour. There are no extra screens, no slideshow and no introduction speech. Five tips at most, one at a time: each dims the screen, puts a soft spotlight on the real button and shows a small card with the cup, "N OF 5", a short title and one or two sentences. In order: the café chip (switch café or pickup time), a special's Add button (the bag appears at the bottom), Order, Rewards (press and hold for the member code) and Account.
  - **How tips move:** one spotlight and one card stay on screen the whole time and are never redrawn. On Next, the words fade out (150 ms), then the spotlight changes shape and glides to the next button while the list scrolls in step with it, all on the sheet curve (460 ms). The card travels with the spotlight. If the card has to move to the other side of the button, it fades across instead of sliding over it. The cup, title and text come back in with a 40 ms stagger, and a brass ring pulses once on arrival. The progress dots stretch into a pill. Taps during a move are never dropped: they play right after. Back and the arrow keys go both ways. With reduced motion, everything moves instantly.
  - Skip, tapping outside, Escape or leaving Home closes the tips right away. They show once, and "Show me around again" in Account replays them.
- After that, give one short tip the first time someone reaches a feature, in the same spotlight style. One tip per visit, each shown once.
- Notification permission is asked right after the first order ("Want a text when it's ready?"), never on first launch.

## 16. Navigation: nobody gets stuck

- Every screen that isn't a tab's first screen has a visible back button that names where it goes ("‹ All cafés", "‹ Home"). Never a bare arrow.
- The app keeps a real history: the phone's back gesture and the browser's back and forward buttons walk through exactly where the person has been.
- Every sheet or pop-up closes four ways: the ✕, tapping outside it, swiping it down, and the phone's back gesture. Escape closes it on a keyboard.
- Closing a sheet never loses what was typed or picked; going back never empties the bag.
- Tapping the tab you're already on scrolls it to the top.
- The café chosen and how to get the order (ASAP or a scheduled time) are always one tap away on Home, and tapping them returns to the map.

## 17. Choosing a café

- **San Diego time, always.** Open, closed, "closing soon" and pickup times are worked out in America/Los_Angeles time, whatever the phone's own time zone.
- **One status per café, in this order of truth:** closed for a special date (owner-set) → closed (with when it opens: "opens 7 AM" or "opens tomorrow 6:45 AM") → open but app orders closed for tonight (after the online cutoff) → closing soon (45 minutes or less) → open until… Colours: green open, brass closing soon or orders closed, error red closed.
- **"Order now" only when the café can actually take it.** Otherwise the button says why ("App orders closed for tonight", "Closed now") and "Schedule a pickup" is offered.
- **Distances are never invented.** With location: miles from the person, with walk time under 1.5 miles and drive time beyond. With location off or unknown: no distances, and a plain note plus "Locate me". Searching a neighborhood or ZIP measures from there and says so ("Closest to North Park"). More than 60 miles away: say how far ("You're 2,428 miles from San Diego") and let them order ahead.
- **Search** takes café names, addresses, neighborhoods and ZIP codes. No match gets friendly help, never a blank list.
- **The list:** your café first, then closest; badges "YOUR CAFÉ" and "CLOSEST"; an "Open now" filter; the sheet expands to a full list (and does so by itself while typing). If every café is closed, say which opens first and offer scheduling.
- **Members skip this screen.** They open straight onto Home at their usual café, chosen in this order: the café they starred → the café worked out from their orders (each order counts, weighted toward recent ones so it fades over about six weeks; at least 3 orders) → otherwise they are asked "Where are you today?". The Home chip says why: "Your café" or "Your usual café".
- **Every order teaches it.** Ordering somewhere else enough times moves the usual café there; nobody has to change a setting.
- **In the list**, members see "YOUR CAFÉ" or "YOU GO HERE MOST" first, then "You've ordered here 9 times · last 2 days ago" on cafés they've used, then CLOSEST.
- **The nearby nudge.** If location is already allowed and a member is within 3 miles of a different café that is open (and more than 3 miles closer than their usual), Home offers "You're near La Jolla right now · order there instead?" with Switch and a dismiss. It never switches on its own and never asks for location to do this.
- **The map's pins and list rows open the same café screen.** The location button re-centres on the person, or asks for location if it's not known.

## 18. Accessibility

- Real `<button>` and `<a>` elements for anything tappable. The checker rejects click handlers on `div`, `span`, `li` and `p`.
- Every image has alt text; decorative ones use `alt=""`.
- Focus ring: 2 pt brass with a 2 pt gap.
- Contrast and touch-size rules above apply everywhere, including in seasonal skins.
