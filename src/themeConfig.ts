export interface ThemeConfig {
    value: string;
    label: string;
    fontUrl: string;
    fontUrlDisplay?: string;
    fontUrlMono?: string;
    recommendedApps?: readonly string[];
}

// `as const` keeps each id as a literal, which ClassicThemeName is built from.
const CLASSIC_THEMES = [
    {
        value: 'sandy-parchment',
        label: 'Sandy Parchment',
        recommendedApps: ['Shelf'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&display=swap',
    },
    {
        value: 'midnight-atlas',
        label: 'Midnight Atlas',
        recommendedApps: ['Voyage'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&display=swap',
    },
    {
        value: 'vault-guard',
        label: 'Vault Guard',
        recommendedApps: ['Tessera'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    },
    {
        value: 'asphalt-code',
        label: 'Asphalt Code',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    },
    {
        value: 'terminal-phosphor',
        label: 'Terminal Phosphor',
        fontUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap',
        fontUrlMono: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap',
    },
    {
        value: 'signal-clarity',
        label: 'Signal Clarity',
        recommendedApps: ['Network Audit'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
    },
    {
        value: 'chrono-atlas',
        label: 'Chrono Atlas',
        recommendedApps: ['Atlas of Time'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
    },
    {
        value: 'war-room',
        label: 'War Room',
        recommendedApps: ['Skirmish'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
    },
] as const satisfies readonly ThemeConfig[];

export type ClassicThemeName = (typeof CLASSIC_THEMES)[number]['value'];

export const THEME_CONFIGS: ThemeConfig[] = [...CLASSIC_THEMES];

export const FAVORITE_THEMES = new Set<string>();

export const LIGHT_THEMES = new Set(['chrono-atlas', 'sandy-parchment']);

export type ThemeAppearance = 'light' | 'dark';

export const getThemeAppearance = (themeValue: string): ThemeAppearance => {
    return LIGHT_THEMES.has(themeValue) ? 'light' : 'dark';
};

export const getThemeConfig = (themeValue: string): ThemeConfig | undefined => {
    return THEME_CONFIGS.find(config => config.value === themeValue);
};
