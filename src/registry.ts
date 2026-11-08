import { AUTHORED_LIGHT_THEMES, AUTHORED_PREVIEW_PALETTES, AUTHORED_THEME_CONFIGS, AUTHORED_THEMES } from './authoredThemes';
import { previewPalettes as classicPreviewPalettes, type PreviewToken } from './previewPalettes';
import {
    type ClassicThemeName,
    LIGHT_THEMES as CLASSIC_LIGHT_THEMES,
    THEME_CONFIGS as CLASSIC_THEME_CONFIGS,
    type ThemeAppearance,
    type ThemeConfig,
} from './themeConfig';

// Every theme an app can pick: the new authored themes, then the classic ones. New themes
// come first so that an app they are made for starts on one of them.

// An app starts on the first theme recommended for it, and apps start light. So a classic
// light theme that shares an app with new themes (Shelf's Sandy Parchment, Atlas of Time's
// Chrono Atlas) goes ahead of them; otherwise the app would start on its new dark theme.
const authoredApps = new Set(AUTHORED_THEME_CONFIGS.flatMap(config => config.recommendedApps ?? []));
const leadingClassic = CLASSIC_THEME_CONFIGS.filter(
    config => CLASSIC_LIGHT_THEMES.has(config.value) && (config.recommendedApps ?? []).some(app => authoredApps.has(app))
);

export const THEME_CONFIGS: ThemeConfig[] = [
    ...leadingClassic,
    ...AUTHORED_THEME_CONFIGS,
    ...CLASSIC_THEME_CONFIGS.filter(config => !leadingClassic.includes(config)),
];

/** Every theme's id, so an app can name one (a theme it starts on, or pins) and have it checked. */
export type ThemeName = ClassicThemeName | (typeof AUTHORED_THEMES)[number]['id'];

export const LIGHT_THEMES = new Set([...CLASSIC_LIGHT_THEMES, ...AUTHORED_LIGHT_THEMES]);

export const previewPalettes: Readonly<Record<string, Readonly<Record<PreviewToken, string>>>> = { ...classicPreviewPalettes, ...AUTHORED_PREVIEW_PALETTES };

export const getThemeAppearance = (themeValue: string): ThemeAppearance => (LIGHT_THEMES.has(themeValue) ? 'light' : 'dark');

export const getThemeConfig = (themeValue: string): ThemeConfig | undefined => THEME_CONFIGS.find(config => config.value === themeValue);
