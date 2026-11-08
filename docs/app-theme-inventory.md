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
| quiz-lab | chalk-circuit | — | 3.19.1 / 1.0.3 | Attune (chalk-circuit is also offered to 6 other apps; make it Quiz Lab's) |
| pulse | pulse-ivory | pulse-night-chart | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (Ivory Serif attuned + new dark); app bump pending |
| reels | noir-marquee | screening-room | 3.19.1 / 1.0.3 | Attune, pick one of the two (velvet-reel was its own and is gone) |
| voyage | midnight-atlas | — | 3.19.1 / 1.0.3 | Recreate (horizon-drift was its own and is gone; midnight-atlas is shared with 5 apps) |
| cookbook | cookbook-terracotta | cookbook-slate | 3.29.0 / 1.0.3 | **Done** in 2.2.0 (Terracotta Kitchen attuned + new dark); app bump pending |
| impulse | impulse-pause | impulse-still-water | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (recreated, light + dark); app bump pending |
| ascend | ascend-contour | ascend-contour-night | 3.34.0 / 2.1.0 | **Done** in 2.1.0 (recreated, light + dark) |
| seeds | seeds-blossom | seeds-nightlight | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (Blossom Meadow attuned + new dark); app bump pending |
| garage | garage-workshop | garage-night-drive, garage-redline | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (recreated light + dark, Carbon Velocity attuned as Redline); app bump pending |
| basket | cyber-forest | 11 others | 3.30.0 / 1.0.3 | Attune cyber-forest, or recreate; 12 options today |
| hub | hub-shallows | hub-deep-water | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (Ocean Depths attuned + new light); app bump pending |
| nutritrack | nutritrack-fresh-market | nutritrack-verdant | 3.19.1 / 1.0.3 | **Done** in 2.2.0 (Verdant Pulse attuned + new light); app bump pending |
| iuliancristea | carbon-velocity | 10 others, `allowedThemes` set | 3.19.1 / 1.0.3 | Attune carbon-velocity; already uses `allowedThemes` |
| react-showcase | luna | — | 3.19.1 / 1.0.3 | Keep all themes (it is the theme gallery) |

## Local Tools

| App | Starts on | Also offered | libs / themes | Proposed |
|---|---|---|---|---|
| iot | circuit-harbor | — | 3.25.0 / 1.4.0 | Attune |
| global-pulse | orbital-night | — | 3.19.1 / 1.0.3 | Attune |
| lifespan | vital-aurora | — | 3.19.1 / 1.0.3 | Attune |
| health-iq | vital-signal | — | 3.19.1 / 1.0.3 | Attune (vital-signal is also offered to 3 Online apps) |
| network-audit | signal-clarity | audit-ember | 3.19.1 / 1.0.3 | Attune signal-clarity |
| realestate-crawler | blueprint-clay | — | 3.19.1 / 1.0.3 | Attune |
| atelier-media | atelier-media | — | 3.19.1 / 1.0.3 | Attune |
| lumen | lumen | — | 3.19.1 / 1.0.3 | Attune |
| atlas-of-time | luna (hardcoded) | chrono-atlas | 3.19.1 / 1.0.3 | Attune chrono-atlas and make it the default |
| tessera | vault-guard (hardcoded) | — | 3.29.0 / 1.4.0 | Attune vault-guard, or recreate (a password manager may want its own) |
| pinhole | audit-ember (hardcoded) | — | 3.28.0 / 1.4.0 | Recreate (borrows Network Audit's second theme) |
| holdings | luna | — | 3.28.2 / 1.0.3 | Recreate (gilded-bear was its own and is gone) |
| nexus | luna (fallback) | — | 3.19.1 / 1.0.3 | Recreate (command-slate was its own and is gone) |
| lifeline | luna (fallback) | — | 3.19.1 / 1.0.3 | Recreate |
| reverb | luna (fallback) | — | 3.19.1 / 1.0.3 | Recreate |
| mirror | ocean-depths (fallback) | — | 3.19.1 / 1.0.3 | Recreate, or share Hub's |
| llm-lab | arctic-blue (hardcoded) | — | 3.19.1 / 1.0.3 | Recreate, low priority |
| faviconify | arctic-blue (hardcoded) | — | 3.19.1 / 1.0.3 | Recreate, low priority |

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

- Attune: 23 (19 if Seeds, Basket, Tessera and Cookbook go to Recreate instead).
- Recreate: 12 (16 in that case).
- Done: Shelf.
- Later: 10 games and simulators, plus React Showcase.

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
4. **Local Tools, attune:** IoT, Global Pulse, Lifespan, Health-IQ, Network Audit,
   Real Estate Crawler, Atelier Media, Lumen, Atlas of Time, Tessera.
5. **Local Tools, recreate:** Holdings, Nexus, Lifeline, Reverb, Mirror, Pinhole, LLM Lab,
   Faviconify.
6. **Games and simulators**, if ever.
