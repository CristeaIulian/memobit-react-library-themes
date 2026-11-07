import type { AuthoredTheme } from '../../src/authored/contract.ts';

import { BRIDGE } from './bridge.ts';
import { contrast, type Oklch, over, parseColor } from './color.ts';
import { deriveOverrides, deriveRoles } from './derive.ts';

// Shared by the build and the concept preview: turning a theme into its stylesheet, and the
// checks every theme goes through.

// Scales the lib defines itself, and variables the recipes set on the element.
const LIB_SCALES = /^--(font-size|font-weight|spacing|radius|recipe)-?/;
// Font names that need no web font.
const GENERIC_FONTS = /^(system-ui|-apple-system|sans-serif|serif|monospace|ui-[a-z-]+)$/;
const WHITE: Oklch = { l: 1, c: 0, h: 0 };
const RECIPE_SCOPE = ":root[data-theme-engine='authored']";

export interface ThemeSheet {
    css: string;
    /** Roles the bridge or recipes read that the theme does not produce. */
    missing: string[];
}

/** The theme's stylesheet under `scope`: every role and component token, then the badge and chip recipes. */
export const themeSheet = (theme: AuthoredTheme, scope: string, recipes: string): ThemeSheet => {
    const tokens = { ...deriveRoles(theme), ...BRIDGE, ...deriveOverrides(theme) };
    const scopedRecipes = recipes.replaceAll(RECIPE_SCOPE, scope);
    const read = [...`${Object.values(tokens).join(';')}${scopedRecipes}`.matchAll(/var\((--[a-z0-9-]+)\)/g)].map(match => match[1]);
    const missing = [...new Set(read)].filter(name => !(name in tokens) && !LIB_SCALES.test(name));
    const declarations = Object.entries(tokens)
        .map(([name, value]) => `${name}:${value}`)
        .join(';');

    return { css: `${scope}{${declarations}}\n${scopedRecipes.trim()}\n`, missing };
};

const firstFamily = (stack: string): string =>
    stack
        .split(',')[0]
        .trim()
        .replace(/^['"]|['"]$/g, '');

/** Font families the theme names that none of `urls` loads. */
export const unloadedFonts = (theme: AuthoredTheme, urls: (string | undefined)[]): string[] => {
    const loaded = new Set(
        urls.flatMap(url => (url === undefined ? [] : [...url.matchAll(/family=([^:&]+)/g)].map(match => decodeURIComponent(match[1].replace(/\+/g, ' ')))))
    );

    return [theme.fonts.body, theme.fonts.display]
        .flatMap(stack => (stack === undefined ? [] : [firstFamily(stack)]))
        .filter(family => !GENERIC_FONTS.test(family) && !loaded.has(family));
};

/**
 * Text/background pairs the theme writes directly that fall below their contrast target.
 * Translucent surfaces are painted over what sits beneath them (cards over the canvas base,
 * headers and controls over cards).
 */
export const contrastWarnings = (theme: AuthoredTheme): string[] => {
    const warnings: string[] = [];

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
            warnings.push(`${label} is ${ratio.toFixed(2)}:1, target ${minimum}`);
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

    return warnings;
};
