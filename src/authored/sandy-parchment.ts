import type { AuthoredTheme } from './contract.ts';

// Aged cream paper, burnished amber actions and soft ink text. The values are the classic
// Sandy Parchment's own; what changed is that they are now its design choices, and every
// component value is derived from them.
export const sandyParchment: AuthoredTheme = {
    id: 'sandy-parchment',
    label: 'Sandy Parchment',
    scheme: 'light',

    fonts: {
        body: "'Figtree', 'Avenir Next', sans-serif",
        display: "'Newsreader', Georgia, serif",
    },

    canvas: {
        color: '#f4ecdc',
        layers: 'radial-gradient(120% 100% at 0% 0%, #f8ecd0 0%, #e8d7af 45%, #cbb383 100%)',
    },

    ink: '#20160d',
    text: '#423929',
    textSoft: '#635847',
    textMuted: '#7e725f',
    placeholder: '#817664',

    surface: 'rgba(255, 248, 230, 0.95)',
    surfaceAlt: 'rgba(255, 241, 207, 0.42)',
    control: '#f4ead2',
    controlFocus: '#f8efd8',
    hover: '#ead8ae',
    track: '#e4d4a7',
    stripe: '#efe0bd',
    overlay: 'rgba(255, 248, 230, 0.72)',

    divider: 'rgba(90, 68, 34, 0.18)',
    border: 'rgba(88, 67, 34, 0.22)',
    controlBorder: 'rgba(88, 67, 34, 0.28)',
    controlBorderHover: '#b7884d',
    edge: 'rgba(255, 252, 240, 0.8)',

    accent: { solid: '#c66f22', hover: '#a85618', glow: '#df9048', link: '#a85b1c', linkHover: '#cf792c' },
    success: { solid: '#3f7d45', hover: '#326738' },
    warning: { solid: '#b68432', hover: '#9a6a25', text: '#8a5f1e' },
    danger: { solid: '#9f2f2f', hover: '#842525' },
    onSolid: '#fff8e9',

    selection: 'ink',
    toasts: 'solid',
    cardTitle: { style: 'italic', weight: 500, size: 'var(--font-size-xl)' },
    modalTitle: { weight: 500, size: 'var(--font-size-sm)', transform: 'uppercase', tracking: '0.18em' },
    labels: { weight: 500, transform: 'uppercase', tracking: '0.18em' },
    headerWeight: 500,

    shadows: {
        card: '0 18px 40px rgba(68, 50, 23, 0.14), 0 2px 8px rgba(68, 50, 23, 0.1)',
        surface: '0 1px 0 rgba(255, 252, 240, 0.9) inset, 0 0 0 1px rgba(31, 24, 17, 0.08), 0 18px 40px -20px rgba(60, 40, 20, 0.45)',
        modal: '0 28px 80px rgba(34, 29, 22, 0.32), 0 6px 18px rgba(34, 29, 22, 0.2)',
    },
    blur: 'blur(22px) saturate(1.4)',
    scrim: 'rgba(34, 29, 22, 0.42)',
};
