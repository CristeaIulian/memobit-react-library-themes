/** Present on the root while the authored themes are on. Every authored rule is scoped to it. */
export const THEME_ENGINE_ATTRIBUTE = 'data-theme-engine';
export const AUTHORED_ENGINE_VALUE = 'authored';

/**
 * Switches `root` to the hand-made themes (`@memobit/themes/authored.css`). The theme itself
 * stays whatever `data-theme` names; the authored version applies wherever one exists, and
 * the classic theme shows through where it does not.
 */
export const applyAuthoredEngine = (root: HTMLElement = document.documentElement): void => {
    root.setAttribute(THEME_ENGINE_ATTRIBUTE, AUTHORED_ENGINE_VALUE);
};

/** Hands `root` back to the classic themes. */
export const clearAuthoredEngine = (root: HTMLElement = document.documentElement): void => {
    root.removeAttribute(THEME_ENGINE_ATTRIBUTE);
};
