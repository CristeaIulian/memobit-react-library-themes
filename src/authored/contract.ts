// What a hand-made theme decides. Each field is a deliberate design choice, written as an
// exact CSS value; everything a component reads is derived from these by the build, through
// one shared bridge (scripts/authored/bridge.ts), so a badge, a chip and an input behave the
// same way in every theme while each theme keeps its own look.
//
// Optional fields have a derivation (see scripts/authored/derive.ts). Set one only when the
// derived value is not what the theme wants.

export type SelectionStyle = 'ink' | 'soft' | 'solid';

export interface StatusColour {
    /** The fill behind text: buttons and solid toasts, paired with `onSolid`. */
    solid: string;
    hover?: string;
    /**
     * The colour drawn on a surface: progress fills, focus rings, slider thumbs, selected
     * days, accent borders, tints. Dark themes often make it brighter than the solid, which
     * has to stay dark enough for light text. Defaults to the solid.
     */
    mark?: string;
    /** Text in this tone on a surface. Defaults to the solid when it reads well enough. */
    text?: string;
    /** Text on this tone's solid, when it differs from the theme's `onSolid` (a light solid wanting dark text). */
    onSolid?: string;
}

export interface TitleVoice {
    /** Which of the theme's two fonts the title uses. Card titles always use the display font. */
    family?: 'body' | 'display';
    style?: 'normal' | 'italic';
    weight?: number;
    size?: string;
    transform?: 'none' | 'uppercase';
    tracking?: string;
}

export interface AuthoredTheme {
    /** The classic theme this replaces; the authored version applies under the same `data-theme`. */
    id: string;
    label: string;
    /** One or two sentences on the idea behind the theme, shown in previews. */
    description?: string;
    /** The apps this theme is made for. They list it first in the picker and start on it. */
    apps?: string[];
    scheme: 'light' | 'dark';

    fonts: {
        body: string;
        /** Titles. One font is a valid theme. */
        display?: string;
        /** Google Fonts URL loading both. Without it, fonts load from the classic theme's THEME_CONFIGS entry. */
        url?: string;
    };

    canvas: {
        /** The page's base colour, for anything that needs a solid. */
        color: string;
        /** Optional image layers painted over it (washes, glows), in `background` shorthand. */
        layers?: string;
    };

    // Text, darkest first.
    ink: string;
    text: string;
    textSoft?: string;
    textMuted: string;
    placeholder?: string;

    // Surfaces.
    /** Cards and panels. May be translucent for glass. */
    surface: string;
    /** Card headers, footers and table headers. */
    surfaceAlt: string;
    /** Inputs, dropdowns, menus, popovers, default buttons: anything you operate. */
    control: string;
    controlFocus?: string;
    /** Hover on controls (buttons, calendar days). Rows hover with a tint of the accent. */
    hover: string;
    /** Wells and tracks: progress bars, slider tracks. */
    track?: string;
    /** Alternate rows in lists and tables. Defaults to the alt surface. */
    stripe?: string;
    /** Modals and drawers. Defaults to the surface. */
    overlay?: string;
    /** Menus, popovers and calendars that float above the page. Defaults to the control colour. */
    menu?: string;
    /** Untoned (default) buttons. Defaults to the control colour. */
    button?: string;

    // Lines.
    divider: string;
    border: string;
    borderStrong?: string;
    /** Control borders. Defaults to the border. */
    controlBorder?: string;
    /** Control borders on hover. Defaults to the strong border. */
    controlBorderHover?: string;
    /** The card's own edge, e.g. a light rim on glass. Defaults to the border. */
    edge?: string;
    /** The card's edge on hover. Defaults to the edge. */
    edgeHover?: string;

    // Colour.
    accent: StatusColour & { glow?: string; link?: string; linkHover?: string };
    success: StatusColour;
    warning: StatusColour;
    danger: StatusColour;
    /** Text on every solid. */
    onSolid: string;
    /** Progress bar fills, when a bar should not take its tone's mark. */
    progress?: { info?: string; success?: string; warning?: string; danger?: string };

    // Voice.
    selection: SelectionStyle;
    /** Toasts as solid colour blocks or soft tints. */
    toasts?: 'solid' | 'soft';
    cardTitle?: TitleVoice;
    modalTitle?: TitleVoice;
    labels?: { weight?: number; transform?: 'none' | 'uppercase'; tracking?: string };
    headerWeight?: number;

    // Depth.
    /** Base colour of shadows. Defaults to the ink in a light theme and black in a dark one. */
    shadowColor?: string;
    shadows?: { card?: string; surface?: string; modal?: string };
    /** Backdrop filter for glass surfaces, e.g. `blur(22px) saturate(1.4)`. */
    blur?: string;
    scrim?: string;
}
