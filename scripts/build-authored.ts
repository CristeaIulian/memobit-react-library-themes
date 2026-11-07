// Generates the hand-made (authored) themes: each theme's choices become the shared roles,
// the bridge turns those into every component value, and the badge/chip recipes apply on
// top. Every `src/authored/*.ts` file except the contract is a theme. Output:
// dist/authored/<id>.css per theme, dist/authored.css with all of them, and
// src/authoredThemes.ts listing them for the runtime.
//
// An authored theme applies under its classic theme's `data-theme` while the root carries
// data-theme-engine="authored", so an app can flip between the two. Its stylesheet slot and
// its web fonts still come from that classic theme's THEME_CONFIGS entry.
//
// The build fails when
//   - a token some classic theme sets is not produced by the bridge, since it would leak
//     through from the classic theme still loaded underneath,
//   - a role the bridge or recipes read is not produced by a theme, or
//   - a theme names a font its THEME_CONFIGS entry does not load.
// Contrast is reported, not enforced, while authored themes reproduce classic ones as they were.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { format, resolveConfig } from 'prettier';

import type { AuthoredTheme } from '../src/authored/contract.ts';
import { THEME_CONFIGS } from '../src/themeConfig.ts';

import { BRIDGE } from './authored/bridge.ts';
import { contrast, type Oklch, over, parseColor } from './authored/color.ts';
import { deriveOverrides, deriveRoles } from './authored/derive.ts';

const root = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const authoredDir = join(root, 'src/authored');
const outDir = join(root, 'dist/authored');
const recipes = readFileSync(join(authoredDir, 'recipes.css'), 'utf8');

// Scales the lib defines itself, and variables the recipes set on the element.
const LIB_SCALES = /^--(font-size|font-weight|spacing|radius|recipe)-?/;
// Font names that need no web font.
const GENERIC_FONTS = /^(system-ui|-apple-system|sans-serif|serif|monospace|ui-[a-z-]+)$/;
const WHITE: Oklch = { l: 1, c: 0, h: 0 };

const failures: string[] = [];
const warnings: string[] = [];
const sheets: string[] = [];

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
const classicDir = join(root, 'dist/themes');

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

const firstFamily = (stack: string): string =>
    stack
        .split(',')[0]
        .trim()
        .replace(/^['"]|['"]$/g, '');

const loadedFamilies = (urls: (string | undefined)[]): Set<string> =>
    new Set(
        urls.flatMap(url => (url === undefined ? [] : [...url.matchAll(/family=([^:&]+)/g)].map(match => decodeURIComponent(match[1].replace(/\+/g, ' ')))))
    );

// Cleared first so a removed theme does not linger in dist and get published.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const theme of themes) {
    const scope = `:root[data-theme-engine='authored'][data-theme='${theme.id}']`;
    const roles = deriveRoles(theme);
    const overrides = deriveOverrides(theme);
    const tokens = { ...roles, ...BRIDGE, ...overrides };
    const themeRecipes = recipes.replaceAll(":root[data-theme-engine='authored']", scope);

    // Every role read must be produced, or a component would fall back to the classic value.
    const read = [...`${Object.values(tokens).join(';')}${themeRecipes}`.matchAll(/var\((--[a-z0-9-]+)\)/g)].map(match => match[1]);
    const missing = [...new Set(read)].filter(name => !(name in tokens) && !LIB_SCALES.test(name));

    if (missing.length > 0) {
        failures.push(`${theme.id}: roles read but not produced: ${missing.join(', ')}`);
    }

    // The ThemeProvider loads fonts from the classic entry, so every family the theme names must be in it.
    const config = THEME_CONFIGS.find(candidate => candidate.value === theme.id);

    if (config === undefined) {
        failures.push(`${theme.id}: no classic theme with this id, which an authored theme needs for its stylesheet slot and fonts`);
    } else {
        const loaded = loadedFamilies([config.fontUrl, config.fontUrlDisplay, config.fontUrlMono]);
        const unloaded = [theme.fonts.body, theme.fonts.display]
            .flatMap(stack => (stack === undefined ? [] : [firstFamily(stack)]))
            .filter(family => !GENERIC_FONTS.test(family) && !loaded.has(family));

        if (unloaded.length > 0) {
            failures.push(`${theme.id}: ${unloaded.join(', ')} not loaded by its THEME_CONFIGS entry; add them to fontUrl or fontUrlDisplay`);
        }
    }

    // Contrast on the pairs a theme writes directly. Translucent surfaces are painted over what
    // sits beneath them (cards over the canvas base, headers and controls over cards).
    const paint = (value: string, base: Oklch): Oklch | null => {
        const parsed = parseColor(value);

        return parsed === null ? null : over(parsed, base);
    };

    const canvas = paint(theme.canvas.color, WHITE);
    const card = canvas === null ? null : paint(theme.surface, canvas);
    const surfaces = {
        canvas,
        card,
        'card header': card === null ? null : paint(theme.surfaceAlt, card),
        control: card === null ? null : paint(theme.control, card),
    };

    const check = (label: string, foreground: string, background: Oklch | null, minimum: number): void => {
        const fg = background === null ? null : paint(foreground, background);

        if (fg === null || background === null) {
            return;
        }

        const ratio = contrast(fg, background);

        if (ratio < minimum) {
            warnings.push(`${theme.id}: ${label} is ${ratio.toFixed(2)}:1, target ${minimum}`);
        }
    };

    for (const [name, surface] of Object.entries(surfaces)) {
        check(`text on ${name}`, theme.text, surface, 4.5);
        check(`muted text on ${name}`, theme.textMuted, surface, 4.5);
        check(`accent text on ${name}`, theme.accent.text ?? theme.accent.solid, surface, 4.5);
    }

    check('link on card', theme.accent.link ?? theme.accent.solid, surfaces.card, 4.5);
    check('placeholder on control', theme.placeholder ?? theme.textMuted, surfaces.control, 3);

    for (const [name, colour] of Object.entries({ accent: theme.accent, success: theme.success, warning: theme.warning, danger: theme.danger })) {
        check(`text on ${name} solid`, theme.onSolid, paint(colour.solid, WHITE), 4.5);

        if (colour !== theme.accent) {
            check(`${name} text on card`, colour.text ?? colour.solid, surfaces.card, 4.5);
        }
    }

    const declarations = Object.entries(tokens)
        .map(([name, value]) => `${name}:${value}`)
        .join(';');
    const sheet = `${scope}{${declarations}}\n${themeRecipes.trim()}\n`;

    writeFileSync(join(outDir, `${theme.id}.css`), sheet);
    sheets.push(sheet);
}

if (failures.length > 0) {
    throw new Error(`Authored theme build failed:\n  ${failures.join('\n  ')}`);
}

writeFileSync(join(root, 'dist/authored.css'), sheets.join('\n'));

const listPath = join(root, 'src/authoredThemes.ts');
const listSource = `// AUTO-GENERATED by scripts/build-authored.ts — do not edit by hand.
//
// The hand-made themes. Each applies under the classic theme of the same id while the root
// carries data-theme-engine="authored".

export const AUTHORED_THEMES = ${JSON.stringify(themes.map(theme => ({ id: theme.id, label: theme.label })))} as const;
`;
const prettierConfig = await resolveConfig(listPath);
writeFileSync(listPath, await format(listSource, { ...prettierConfig, filepath: listPath }));

console.log(`authored.css: ${themes.length} theme(s), ${(sheets.join('').length / 1024).toFixed(1)} KB`);

if (warnings.length > 0) {
    console.log(`Contrast below target (kept as the classic theme had them):\n  ${warnings.join('\n  ')}`);
}
