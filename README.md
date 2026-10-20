# @memobit/themes

68 themes for the Memobit apps. Each is published as its own stylesheet, so an app loads
only the one it is showing instead of all of them.

Extracted from [`@memobit/libs`](https://github.com/CristeaIulian/memobit-react-library) in
v3.0.0 of that library.

## Why

Themes used to ship as a single aggregate stylesheet that every app imported wholesale —
~618 KB of which exactly one theme is ever active. Splitting them took one app's CSS from
866 KB to 295 KB.

## Install

```bash
npm install @memobit/themes
```

## Usage

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

## Exports

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

## Adding a theme

1. Add `src/theming/<name>.scss`, scoped to `[data-theme='<name>']`.
2. Add a `@use` line in `src/themes.scss`.
3. Add an entry to `THEME_CONFIGS` in `src/themeConfig.ts`, with its font URLs.
4. Add it to `LIGHT_THEMES` if it is a light theme.
5. Run `npm run build` — the per-theme stylesheet and its preview palette are generated.

The build fails if a theme is missing any of the six preview tokens, so a new theme cannot
ship with a broken swatch.

## License

Apache-2.0
