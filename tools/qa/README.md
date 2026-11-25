# Daily check

Runs every morning on GitHub (Actions → "Daily check"), on every push, and with `npm run daily` on a computer.

| Check | What it looks at | Fails the run when |
|---|---|---|
| `npm run check` | engine, notification, design and cup-mascot tests | any test fails |
| `qa:security` | secrets (keys, tokens, passwords), plain-http links, scripts/data from unknown sites, risky code, `.gitignore` | anything is found |
| `npm audit` | packages with known security holes | a high or critical one |
| `qa:ui` | every screen of the mockup in Chrome: cut-off text, text shortened with …, things past the screen edge, broken pictures, `undefined`/`NaN` on screen, JavaScript errors, small buttons, every dish page opens, search finds what people type | text is cut off, something breaks, or search misses |
| `qa:copy` | every word customers read (menu, notifications, cup captions, groups, all on-screen text): spelling, repeated words, spacing, punctuation, a/an, brackets and quotes, placeholders | a spelling or grammar mistake (café and food words live in `words.txt`) |
| `qa:ai` | Claude reads every sentence and flags ones that don't make sense, read oddly, or claim something unconfirmed | never: findings are listed for a person to judge. Needs the `ANTHROPIC_API_KEY` secret. |

Also on: Dependabot (weekly pull requests for package security fixes) and CodeQL code scanning.
Turn on in GitHub settings: Secret scanning and Push protection (Settings → Code security).

Results: the run's summary page, and `tools/qa/out/` (downloadable from the run).
