import type { AuthoredTheme, SelectionStyle, StatusColour, TitleVoice } from '../../src/authored/contract.ts';

// Turns an authored theme's choices into the roles the bridge reads. Where a choice is
// optional, the derivation is the "obvious" one a designer would make: a hover is the solid
// pushed towards the ink, a soft tint is the solid at low strength, and so on.

const mix = (a: string, b: string, percent: number): string => `color-mix(in oklab, ${a} ${percent}%, ${b})`;

// The selected state of chips, tabs and checkboxes, from one tone's roles. `solid` is what a
// ticked checkbox or radio fills with, since a soft tint would not read as checked.
const SELECTION_STYLES: Record<SelectionStyle, Record<string, string>> = {
    soft: {
        '--selected-bg': 'var(--tone-accent-soft)',
        '--selected-bg-hover': 'var(--tone-accent-soft-hover)',
        '--selected-fg': 'var(--tone-accent-on-soft)',
        '--selected-border': 'var(--tone-accent-border)',
        '--selected-solid': 'var(--tone-accent-solid)',
        '--selected-solid-fg': 'var(--tone-accent-on-solid)',
    },
    solid: {
        '--selected-bg': 'var(--tone-accent-solid)',
        '--selected-bg-hover': 'var(--tone-accent-solid-hover)',
        '--selected-fg': 'var(--tone-accent-on-solid)',
        '--selected-border': 'var(--tone-accent-solid)',
        '--selected-solid': 'var(--tone-accent-solid)',
        '--selected-solid-fg': 'var(--tone-accent-on-solid)',
    },
    ink: {
        '--selected-bg': 'var(--tone-neutral-solid)',
        '--selected-bg-hover': 'var(--tone-neutral-solid-hover)',
        '--selected-fg': 'var(--tone-neutral-on-solid)',
        '--selected-border': 'var(--tone-neutral-solid)',
        '--selected-solid': 'var(--tone-neutral-solid)',
        '--selected-solid-fg': 'var(--tone-neutral-on-solid)',
    },
};

const tone = (name: string, colour: StatusColour, theme: AuthoredTheme): Record<string, string> => {
    const mark = colour.mark ?? colour.solid;

    return {
        [`--tone-${name}-solid`]: colour.solid,
        [`--tone-${name}-mark`]: mark,
        [`--tone-${name}-solid-hover`]: colour.hover ?? mix(colour.solid, theme.ink, 82),
        [`--tone-${name}-on-solid`]: theme.onSolid,
        [`--tone-${name}-soft`]: mix(mark, 'transparent', 16),
        [`--tone-${name}-soft-hover`]: mix(mark, 'transparent', 24),
        [`--tone-${name}-on-soft`]: colour.text ?? mix(mark, theme.ink, 80),
        [`--tone-${name}-border`]: mix(mark, 'transparent', 40),
        [`--tone-${name}-text`]: colour.text ?? colour.solid,
    };
};

const voice = (prefix: string, title: TitleVoice | undefined, fallback: Required<Omit<TitleVoice, 'family'>>): Record<string, string> => ({
    [`${prefix}-style`]: title?.style ?? fallback.style,
    [`${prefix}-weight`]: String(title?.weight ?? fallback.weight),
    [`${prefix}-size`]: title?.size ?? fallback.size,
    [`${prefix}-transform`]: title?.transform ?? fallback.transform,
    [`${prefix}-tracking`]: title?.tracking ?? fallback.tracking,
});

export const deriveRoles = (theme: AuthoredTheme): Record<string, string> => {
    const { accent } = theme;
    const accentMark = accent.mark ?? accent.solid;
    // Shadows darken whatever they fall on: tinted ink on paper, plain black on a dark canvas.
    const shadow = theme.shadowColor ?? (theme.scheme === 'dark' ? '#000' : mix(theme.ink, 'transparent', 40));
    const card = voice('--display', theme.cardTitle, { style: 'normal', weight: 600, size: 'var(--font-size-lg)', transform: 'none', tracking: 'normal' });
    const border = theme.border;

    return {
        'color-scheme': theme.scheme,

        '--font-body': theme.fonts.body,
        '--font-display': theme.fonts.display ?? theme.fonts.body,
        '--font-mono': "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, monospace",
        ...card,
        '--label-weight': String(theme.labels?.weight ?? 600),
        '--label-transform': theme.labels?.transform ?? 'none',
        '--label-tracking': theme.labels?.tracking ?? 'normal',
        '--header-weight': String(theme.headerWeight ?? 600),

        '--canvas-layers': theme.canvas.layers ?? 'none',
        '--surface-canvas': theme.canvas.color,
        '--surface-card': theme.surface,
        '--surface-raised': theme.control,
        '--surface-raised-alt': theme.surfaceAlt,
        '--surface-overlay': theme.menu ?? theme.control,
        '--button-fill': theme.button ?? theme.control,
        '--surface-overlay-card': theme.overlay ?? theme.surface,
        '--surface-sunken': theme.track ?? mix(theme.hover, theme.ink, 92),
        '--control-hover': theme.hover,
        '--surface-hover': mix(accentMark, 'transparent', 8),
        '--surface-stripe': theme.stripe ?? theme.surfaceAlt,
        '--rating-empty': mix(theme.track ?? theme.hover, theme.ink, 85),
        '--surface-selected': mix(accentMark, 'transparent', 18),
        '--surface-blur': theme.blur ?? 'none',

        '--text-strong': theme.ink,
        '--text-default': theme.text,
        '--text-soft': theme.textSoft ?? theme.text,
        '--text-muted': theme.textMuted,
        '--text-subtle': theme.placeholder ?? theme.textMuted,
        '--text-link': accent.link ?? accent.text ?? accent.solid,
        '--text-link-hover': accent.linkHover ?? accent.solid,

        '--border-subtle': theme.divider,
        '--border-default': border,
        '--border-strong': theme.borderStrong ?? border,
        '--border-card': theme.edge ?? border,
        '--border-card-hover': theme.edgeHover ?? theme.edge ?? theme.borderStrong ?? border,

        '--field-bg': theme.control,
        '--field-bg-focus': theme.controlFocus ?? theme.control,
        '--field-bg-disabled': mix(theme.control, theme.ink, 94),
        '--field-fg': theme.text,
        '--field-border': theme.controlBorder ?? border,
        '--field-border-hover': theme.controlBorderHover ?? theme.borderStrong ?? theme.controlBorder ?? border,
        '--field-border-focus': accentMark,
        '--field-placeholder': theme.placeholder ?? theme.textMuted,
        '--field-label': theme.textMuted,
        '--field-ring': mix(accentMark, 'transparent', 24),

        '--tone-neutral-solid': theme.ink,
        '--tone-neutral-solid-hover': mix(theme.ink, theme.text, 70),
        '--tone-neutral-on-solid': theme.onSolid,
        '--tone-neutral-soft': theme.hover,
        '--tone-neutral-soft-hover': mix(theme.hover, theme.ink, 92),
        '--tone-neutral-on-soft': theme.ink,
        '--tone-neutral-border': border,
        '--tone-neutral-text': theme.textSoft ?? theme.text,
        ...tone('accent', accent, theme),
        ...tone('success', theme.success, theme),
        ...tone('warning', theme.warning, theme),
        ...tone('danger', theme.danger, theme),
        '--accent-glow': accent.glow ?? mix(accentMark, theme.onSolid, 70),
        ...SELECTION_STYLES[theme.selection],

        '--shadow-color': mix(shadow, 'transparent', 45),
        '--shadow-color-strong': mix(shadow, 'transparent', 62),
        '--shadow-sm': theme.shadows?.surface ?? theme.shadows?.card ?? `0 1px 2px ${mix(theme.ink, 'transparent', 12)}`,
        '--shadow-md': theme.shadows?.card ?? `0 8px 24px ${mix(theme.ink, 'transparent', 14)}`,
        '--shadow-lg': theme.shadows?.modal ?? `0 24px 64px ${mix(theme.ink, 'transparent', 26)}`,
        '--scrim': theme.scrim ?? mix(theme.ink, 'transparent', 45),
    };
};

/**
 * Component values a theme's voice sets directly, where no role covers it: a modal title
 * with its own small-caps voice, and toasts drawn as solid blocks instead of soft tints.
 */
export const deriveOverrides = (theme: AuthoredTheme): Record<string, string> => {
    const overrides: Record<string, string> = {};

    if (theme.modalTitle !== undefined) {
        const modal = voice('--modal-title-font', theme.modalTitle, {
            style: 'normal',
            weight: 600,
            size: 'var(--font-size-xl)',
            transform: 'none',
            tracking: 'normal',
        });

        Object.assign(overrides, {
            '--modal-title-font-family': theme.modalTitle.family === 'display' ? 'var(--font-display)' : 'var(--font-body)',
            '--modal-title-font-style': modal['--modal-title-font-style'],
            '--modal-title-font-weight': modal['--modal-title-font-weight'],
            '--modal-title-font-size': modal['--modal-title-font-size'],
            '--modal-title-text-transform': modal['--modal-title-font-transform'],
            '--modal-title-letter-spacing': modal['--modal-title-font-tracking'],
        });
    }

    if (theme.toasts === 'solid') {
        for (const [prefix, colour] of Object.entries({ info: theme.accent, success: theme.success, warning: theme.warning, danger: theme.danger })) {
            Object.assign(overrides, {
                [`--toast-${prefix}-background-color`]: colour.solid,
                [`--toast-${prefix}-color`]: theme.onSolid,
                [`--toast-${prefix}-border-color`]: mix(colour.solid, theme.onSolid, 75),
            });
        }
    }

    return overrides;
};
