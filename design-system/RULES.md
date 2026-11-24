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
| Mascot | Pip (working name) |

To change one, edit `choice` in `tokens.json` and run `npm run tokens`.

## 2. Colour

- Only token colours. No hex or rgb values in app code.
- **Café red** (`--primary`) is for actions and the active tab. Never a large background, never body text.
- **Ink** for all text and icons. **Muted** for secondary text; it still passes 4.5:1.
- **Brass** for rewards, tiers and small details. Never for text under 24 px.
- **Error red** (`--error`) only for problems, always with an icon and a sentence, so it is never mistaken for the café red.
- **Success green** always comes with a tick or words.
- Every text colour meets 4.5:1 on its background (3:1 for 24 px and up). The checker measures every palette and every seasonal skin.

## 3. Type

- Two fonts only: `var(--font-display)` and `var(--font-text)`. Never a font name in app code.
- Use the scale classes: `.t-display`, `.t-title`, `.t-heading`, `.t-body`, `.t-label`, `.t-caption`, `.t-eyebrow`.
- Nothing under 11 px. Prices use tabular figures.
- Text grows with the phone's text-size setting up to 200% without breaking layouts.

## 4. Space and layout

- Gaps come from the 4-pt scale: 4, 8, 12, 16, 20, 24, 32, 40, 56.
- Screen edges 20, between cards 12, between sections 32.
- Header 56, tab bar 49 plus 34 for the home indicator, bag bar 56 floating 12 above the tabs.
- Nothing crosses the 20 pt margin except full-bleed photos and the specials carousel.
- Every tap target is at least 44 × 44 pt.

## 5. Corners and depth

- Radius tokens only: xs 6 (tags), sm 12 (inputs, list photos, chips), md 20 (cards), lg 28 (sheets), pill (buttons, search, segmented controls).
- Four depth levels: 0 page, 1 cards, 2 floating (bag bar, toasts, banners), 3 sheets and dialogs over a dimmed page. In dark mode, shadows become fine outlines.

## 6. Buttons

- Three levels, in order of importance: filled, tinted, outline or text. **One filled button per screen.**
- Three sizes: large 52 (the bottom action, full width), medium 44 (in cards and sheets), small 32 (dense rows only; the tap area still reaches 44).
- Four states on every button: default, pressed (darker, scales to 0.97), disabled (pale, with the reason nearby), loading (mini cup, words say what is happening).

## 7. Icons

- Only the 20 icons in `icons/Icon.tsx`, one stroke weight.
- An icon that acts alone needs a spoken label. Colour never carries meaning alone.

## 8. Motion

- Durations and curves come from `--dur-*` and `--ease-*`. The checker rejects any other millisecond value.
- Motion explains what happened. It is never decoration for its own sake.
- **No spinners.** Use `<CupLoader/>` for short waits and `<PipLoader/>` for long ones.
- Only loaders, the steam on the hero card and Pip's idle may loop. Everything else plays once.
- One celebration at a time. Rewards, tier-up and order-ready never play together.
- Nothing moves on checkout, payment or error screens except the press and the wrong-code shake.
- Exits run at about 70% of the entrance time.
- Reduced motion is respected everywhere; loaders show a still, full cup.

## 9. Mascot (Pip)

- Use `<Pip/>` from `pip/Pip.tsx`. Never redraw, recolour, stretch or outline Pip.
- **Never on checkout, payment or price screens.** The checker blocks it.
- One Pip per screen, no bigger than a third of it. Sizes: 24, 40, 64, 96, 150, 200.
- One-shot animations play at most 3 times, then Pip rests.
- Pip never guilt-trips: no "Pip misses you", no sad faces for staying away.
- Pip stays quiet in quiet hours (9 PM to 8 AM). A setting in Account turns Pip's animations off.
- Pip is for waiting, celebrating and gentle apologies. A serious problem, like a failed payment, gets plain words and no mascot.

## 10. Seasonal and holiday themes

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

## 11. Opening hours

- Hours come from `data/cafe.json` until the app reads them live from Toast.
- The café is treated as open every day. A closure or special hours only appear if a date is added to `closures`. No location publishes holiday closures.
- The app never says "closed" from a guess. When unsure, it shows the regular hours.

## 12. Photos

- Shapes: 1:1 for menu lists (radius 12), 4:3 for item pages, 4:5 for holiday specials, 16:10 for the Home hero and posts (radius 20).
- Warm daylight from the side, real wood and café mugs, food from above, drinks at 45°.
- Text over a photo sits on a dark warm fade so it passes 4.5:1. No heavy filters, no stock photos of other cafés.

## 13. Voice

| Say | Not |
| --- | --- |
| Your usual? | Reorder previous item |
| Ready in about 8 minutes | Order status: processing |
| That code didn't match. Try again. | Error 401: invalid OTP |
| Double points all week | 2X PTS PROMO!!! |
| We're out of almond milk today | Item unavailable |

Short, warm, plain. No exclamation marks in a row, no all-caps sentences, no emoji in system messages.

## 14. Accessibility

- Real `<button>` and `<a>` elements for anything tappable. The checker rejects click handlers on `div`, `span`, `li` and `p`.
- Every image has alt text; decorative ones use `alt=""`.
- Focus ring: 2 pt brass with a 2 pt gap.
- Contrast and touch-size rules above apply everywhere, including in seasonal skins.
