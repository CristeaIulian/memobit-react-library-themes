// Generates the hand-made (authored) themes: each theme's choices become the shared roles,
// the bridge turns those into every component value, and the badge/chip recipes apply on
// top. Every `src/authored/*.ts` file except the contract is a theme. There are two kinds:
//
//   - An authored version of a classic theme (same id as a THEME_CONFIGS entry). It applies
//     under that classic theme's `data-theme` while the root carries
//     data-theme-engine="authored", so an app can flip between the two. Its fonts come from
//     the classic entry unless it names its own. Output: dist/authored/<id>.css and
//     dist/authored.css.
//   - A new theme (no classic entry). It gets everything a classic theme has: its own
//     stylesheet at dist/themes/<id>.css (served and loaded on demand like the others), a
//     registry entry and a picker swatch in src/authoredThemes.ts. It must pass every
//     contrast check and name its fonts' URL.
//
// The build also fails when a token some classic theme sets is not produced by the bridge,
// or a role the bridge or recipes read is not produced by a theme.

import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { format, resolveConfig } from 'prettier';

import type { AuthoredTheme } from '../src/authored/contract.ts';
import { THEME_CONFIGS } from '../src/themeConfig.ts';

import { BRIDGE } from './authored/bridge.ts';
import { contrastWarnings, themeSheet, unloadedFonts } from './authored/checks.ts';

const root = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const authoredDir = join(root, 'src/authored');
const outDir = join(root, 'dist/authored');
const classicDir = join(root, 'dist/themes');
const recipes = readFileSync(join(authoredDir, 'recipes.css'), 'utf8');

const failures: string[] = [];
const warnings: string[] = [];
const overrideSheets: string[] = [];
const newSheets: string[] = [];

const isAuthoredTheme = (value: unknown): value is AuthoredTheme =>
    typeof value === 'object' && value !== null && 'id' in value && 'canvas' in value && 'accent' in value && 'selection' in value;

const themes: AuthoredTheme[] = [];

for (const file of readdirSync(authoredDir)
    .filter(name => name.endsWith('.ts') && name !== 'contract.ts')
    .sort()) {
    const exports: Record<string, unknown> = await import(pathToFileURL(join(authoredDir, file)).href);
    themes.push(...Object.values(exports).filter(isAuthoredTheme));
}

const duplicates = themes.map(theme => theme.id).filter((id, index, ids) => ids.indexOf(id) !== index);

if (duplicates.length > 0) {
    failures.push(`Authored theme ids used twice: ${duplicates.join(', ')}`);
}

// Coverage against the classic themes.
if (!existsSync(classicDir)) {
    throw new Error('dist/themes is missing: run build:themes before build:authored.');
}

const classicTokens = new Set<string>();

for (const file of readdirSync(classicDir).filter(name => name.endsWith('.css'))) {
    for (const match of readFileSync(join(classicDir, file), 'utf8').matchAll(/(--[a-z0-9-]+)\s*:/gi)) {
        classicTokens.add(match[1]);
    }
}

const uncovered = [...classicTokens].filter(token => !(token in BRIDGE)).sort();

if (uncovered.length > 0) {
    failures.push(`Tokens set by classic themes but not by the bridge: ${uncovered.join(', ')}`);
}

// Cleared first so a removed theme does not linger in dist and get published.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const newThemes: AuthoredTheme[] = [];

for (const theme of themes) {
    const config = THEME_CONFIGS.find(candidate => candidate.value === theme.id);
    const isNew = config === undefined;
    const scope = isNew ? `[data-theme='${theme.id}']` : `:root[data-theme-engine='authored'][data-theme='${theme.id}']`;
    const { css, missing } = themeSheet(theme, scope, recipes);

    // Every role read must be produced, or a component would fall back to the classic value.
    if (missing.length > 0) {
        failures.push(`${theme.id}: roles read but not produced: ${missing.join(', ')}`);
    }

    const fontUrls = theme.fonts.url !== undefined ? [theme.fonts.url] : isNew ? [] : [config.fontUrl, config.fontUrlDisplay, config.fontUrlMono];
    const unloaded = unloadedFonts(theme, fontUrls);

    if (unloaded.length > 0) {
        failures.push(`${theme.id}: ${unloaded.join(', ')} not loaded by fonts.url${isNew ? '' : ' or its THEME_CONFIGS entry'}`);
    }

    // A new theme is held to the contrast targets; a classic one ported as it was is only reported.
    const contrast = contrastWarnings(theme).map(warning => `${theme.id}: ${warning}`);
    (isNew ? failures : warnings).push(...contrast);

    if (isNew) {
        newThemes.push(theme);
        newSheets.push(css);
        writeFileSync(join(classicDir, `${theme.id}.css`), css);
    } else {
        overrideSheets.push(css);
        writeFileSync(join(outDir, `${theme.id}.css`), css);
    }
}

if (failures.length > 0) {
    throw new Error(`Authored theme build failed:\n  ${failures.join('\n  ')}`);
}

writeFileSync(join(root, 'dist/authored.css'), overrideSheets.join('\n'));

// The legacy aggregate carries every theme, new ones included.
if (newSheets.length > 0 && existsSync(join(root, 'dist/themes.css'))) {
    appendFileSync(join(root, 'dist/themes.css'), newSheets.join('\n'));
}

// The registry entries and picker swatches of the new themes, light first within each app.
const ordered = [...newThemes].sort(
    (a, b) => (a.apps?.[0] ?? '').localeCompare(b.apps?.[0] ?? '') || (a.scheme === b.scheme ? 0 : a.scheme === 'light' ? -1 : 1)
);
const configs = ordered.map(theme => ({
    value: theme.id,
    label: theme.label,
    fontUrl: theme.fonts.url ?? '',
    ...(theme.apps === undefined ? {} : { recommendedApps: theme.apps }),
}));
const palettes = Object.fromEntries(
    ordered.map(theme => [
        theme.id,
        {
            '--body-background': theme.canvas.color,
            '--body-accent-color': theme.accent.text ?? theme.accent.solid,
            '--body-color-muted': theme.textMuted,
            '--card-background-color': theme.surface,
            '--header-background-color': theme.control,
            '--header-border-bottom-color': theme.divider,
        },
    ])
);

const listPath = join(root, 'src/authoredThemes.ts');
const listSource = `// AUTO-GENERATED by scripts/build-authored.ts — do not edit by hand.
//
// The hand-made themes. AUTHORED_THEMES lists all of them; the rest describe the new ones
// (those without a classic counterpart) the way the classic registry describes its own.

import type { PreviewToken } from './previewPalettes';
import type { ThemeConfig } from './themeConfig';

export const AUTHORED_THEMES = ${JSON.stringify(themes.map(theme => ({ id: theme.id, label: theme.label })))} as const;

export const AUTHORED_THEME_CONFIGS: ThemeConfig[] = ${JSON.stringify(configs)};

export const AUTHORED_LIGHT_THEMES: readonly string[] = ${JSON.stringify(ordered.filter(theme => theme.scheme === 'light').map(theme => theme.id))};

export const AUTHORED_PREVIEW_PALETTES: Readonly<Record<string, Readonly<Record<PreviewToken, string>>>> = ${JSON.stringify(palettes)};
`;
const prettierConfig = await resolveConfig(listPath);
writeFileSync(listPath, await format(listSource, { ...prettierConfig, filepath: listPath }));

console.log(`authored: ${themes.length} theme(s), ${newThemes.length} new (${newThemes.map(theme => theme.id).join(', ') || 'none'})`);

if (warnings.length > 0) {
    console.log(`Contrast below target (kept as the classic theme had them):\n  ${warnings.join('\n  ')}`);
}
