# App theme inventory

Drafted 2026-11-07 for moving the apps to authored themes (@memobit/themes 2.0). Goal: one
theme per app, two or three at most, each authored as its design choices.

- **Attune** — the app already has a theme made for it. Port its classic values into an
  authored file (as with Sandy Parchment for Shelf), then tweak.
- **Recreate** — the app has no theme of its own (it was dropped, or the app borrows a
  generic or shared one). Design a dedicated theme from scratch, e.g. with Claude Design,
  then write it as an authored file.
- **Later** — games and simulators that hardcode one theme and have no picker.

The verdicts are proposals from the registry and each app's code, not from looking at
the apps. Change any of them.

## Online

Rows marked Done list the app's new themes: the light one it starts on, then its dark one(s).

| App | Starts on | Also offered | libs / themes | Proposed |
|---|---|---|---|---|
| shelf | sandy-parchment | — | 3.19.1 / 2.0.0 | **Done** (authored, matches v1); turn it on in prod |
| recall | recall-calling-card | recall-stage-light | 3.34.0 / 2.1.0 | **Done** in 2.1.0 (new light + dark) |
| readout | readout-highlighter | readout-night-reader | 3.34.0 / 2.1.0 | **Done** in 2.1.0 (new light + dark) |
| pocket | pocket-receipt | pocket-chip | 3.34.0 / 2.1.0 | **Done** in 2.1.0 (new light + dark) |
| tasks | tasks-legal-pad | tasks-deep-work | 3.34.0 / 2.1.0 | **Done** in 2.1.0 (Slate Focus taken further, light + dark) |
| quiz-lab | quiz-lab-whiteboard | quiz-lab-chalkboard | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (Chalk & Circuit attuned + new light); app bump pending |
| pulse | pulse-ivory | pulse-night-chart | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (Ivory Serif attuned + new dark); live |
| reels | reels-matinee | reels-marquee | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (cinema look, light + dark); app bump pending |
| voyage | voyage-field-guide | midnight-atlas | 3.36.0 / 2.4.0 | **Done**: new light in 2.3.0; the dark is classic Midnight Atlas again since 2.4.0 (the user preferred it to the attuned copy) |
| cookbook | cookbook-terracotta | cookbook-slate | 3.29.0 / 1.0.3 | **Done** in 2.2.0 (Terracotta Kitchen attuned + new dark); live |
| impulse | impulse-pause | impulse-still-water | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (recreated, light + dark); live |
| ascend | ascend-contour | ascend-contour-night | 3.34.0 / 2.1.0 | **Done** in 2.1.0 (recreated, light + dark) |
| seeds | seeds-blossom | seeds-nightlight | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (Blossom Meadow attuned + new dark); live |
| garage | garage-workshop | garage-night-drive, garage-redline | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (recreated light + dark, Carbon Velocity attuned as Redline); live |
| basket | basket-greenmarket | basket-emerald | 3.30.0 / 1.0.3 | **Done** in 2.3.0 (Cyber Forest attuned + new light); app bump pending |
| hub | hub-shallows | hub-deep-water | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (Ocean Depths attuned + new light); live |
| nutritrack | nutritrack-fresh-market | nutritrack-verdant | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (Verdant Pulse attuned + new light); live |
| iuliancristea | resume-letterpress | resume-graphite | 3.19.1 / 1.0.3 | **Done** in 2.3.0 for the admin (new light + dark); the public CV look is still open; app bump pending |
| react-showcase | luna | — | 3.19.1 / 1.0.3 | Keep all themes (it is the theme gallery) |

## Local Tools

| App | Starts on | Also offered | libs / themes | Proposed |
|---|---|---|---|---|
| iot | iot-wall-panel | iot-harbor | 3.25.0 / 1.4.0 | **Done** in 2.3.0 (Circuit Harbor attuned) |
| global-pulse | global-pulse-atlas-paper | global-pulse-orbital | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (Orbital Night attuned, glow kept); theme is hardcoded |
| lifespan | lifespan-aurora | lifespan-long-evening | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (Vital Aurora attuned) |
| health-iq | health-iq-lab-glass | health-iq-signal | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (Vital Signal attuned) |
| network-audit | network-audit-report | signal-clarity | 3.36.0 / 2.4.0 | **Done**: new light in 2.3.0; the dark is classic Signal Clarity again since 2.4.0 |
| realestate-crawler | realestate-blueprint | realestate-night-plan | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (Blueprint Clay attuned) |
| atelier-media | atelier-media-studio | atelier-media-darkroom | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (Atelier Media attuned) |
| lumen | lumen-contact-sheet | lumen-lantern | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (Lumen attuned, neutral greys); theme is hardcoded |
| atlas-of-time | chrono-atlas | atlas-of-time-night-archive | 3.36.0 / 2.4.0 | **Done**: classic Chrono Atlas (the app names it as its default) + new dark |
| tessera | vault-guard | tessera-keycard | 3.36.0 / 2.4.0 | **Done**: stays on classic Vault Guard (no picker); Keycard waits for a picker |
| pinhole | pinhole-lightbox | pinhole-darkroom | 3.28.0 / 1.4.0 | **Done** in 2.3.0 (recreated); theme is hardcoded and the picker ignores the saved choice |
| holdings | holdings-ledger | holdings-night-ledger | 3.28.2 / 1.0.3 | **Done** in 2.3.0 (recreated); theme is hardcoded |
| nexus | nexus-console | nexus-switchboard | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (recreated) |
| lifeline | lifeline-album | lifeline-starlit | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (recreated) |
| reverb | reverb-liner-notes | reverb-after-hours | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (recreated) |
| mirror | mirror-reflection | mirror-still-lake | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (recreated) |
| llm-lab | llm-lab-bench | llm-lab-inference | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (recreated); theme is hardcoded |
| faviconify | faviconify-sticker-sheet | faviconify-glow-stick | 3.19.1 / 1.0.3 | **Done** in 2.3.0 (recreated); theme is hardcoded |

## Games and simulators (later)

| App | Theme (hardcoded) | libs / themes |
|---|---|---|
| skirmish | war-room | 3.19.1 / 1.3.0 |
| fieldcut | terminal-phosphor | 3.27.0 / 1.4.0 |
| defrag-simulator | terminal-phosphor | 3.27.0 / 1.4.0 |
| scandisk-simulator | terminal-phosphor | 3.27.0 / 1.4.0 |
| windefrag-simulator | arctic-blue | 3.27.0 / 1.4.0 |
| hangman | blossom-meadow | 3.27.0 / 1.4.0 |
| pebblebrook | garden-harvest | 3.27.0 / 1.4.0 |
| sliding-puzzle | garden-harvest | 3.27.0 / 1.4.0 |
| tic-tac-toe | ocean-breeze | 3.27.0 / 1.4.0 |
| solar-mission | azure-night | 3.19.1 / 1.0.3 |

## Counts

- Done: every Online app and every Local Tool with a theme picker (Shelf in 2.0.0, batches 1-5
  in 2.1.0-2.3.0).
- Later: 10 games and simulators, plus React Showcase.

## 3.0.0 cleanup (2026-11-08)

Reviewed side by side on the cleanup page (`npm run preview:cleanup`): 41 classic themes no
app recommended were removed. Details the user preferred in a few were folded into their
replacements first (Redline's red text, Lifespan Aurora's lime success, Health-IQ Signal's
danger badge and Mesh Circuit's fonts, Cookbook Terracotta's button, Fresh Market's Garden
Harvest page and progress colours). Eight classic themes remain: sandy-parchment,
midnight-atlas, vault-guard, asphalt-code, terminal-phosphor (kept, nothing replaces it),
signal-clarity, chrono-atlas, war-room. Games and simulators stay on themes 1.x, where their
themes still exist. Luna is gone, so an app falls back to its own theme (`fallbackTheme`).

After the cleanup a near-duplicates review (`npm run preview:duplicates`, 57 look-alike themes
in 19 groups) kept every theme: each is tuned to its app. Two stale recommendations were
removed: "Backup" (no such app) from vault-guard and "Cars Crawler" (no themed UI) from
asphalt-code, which now stays only for the iuliancristea public CV list.

## Things to settle along the way

- **Shared defaults.** sandy-parchment (Shelf, Ascend), sandstone (Cookbook, Impulse),
  blossom-meadow (Seeds, Garage) and midnight-atlas (Voyage, five others) each start more
  than one app. With one theme per app, each belongs to one app and the others get their
  own.
- **The registry's recommended lists.** Most Online apps are offered 5–13 themes today.
  Once an app has its 1–3, set them through `allowedThemes` on `ThemeProvider` (Resume
  already does), and trim `recommendedApps` to match.
- **Classic themes no app starts on** — arctic-blue, azure-night, crimson-dusk, dashdarkx,
  luna, ocean-breeze, citrus-vital, terminal-phosphor, graphite-shell. Several are still
  hardcoded by tools and games, and luna is the fallback, so check before deleting.
- **libs version per app.** Most apps are on libs 3.19.1. Themes 2.0 installs next to it
  with an npm peer warning; the theme lab and `fallbackTheme` need libs 3.32. Bumping libs
  from 3.19 to 3.32 is the per-app risk of each batch, not the theme itself.

## Suggested batches

Each batch: author its themes in the themes package, one themes minor release, then per
app bump, compare in the theme lab, turn authored on, set `allowedThemes`.

1. **Online, own themes:** Recall, Readout, Pocket, Tasks (attune) + Ascend (recreate).
   Done in 2.1.0.
2. **Online, shared themes:** Cookbook, Seeds, Hub, NutriTrack, Pulse (attune) + Impulse,
   Garage (recreate). Done in 2.2.0.
3. **Online, the rest:** Basket, Reels, Quiz Lab, iuliancristea (attune) + Voyage (recreate).
   Done in 2.3.0.
4. **Local Tools, attune:** IoT, Global Pulse, Lifespan, Health-IQ, Network Audit,
   Real Estate Crawler, Atelier Media, Lumen, Atlas of Time, Tessera. Done in 2.3.0.
5. **Local Tools, recreate:** Holdings, Nexus, Lifeline, Reverb, Mirror, Pinhole, LLM Lab,
   Faviconify. Done in 2.3.0.
6. **Games and simulators**, if ever.
