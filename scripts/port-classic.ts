// Drafts an authored theme from a classic one: reads src/theming/<id>.scss and writes
// src/authored/<id>.ts with the classic values in the authored contract's shape. The draft
// is the starting point for attuning by hand, not the finished theme.
//
//   npm run port:classic -- kindred-ink lamplight
//
// Refuses to overwrite an authored file that already exists, so hand edits are never lost.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

import { THEME_CONFIGS } from '../src/themeConfig.ts';

import { contrast, parseColor } from './authored/color.ts';

const root = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const ids = process.argv.slice(2);

if (ids.length === 0) {
    throw new Error('Name at least one classic theme: npm run port:classic -- <id> [...]');
}

const FONT_WEIGHTS: Record<string, number> = { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 };

const readTokens = (id: string): Map<string, string> => {
    const source = readFileSync(join(root, 'src/theming', `${id}.scss`), 'utf8').replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
    const tokens = new Map<string, string>();

    for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
        tokens.set(match[1], match[2].replace(/\s+/g, ' ').trim());
    }

    return tokens;
};

const camelCase = (id: string): string => id.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());

for (const id of ids) {
    const target = join(root, 'src/authored', `${id}.ts`);
    const config = THEME_CONFIGS.find(candidate => candidate.value === id);

    if (config === undefined || !existsSync(join(root, 'src/theming', `${id}.scss`))) {
        throw new Error(`No classic theme "${id}".`);
    }

    if (existsSync(target)) {
        throw new Error(`src/authored/${id}.ts already exists; it may hold hand edits. Delete it first to re-port.`);
    }

    const tokens = readTokens(id);

    // Follows var() chains to a value the theme sets itself; anything else (lib scales such
    // as var(--font-size-xl)) is kept as written.
    const value = (name: string, seen = new Set<string>()): string | undefined => {
        const raw = tokens.get(name);

        if (raw === undefined || seen.has(name)) {
            return undefined;
        }

        seen.add(name);
        const reference = raw.match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*(.+))?\)$/);

        if (reference === null) {
            return raw;
        }

        return value(reference[1], seen) ?? reference[2] ?? raw;
    };

    const weight = (name: string): number | undefined => {
        const raw = value(name);
        const scale = raw?.match(/^var\(--font-weight-([a-z]+)\)$/);

        return scale !== null && scale !== undefined ? FONT_WEIGHTS[scale[1]] : raw === undefined ? undefined : Number(raw) || undefined;
    };

    const canvas = value('--body-background-base') ?? value('--body-background') ?? '#ffffff';
    const wash = value('--body-background-wash');
    const accent = value('--button-info-background-color') ?? '#888888';
    const canvasColour = parseColor(canvas);
    const chip = value('--chip-selected-background-color');
    const chipColour = chip === undefined ? null : parseColor(chip);
    const accentColour = parseColor(accent);
    const hueGap = chipColour === null || accentColour === null ? 180 : Math.abs(((chipColour.color.h - accentColour.color.h + 540) % 360) - 180);
    const selection =
        chipColour === null || canvasColour === null || accentColour === null
            ? 'soft'
            : contrast(chipColour.color, canvasColour.color) >= 7 && chipColour.color.c < 0.06 && chipColour.alpha >= 1
              ? 'ink'
              : hueGap < 25 && chipColour.alpha >= 1 && chipColour.color.c > 0.06
                ? 'solid'
                : 'soft';
    const glow = value('--infuse-effect-before-background')?.match(/#[0-9a-f]{3,8}\b/gi)?.[1];
    const blur = value('--card-backdrop-filter');

    // The mark is what the classic theme draws on surfaces (its progress fill), kept only where it differs from the button fill.
    const status = (prefix: string, progress: string, text?: string) => {
        const solid = value(`--button-${prefix}-background-color`);
        const mark = value(`--progress-${progress}-bar-fill-color`);

        return {
            solid,
            hover: value(`--button-${prefix}-hover-background-color`),
            ...(mark !== undefined && mark !== solid ? { mark } : {}),
            ...(text === undefined || text === solid ? {} : { text }),
        };
    };

    const theme = {
        id,
        label: config.label,
        scheme: canvasColour !== null && canvasColour.color.l > 0.6 ? 'light' : 'dark',
        fonts: { body: value('--font-family'), display: value('--font-family-display') },
        canvas: { color: canvas, ...(wash !== undefined && /gradient/.test(wash) ? { layers: wash } : {}) },
        ink: value('--body-title-color') ?? value('--body-color-accent'),
        text: value('--body-color'),
        textSoft: value('--body-sub-title-color'),
        textMuted: value('--body-color-muted'),
        placeholder: value('--form-control-placeholder-color'),
        surface: value('--card-background-color'),
        surfaceAlt: value('--card-background-accent-color'),
        control: value('--form-control-background-color'),
        controlFocus: value('--form-control-focus-background-color'),
        hover: value('--button-default-hover-background-color'),
        track: value('--progress-bar-background-color'),
        stripe: value('--list-alternate-background-color'),
        overlay: value('--modal-background-color'),
        menu: value('--dropdown-options-background-color'),
        button: value('--button-default-background-color'),
        divider: value('--delimiter-color'),
        border: value('--button-default-border-color') ?? value('--border-color'),
        controlBorder: value('--form-control-border-color'),
        controlBorderHover: value('--button-default-hover-border-color'),
        edge: value('--card-border-color'),
        edgeHover: value('--card-hover-border-color'),
        accent: {
            solid: accent,
            hover: value('--button-info-hover-background-color'),
            ...(value('--progress-info-bar-fill-color') !== accent ? { mark: value('--progress-info-bar-fill-color') } : {}),
            ...(value('--body-accent-color') !== accent ? { text: value('--body-accent-color') } : {}),
            ...(glow === undefined ? {} : { glow }),
            link: value('--links-color'),
            linkHover: value('--links-hover-color'),
        },
        success: status('success', 'success', value('--form-control-success-color')),
        warning: status('warning', 'warning'),
        danger: status('danger', 'danger', value('--body-danger-color')),
        onSolid: value('--button-info-color'),
        selection,
        toasts: value('--toast-info-background-color') === accent ? 'solid' : 'soft',
        cardTitle: {
            style: value('--card-title-font-style'),
            weight: weight('--card-title-font-weight'),
            size: value('--card-title-font-size'),
            transform: value('--card-title-text-transform'),
            tracking: value('--card-title-letter-spacing'),
        },
        modalTitle: {
            family: /font-family-display/.test(tokens.get('--modal-title-font-family') ?? '') ? 'display' : 'body',
            style: value('--modal-title-font-style'),
            weight: weight('--modal-title-font-weight'),
            size: value('--modal-title-font-size'),
            transform: value('--modal-title-text-transform'),
            tracking: value('--modal-title-letter-spacing'),
        },
        labels: {
            weight: weight('--form-control-label-font-weight'),
            transform: value('--form-control-label-text-transform'),
            tracking: value('--form-control-label-letter-spacing'),
        },
        headerWeight: weight('--header-font-weight'),
        shadows: { card: value('--card-box-shadow'), surface: value('--card-surface-box-shadow'), modal: value('--modal-box-shadow') },
        ...(blur !== undefined && blur !== 'none' ? { blur } : {}),
        shadowColor: value('--box-shadow'),
        scrim: value('--backdrop-color'),
    };

    const source = `import type { AuthoredTheme } from './contract.ts';

// Ported from the classic ${config.label} by scripts/port-classic.ts. Attune by hand from here.
export const ${camelCase(id)}: AuthoredTheme = ${JSON.stringify(theme)};
`;
    const prettierConfig = await resolveConfig(target);
    writeFileSync(target, await format(source, { ...prettierConfig, filepath: target }));

    console.log(`${id}: ${theme.scheme}, selection ${selection}, toasts ${theme.toasts} -> src/authored/${id}.ts`);
}
