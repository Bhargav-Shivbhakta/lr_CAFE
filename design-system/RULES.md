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

- **The animation engine** lives in `design-system/mascot/engine.ts` (tests in `engine.test.mjs`): the motion library (every motion the cup can do, its length and energy, its stage effect) and the director that picks what comes next.
- **Only one cup, ever.** One cup on screen at a time. It lives in its stage on Home; no card, countdown or special draws a second cup (they use icons). Holiday stories take that same cup out of its stage, which stays empty, and bring it back: every story starts and ends in the stage (`STORIES` in the engine, tested). Tips, photo loading and order moments borrow the cup the same way.
- **Everyday library (normal days, approved Nov 2026):** 19 moves, each one clear idea in 2-3 steps, props big enough to read. Always on: breathe and blink, steam curl. Fidgets: glances at you (wink), yawn (mornings and evenings). Café moments: latte art, barista pour, morning paper, today's special (walks across the banner with it on a tray), headphones. Big moments (afternoons, rare): little shuffle dance, twirl. Time of day: opening up (flips CLOSED to OPEN on the first open before 8 AM), closed for the night (BACK AT 7 sign, dozes; a tap wakes it to wave). Reacts to the app: your usual (holds up a card with it), one drink from a reward (four gold stars, the fifth blinks), making your order (brewing steam and a progress bar, then rings a bell), welcome back (after 3+ days away). Touch: tap to giggle, press and hold for heart eyes. Dropped: looks around, head tilt, smells the coffee, stretch. Pacing (`nextEveryday`): fidgets between rests of 2.5-5 s, a café moment every 4th turn (every third of those is about you), a big move at most every 12th turn; never repeats within the last three; pauses while scrolling, during tips and order moments, and when the app is hidden. On Home the cup is 108 pt; props sit to the left or over its head so they never hit the bell or run off the screen. Holidays keep their own loop and stories.
- **Stories (holidays):** every holiday act plays INSIDE the Home banner (from the header down to the location pill); the cup never goes below it. There is only one cup: the stage cup itself acts (no second copy), and if Home redraws mid-act the stage stays hidden until the act ends. Each act is slow, one idea in 2-3 steps, and ends with a caption anyone can read. New Year: holds up a card counting 3, 2, 1, then pops a popper (confetti), "Happy New Year!". 4th of July: a sparkler, then three fireworks shoot up into the banner, "Happy 4th of July!". Veterans Day (calm): holds a small flag, then raises a big waving flag, gold stars, "Thank you, veterans". Halloween: witch hat and broom, flies up to the top of the banner with bats and back, in plain view (nothing drawn over the cup), "Happy Halloween!". Coffee Day: juggles three beans, drops them in, "Happy National Coffee Day!". Back to School (College Area): reads a book, an A+ pops up, "Good luck this semester!". Mother's Day: brings out a bouquet and holds it up beside itself (never over the face), offers it with heart eyes, petals, "Celebrate Mother's Day with us!" (brunch). Father's Day: shakes a gift, the lid pops, it's a big navy bow tie (a long tie read as a tongue at this size), puts it on, thumbs up, "Celebrate Father's Day with us!" with a breakfast burrito or short rib grilled cheese. (We invite rather than wish: not everyone celebrating is a dad or a mom.) Valentine's: wings and a heart balloon, floats up within the banner and back, "Happy Valentine's Day!". Christmas takes turns on a loop while Home is open (8 AM-9 PM, ~14 s apart): the Santa cup rides its sleigh across the top of the banner with a gold sparkle trail, then walks to the Christmas tree in the banner and puts the star on top ("Happy holidays!", "Merry Christmas!" on the 24th and 25th). Thanksgiving: the pie parade, a pumpkin pie on its head, inside the banner. Christmas is red and white (deep red tab bar), with string lights and a tree in the banner.
- **Holiday details in the banner:** every holiday adds a garland along the top of the banner and one prop in the free space between the logo and the bell, behind the words: Christmas lights and a tree; Thanksgiving leaves and pumpkins; Halloween bunting and a jack-o'-lantern; New Year gold beads and balloons with the year; 4th of July bunting and crossed flags; Valentine's hearts and a love letter; Mother's Day flowers and tulips; Father's Day bunting and a #1 DAD ribbon; Coffee Day beans and a latte; Back to School pennants, books, a pencil and an apple; Veterans Day flag bunting (calm). Each act plays once a day when Home opens (not in quiet hours) and again when the cup is tapped; at most ~10 s. The old "peek" (which dropped the cup down the page) is replaced on Home by a small in-place peek.
- **The cup has its own stage on Home** (76 px, next to the greeting) and is never frozen: it always breathes and blinks, and every 1.5 to 3.5 seconds does something: looks around, waves, hops, stretches, squishes, a little dance or twirl. Never the same motion twice in a row; at most one big motion in any three, so it feels alive, not hyperactive.
- **Time of day:** stretches in the morning, livelier by day, softer in the evening; from 9 PM to 7 AM only quiet motions and it dozes (zzz).
- **Holidays take over the stage** with their outfit and motion set: Christmas (Santa hat, snowfall, jingle), Valentine's (heartbeat, hearts), Thanksgiving (scarf, leaf swirl), New Year (party hat, confetti pop), 4th of July (sparkle, fireworks), Halloween (witch hat, bats), Coffee Day (beret, juggling beans), Mother's Day (flower, petals), Father's Day (tie, proud), Back to School (glasses, study), Veterans Day (calm only).
- **Reactions jump the queue:** a hop when something goes into the bag, a cheer when an order is placed, a giggle when tapped.
- The loop pauses when Home isn't on screen, while photos load, during tips and order moments. Reduce Motion: a still cup, no loop.

## 11. Seasonal and holiday themes

- The calendar in `themes/calendar.ts` decides the look of every day. Nobody switches themes by hand.
- **Seasons** (no holiday running) change only the hero and special card colours, the eyebrow, the accent, the tint and the cup's outfit.
- **Holidays dress the whole app from Home onward** (the holiday's main days; the lead-up stays a seasonal skin with a countdown). The opening, the location screen, the map and the café pages never change. A holiday kit changes:
  - the colours of the whole app: buttons, links, tints, background, bag bar, sheets and messages (contrast still checked);
  - the greeting ("Happy Valentine’s, Bhargav") and one line under it;
  - a decoration along the top of the tab bar, and a small mark on the active tab;
  - a gentle fall across Home when it opens (hearts, snow, leaves, confetti or stars) that stops by itself;
  - a burst from the button when something goes into the bag;
  - **the cup's holiday act**, once a day when Home opens, and again whenever someone taps the cup: Valentine's, a winged cup floating across with a heart balloon; Christmas, the cup as Santa pulling a sleigh of gifts across the sky; Thanksgiving, the cup parading a big pumpkin pie across the top banner, lifting it up in the middle; New Year, a 3-2-1 countdown and a confetti popper; 4th of July, the cup with a sparkler and fireworks; Veterans Day, the cup quietly holding a small flag.
  - The other tabs show the cup in its holiday outfit.
  - **A dark holiday tab bar** with light icons, a holiday band behind the top of Home, and a tinted background on every tab.
  - **Holiday icons:** the tab icons, the bag and the bell are redrawn for the holiday (Christmas: a tree, a cup in a Santa hat, a gift box, Santa's hat; Valentine's: hearts; Thanksgiving: a leaf and a pumpkin; New Year: a glass and a popper; 4th of July: stars; Veterans Day: a medal). Section headings get a small holiday mark.
  - Changing holiday or leaving Home stops any effect still running.
- **Every holiday also gets:**
  - **a holiday shelf** on Home: one section only that holiday has, with real menu items ("For the table", "Brunch for Mom", "Study fuel"…);
  - **order moments:** "Order placed" and "Ready at the counter" screens in the holiday's colours with the cup in its outfit;
  - **a collectible sticker:** the first order during a holiday earns that year's sticker, kept on the Rewards card;
  - **a holiday app icon:** the home-screen icon gets the holiday's mark (iPhone and Android alternate icons). It can be turned off in Account, and because iPhone shows a short system message when the icon changes, it switches at most once per holiday;
  - **a lead-up countdown** on Home during the runway ("Starts in 6 days · Remind me").
- **Holidays with a full look:** Valentine's week, Mother's Day, Father's Day, 4th of July, Back to School (College Area only), National Coffee Day, Halloween, Veterans Day, Thanksgiving week, Christmas, New Year.
- Holidays never change the layout, the fonts, the logo or where buttons are, so the show-around tips and people's habits keep working.
- Effects never block a tap, never play in quiet hours on their own (9 PM to 8 AM), and are off with Reduce Motion.
- **Veterans Day is respectful:** navy, a thin flag stripe, "Thank you to everyone who served", no falling effects, no bursts, no jokes.
- **Per-café holidays:** a holiday can be limited to some cafés. Back to School runs only at College Area (SDSU).
- **Food and drink days** (National Pancake Day and so on) never change the theme. Home just suggests the matching item that day.
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

- **Batch 1 is in** (64 photos from the café's own online menu, already enhanced: 52 matched to menu items, 12 new dishes waiting for a menu entry). App files: `assets/menu/<item id>-sq.webp` (600×600, cards), `-wide.webp` (800×500 smart crop, the hero), `-th.webp` (240, small rows). The list and the questions for the café are in `data/photos.json`. Import a pack with `node tools/photos/import-pack.mjs <pack> <map.json>`.
- **The dish is the hero of every crop.** Each photo has a focus point and zoom in `tools/photos/focus.json` (set by looking at the photo), so cards show the burger, not the fries or the plate. Shapes: `-hero` 820×400 for the big special card, `-card` 600×450, `-sq` 600×600 for square tiles, `-th` 240×240. `node tools/photos/recrop.mjs <pack> <map.json>` rebuilds them. Product tiles are square so the dish has room; the special card's photo is 200 tall.
- **One treatment, no second filter:** enhanced photos are used as they are. Angles stay consistent by type: overhead for flat dishes (pizza, salads, bowls, soup), three-quarter for burgers, sandwiches, wraps, wings and drinks. A photo's angle is never faked: a menu photo must show the real dish.
- Items without a photo show a calm "Photo coming" tile, never a broken image.

- **Photo pack 2 (SDSU, Nov 2026):** 149 AI-generated illustrations (1200x1200). 135 are on the app menu and are imported (`tools/photos/import-pack2.mjs`), marked `kind: illustration, review: true` in `data/photos.json`; 14 dishes are not on the app menu yet and wait in `assets/menu/new/` for a name, price and category. They are drafts: the café must check ingredients, sides and garnishes, and the generated cup logo and wording, before anything ships. Real photos (batch 1) always win over illustrations. Refills use their original drink's picture (`sameAs` in `data/photos.json`): Coffee refill → House coffee ("For dine-in mugs"), Iced tea refill → Iced tea. Crops by kind of dish: drinks show the whole cup and the top of the drink (not just the logo); breakfast sides zoom in; skillets sit a little right. The mockup ships only the square crop per item (its 512-file limit); the app uses all four crops.

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
  - **Members** go straight from the logo to Home. There is no welcome screen. The opening already greets them by name, and Home carries their name, points and usual drink with "Order again".
  - **Newcomers** are shown around the real Home screen, not a tour. There are no extra screens, no slideshow and no introduction speech. Five tips at most, one at a time: each dims the screen, puts a soft spotlight on the real button and shows a small card with the cup, "N OF 5", a short title and one or two sentences. In order: the café chip (switch café or pickup time), a special's Add button (the bag appears at the bottom), Order, Rewards (press and hold for the member code) and Account.
  - **How tips move:** one spotlight and one card stay on screen the whole time and are never redrawn. On Next, the words fade out (150 ms), then the spotlight changes shape and glides to the next button while the list scrolls in step with it, all on the sheet curve (460 ms). The card travels with the spotlight. If the card has to move to the other side of the button, it fades across instead of sliding over it. The cup, title and text come back in with a 40 ms stagger, and a brass ring pulses once on arrival. The progress dots stretch into a pill. Taps during a move are never dropped: they play right after. Back and the arrow keys go both ways. With reduced motion, everything moves instantly.
  - **The spotlight never guesses.** After every move it re-measures the real button and corrects itself, so it always lands on the button and the card never covers it. A redraw while tips are open keeps the scroll position.
  - **Tips are tied to anchors, never to layout.** Home changes every day: specials, Trending, holiday cards, nudges. So each tip points at a fixed `data-coach` anchor (`cafe`, `add`, `order`, `rewards`, `account`), which is put back after every Home redraw. `add` goes on the first special's Add button, or on any Add if there are no specials. If Home redraws while a tip is open, the spotlight glides to the button's new place. If today's Home has no button for a tip, that tip is left out and the count says so ("1 OF 4"). The tips never close because Home changed. Any new Home design must keep these anchors.
  - Skip, tapping outside, the phone's back gesture or leaving Home closes the tips right away. They show once, and "Show me around again" in Account replays them.
- After that, give one short tip the first time someone reaches a feature, in the same spotlight style. One tip per visit, each shown once.
- Notification permission is asked right after the first order ("Want a text when it's ready?"), never on first launch.

## 16. Navigation: nobody gets stuck

- **Tapping the tab you're on** takes you back to the top of it.
- **Home waits for its photos:** it opens only when every photo on it has loaded, behind the cup filling with coffee and a count ("4 of 6 photos"); never longer than 8 seconds. On the phone the native launch screen stays up while they load.
- **The logo on Home:** tap it to go back to the top; double-tap it to refresh Home (the logo tilts, a thin line runs under it, and "Home is up to date" shows). The full logo (couch, people and lettering) is used everywhere the brand appears, never the lettering alone. On dark backgrounds it sits on a cream badge.

- Every screen that isn't a tab's first screen has a visible back button that names where it goes ("‹ All cafés", "‹ Home"). Never a bare arrow.
- The app keeps a real history: the iOS swipe-from-the-left-edge gesture and Android's back gesture or button walk back through exactly where the person has been.
- Every sheet or pop-up closes four ways: the ✕, tapping outside it, swiping it down, and the phone's back gesture (Android back closes the sheet first, before leaving the screen).
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
- **Members skip this screen.** They open straight onto Home at their café: the café they starred if there is one, otherwise the café where they last ordered. The chip at the top says why ("Your café" or "Last order") and has a ▾ so it reads as changeable. Tapping it opens the map, where that café carries "YOUR CAFÉ" or "YOUR LAST ORDER". A member with no orders yet goes through location like a guest.
- **Every order teaches it.** Ordering at a different café makes that the café next time. Nobody has to change a setting. Switching from the nearby nudge without ordering changes today only.
- **In the list**, members see "YOUR CAFÉ" or "YOU GO HERE MOST" first, then "You've ordered here 9 times · last 2 days ago" on cafés they've used, then CLOSEST.
- **The nearby nudge.** If location is already allowed and a member is within 3 miles of a different café that is open (and more than 3 miles closer than their usual), Home offers "You're near La Jolla right now · order there instead?" with Switch and a dismiss. It never switches on its own and never asks for location to do this.
- **The map's pins and list rows open the same café screen.** The location button re-centres on the person, or asks for location if it's not known.

## 18. Accessibility

- Real `<button>` and `<a>` elements for anything tappable. The checker rejects click handlers on `div`, `span`, `li` and `p`.
- Every image has alt text; decorative ones use `alt=""`.
- Focus ring: 2 pt brass with a 2 pt gap.
- Contrast and touch-size rules above apply everywhere, including in seasonal skins.

## 19. Platform: a native iOS and Android app

- **The product is a native app for iPhone and Android phones**, published on the App Store and Google Play. It is not a website or a web app. The clickable mockup is a web page only so it can be reviewed in a browser.
- **One codebase, both phones:** React Native with Expo, in TypeScript. The tokens, calendar, specials engine and Home engine are reused as they are. Screens are built from React Native components, never HTML or CSS.
- The design-system components written for the web mockup (`Pip.tsx`, `Loader.tsx`, `Icon.tsx`, `motion.css`) are rebuilt for React Native: `react-native-svg` for drawings, Reanimated for motion, the same timings and curves from the tokens. The checker gains React Native versions of its rules.
- **Opening:** the phone's own launch screen shows the logo on the cream background, then hands over without a jump to the animated letter-by-letter opening.
- **Location:** our explainer screen comes first, then the system prompt. Ask only for "While using the app" (iOS) or approximate/precise while in use (Android). Never background location.
- **Map:** the illustrated San Diego map is drawn in the app with `react-native-svg`, exactly as approved. Directions opens Apple Maps on iPhone and Google Maps on Android.
- **Back:** iOS edge swipe and Android back. No browser history, no keyboard shortcuts needed. Hardware keyboards (iPad) are a bonus, not a requirement.
- **Sheets:** native bottom sheets that follow the finger when swiped down.
- **Touch feel:** light haptics on tip steps, Add to bag and confirmations, using the phone's haptic engine.
- **Accessibility:** VoiceOver and TalkBack labels on every control; Dynamic Type and Android font scaling up to 200% without clipping; iOS Reduce Motion and Android Remove animations turn the motion off.
- **Screens:** respect the notch, the Dynamic Island, the home indicator and Android edge-to-edge bars (safe areas).
- **Storage:** the starred café, last order and "tips shown" are kept on the phone. Sign-in tokens go in the secure keychain/keystore.
- **Testing:** on real phones with Expo during the build, then TestFlight (iPhone) and Google Play internal testing before release. The café owns the Apple and Google developer accounts the app is published under.


## 20. Order tab (approved on the canvas Nov 24, 2026; in the live mockup)
- **Top:** "Order" with a round search button at the right of the title. Tapping it grows the button into the search field across the title row (420 ms), so it never squeezes the meal bar. Pickup / dine in / delivery row under it.
- **Meal bar:** Drinks · Breakfast · Lunch & dinner · Sweets, pinned while scrolling. Its background fades in only once the page scrolls under it.
- **Inside a meal:** Most popular row, then "What kind of …?" photo tiles (Breakfast: Handhelds 16, Egg plates 17, Pancakes & crepes 6, Light & fresh 4, Sides 10). Groups live in `data/order-groups.json`.
- **Inside a kind:** its header is what stays pinned (back, title, filter icon, one line of kind chips such as All 16 · Burritos 5 · Bagels 6 · Croissants 5). The filter icon opens Sort (Popular, price up, price down) and Diet (Vegetarian, Vegan, Gluten-free), with a count badge and a Clear line. Popular first inside every kind. Popular = the menu's own "p" flag until sales data exists.
- **Search:** understands typos, plain words ("something cold", "healthy"), diet and budget ("vegan under $12"). It says "We don't have …" with similar picks (sushi → salmon, ahi tuna, shrimp). Empty field shows starting points.
- **Dish sheet:** opens with the photo. Order of the page: name, price, description, "Goes great with it" (real menu items at menu price, e.g. fries $6.00, side of bacon $4.00, cookie $2.25, added as their own bag lines), then the customize card ("Make it yours" / "Your choices · Edit" / "Required: choose your eggs"). Scrolling pulls the sheet to full screen; pulling down at the top steps back, then closes.
- **Customize:** full screen, photo scrolls away with the options, floating back button, "Done · $price". Drinks use the café's own SDSU Toast options: milk (whole, 2%, half & half, oat/almond/soy/coconut +$1.00, heavy cream +$1.25), espresso (+$0.50 single, +$1.00 double, half caff), flavor (vanilla, caramel, hazelnut, cinnamon, spiced brown sugar +$0.75). No cup sizes. Food extras priced from the café's sides (avocado $3.00, bacon $4.00, an egg $2.25, hash brown $4.00); eggs/protein/cheese required where the menu says "choice of"; free "Leave something out". Not yet known: fries upgrade price, salad protein prices, cold foam.
- **Meal times:** each café's `mealPeriods` in `data/cafe.json` (SDSU: breakfast 7 AM – 3 PM, as the owner's side told us Nov 24, 2026; lunch & dinner all day until confirmed). Outside a meal's hours its dishes stay visible but greyed with "From 7 AM", the meal page says when it's back ("Breakfast is served 7 AM – 3 PM. It's back tomorrow at 7 AM.") and offers lunch & dinner; nothing outside its hours can be added.
- **Sold out:** greyed card with a "Sold out" label and no + button. The dish page says "Sold out today", when it's usually back, and offers three close dishes you can order now (same kind first, popular first). In search, sold-out dishes drop to the end; if the dish you named is sold out, the close ones come first. In the real app this comes from the café's Toast stock (Toast already marks items OUT OF STOCK).
- **Removed dishes:** `retired` in `data/order-groups.json` lists dishes people may still search for (from other Living Room menus or taken off this one) with where to point them ("Philly cheesesteak is no longer on the menu. These are the closest: Steak sandwich & fries…"). When the café removes a dish, it goes here.
- **Search ranking for an ingredient:** every dish that really has the word shows. Dishes come first ("Dishes with bacon": the burger, BLT, club, omelettes…), sides after ("On the side").
- **Bag:** each line is a dish with its choices and its own price.
- **Tapping Order again:** closes search, or leaves a kind, or scrolls back to the top. The app's bottom bar (Home, Order, Rewards, Account) stays; the dish sheet sits above it.
- **Open questions for the café:** table service; delivery radius and fee; meal hours; prices for the 14 new dishes; SDSU protein list (La Jolla's used); which add-ons should be pushed as upsells.
- **Meal bar labels wrap:** tabs are 62px tall and "Lunch & dinner" sits on two lines, so no label ever touches its tab's edges.

## 21. Text never overflows (checked every day)

- No text may be cut, end in "…", run past its own button or label, sit closer than 4px to a boxed button's edge, or stick out past the screen. Names wrap instead.
- `tools/qa/ui-check.mjs` walks every screen, meal, kind, dish, customize view, search, after-hours and sold-out state, and every holiday's Home, and fails on any of these. Holiday animations that fly across on purpose (sleigh, broom) are skipped.

## 22. Holidays run themselves

- Every theme switches on from its date rule in `tokens.json → themes.holidays`: fixed days, "nth weekday" (Thanksgiving, Mother's and Father's Day) and Easter work out every year with no edits.
- Date tables (Back to School at SDSU) need each year's dates; a year can list several (spring and fall). `tools/qa/calendar-check.mjs` works out the next five years daily and lists any missing dates.
- New Year's Eve says the year that is starting (Dec 31, 2026 → "Happy New Year 2027").
- **Holiday food on Home:** each holiday puts its own row above Specials (Christmas: "Hot cocoa season" with the hot chocolates, sugar cookie and chocolate scone; Thanksgiving, Valentine's, Halloween and the rest have their own). Items are matched by name to the live menu and skipped if missing or sold out.

## 23. Demo frame

- On a computer the demo shows a phone-sized frame, scaled to fit the window and kept fully on screen. On a real phone it fills the screen.
- US spelling throughout (favorites, not favourites).

## 24. One door into the bag (see ARCHITECTURE.md)

- Every "+", "Add" and "Order again" calls `toBag(id)` → `Bag.plan()` (engine/bag-engine.js). No screen adds to the bag on its own.
- Anything with choices or "Goes great with it" opens the dish page first, from Home, Order, search and holiday rows alike. Only plain items add straight away; "Order again" repeats the saved usual exactly.
- Guarded by engine/bag.test.mjs and the daily screen check, which clicks every + on screen.


## 25. The bottom bar never goes away

- Home, Order, Rewards and Account stay on screen and tappable at all times: over dish pages, full screen, customize, the bag and every sheet. Sheets open in the space above the bar.
- Tapping a tab while a dish page or sheet is open closes it and goes to that tab.
- Every dish page has a visible close (✕) button at the top right, in every state. Pulling down and tapping outside also close it.
- The daily screen check fails if the bar is covered or the ✕ is missing.
