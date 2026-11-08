# @memobit/themes

Themes for the Memobit apps, in two forms:

- **Authored** (new in 2.0): a hand-made theme written as its design choices — ink and text
  tiers, paper surfaces, lines, the accent and status colours, how a selection looks, the
  voice of titles and labels, shadows and glass. The build derives every component value
  from those choices through one shared bridge, so badges, chips, inputs and toasts behave
  the same way in every theme while each keeps its own look.
- **Classic**: the 49 hand-written themes, each setting ~230 component values directly and
  published as its own stylesheet. They keep working unchanged while apps move over.

Extracted from [`@memobit/libs`](https://github.com/CristeaIulian/memobit-react-library) in
v3.0.0 of that library.

## Authored themes

```ts
import '@memobit/themes/authored.css';
import { applyAuthoredEngine, clearAuthoredEngine } from '@memobit/themes';

applyAuthoredEngine(); // the authored version of whatever data-theme names, where one exists
clearAuthoredEngine(); // back to the classic theme
```

An authored theme applies under its classic theme's `data-theme` while the root carries
`data-theme-engine="authored"`, so an app can flip between the two. Where no authored
version exists, the classic theme shows through.

### Layers

1. **The theme** (`src/authored/<id>.ts`): about 20 required choices and some optional
   ones, typed by `src/authored/contract.ts`. Written by hand or with Claude Design.
2. **Roles** (`scripts/authored/derive.ts`): turns the choices into semantic roles
   (`--surface-*`, `--text-*`, `--border-*`, `--field-*`, `--tone-*`, `--selected-*`). An
   optional choice left out gets the obvious derivation, e.g. a hover is the solid pushed
   towards the ink.
3. **Bridge** (`scripts/authored/bridge.ts`): maps the roles onto every component token
   `@memobit/libs` reads (`--button-info-background-color`, `--dropdown-header-color`…).
4. **Recipes** (`src/authored/recipes.css`): Badge and Chip share one tone recipe.

Every tone (neutral, accent, success, warning, danger) exposes the same roles: `solid`,
`solid-hover`, `on-solid`, `soft`, `soft-hover`, `on-soft`, `border`, `text`. Buttons,
badges, chips, toasts, progress bars and tabs all read them, which is what keeps a
"success" the same colour everywhere. The lib's `info` variant is its primary action and
maps to the accent tone. Every field (text inputs, dropdowns, date pickers, sliders) reads
the same `--field-*` roles, and the `selection` choice (`ink`, `soft`, `solid`) decides how
selected chips, tabs and ticked checkboxes look.

### Checks

`npm run build:authored` fails when

- a token some classic theme sets is not produced by the bridge, since it would leak
  through from the classic theme still loaded underneath,
- a role the bridge or recipes read is not produced by a theme,
- a theme names a font that neither its `fonts.url` nor its classic entry loads, or
- a new theme has a text/background pair below its contrast target (4.5:1, 3:1 for
  placeholders).

An authored version of a classic theme only reports contrast below target, since it
reproduces the classic theme as it was.

### Two kinds of authored theme

- **A new theme** (an id with no classic entry) is a theme in its own right: the build gives
  it a stylesheet at `dist/themes/<id>.css`, served and loaded on demand like the classic
  ones, a registry entry (with `apps` as its recommended apps) and a picker swatch, all in
  the generated `src/authoredThemes.ts`. New themes come first in `THEME_CONFIGS`, so an app
  listed in a theme's `apps` starts on it, light before dark. Apps pick them up by bumping
  this package; nothing changes in the app.
- **An authored version of a classic theme** (same id, e.g. `sandy-parchment`) applies under
  that classic theme while `data-theme-engine="authored"` is set, for side-by-side
  comparison in the theme lab (`@memobit/libs/theme-lab`).

### Adding a theme

1. Draft it in `src/authored/concepts/<id>.ts` (an `AuthoredTheme` with `apps` and a
   `description`) and run `npm run preview:concepts`. It writes `dist/concepts.html`: every
   app theme and draft drawn as a small screen of its app, with its contrast report. Sample
   content per app lives in `scripts/authored/samples/`, one file per batch.
2. Once chosen, move it to `src/authored/<id>.ts` and run `npm run build`.

To start from a classic theme instead, `npm run port:classic -- <id>` drafts
`src/authored/<id>.ts` from its stylesheet.

## Classic themes

### Why

Themes used to ship as a single aggregate stylesheet that every app imported wholesale —
~618 KB of which exactly one theme is ever active. Splitting them took one app's CSS from
866 KB to 295 KB.

### Install

```bash
npm install @memobit/themes
```

### Usage

Add the Vite plugin. It emits each theme as a separate asset and tells `@memobit/libs`
where to find them, so `ThemeProvider` fetches the selected theme and nothing else.

```ts
import { memobitThemes } from '@memobit/themes/vite';

export default defineConfig({
    plugins: [react(), memobitThemes({ root: __dirname })],
});
```

Without the plugin nothing breaks: the library falls back to assuming the aggregate
stylesheet was imported the old way.

```ts
import '@memobit/themes/themes.css';
```

Note that the aggregate no longer pulls in `base.scss` and `scrollbars.scss`. Those are not
themes, they stay in `@memobit/libs`, and an app must import them directly:

```ts
import '@memobit/libs/dist/styles/base.scss';
import '@memobit/libs/dist/styles/scrollbars.scss';
```

### Exports

```ts
import {
    FAVORITE_THEMES,
    getThemeAppearance,
    getThemeConfig,
    LIGHT_THEMES,
    previewPalettes,
    THEME_CONFIGS,
} from '@memobit/themes';
```

`previewPalettes` holds the six colours the theme picker needs to draw a swatch for a theme
whose stylesheet is not loaded. It is generated from the compiled CSS, because ten themes
build their tokens through the `_profile-theme` mixin rather than declaring them literally.

### Adding a theme

1. Add `src/theming/<name>.scss`, scoped to `[data-theme='<name>']`.
2. Add a `@use` line in `src/themes.scss`.
3. Add an entry to `THEME_CONFIGS` in `src/themeConfig.ts`, with its font URLs.
4. Add it to `LIGHT_THEMES` if it is a light theme.
5. Run `npm run build` — the per-theme stylesheet and its preview palette are generated.

The build fails if a theme is missing any of the six preview tokens, so a new theme cannot
ship with a broken swatch.

## License

Apache-2.0
