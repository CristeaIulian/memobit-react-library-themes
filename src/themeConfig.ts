export interface ThemeConfig {
    value: string;
    label: string;
    fontUrl: string;
    fontUrlDisplay?: string;
    fontUrlMono?: string;
    recommendedApps?: string[];
}

export const THEME_CONFIGS: ThemeConfig[] = [
    {
        value: 'arctic-blue',
        label: 'Arctic Blue',
        fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap',
    },
    {
        value: 'azure-night',
        label: 'Azure Night',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
    {
        value: 'blossom-meadow',
        label: 'Blossom Meadow',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap',
    },
    {
        value: 'crimson-dusk',
        label: 'Crimson Dusk',
        fontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
    },
    {
        value: 'cyber-forest',
        label: 'Cyber Forest',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
    {
        value: 'dashdarkx',
        label: 'DashDark X',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&display=swap',
    },
    {
        value: 'lumen',
        label: 'Lumen',
        fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap',
        fontUrlMono: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap',
    },
    {
        value: 'luna',
        label: 'Luna',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
    },
    {
        value: 'ocean-breeze',
        label: 'Ocean Breeze',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&display=swap',
    },
    {
        value: 'ocean-depths',
        label: 'Ocean Depths',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
    {
        value: 'sandstone',
        label: 'Sandstone',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    },
    {
        value: 'tailwind-vue-dark',
        label: 'Tailwind View Dark',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swa',
    },
    {
        value: 'sandy-parchment',
        label: 'Sandy Parchment',
        recommendedApps: ['Shelf'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&display=swap',
    },
    {
        value: 'midnight-amber',
        label: 'Midnight Amber',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap',
    },
    {
        value: 'cobalt-pulse',
        label: 'Cobalt Pulse',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap',
        fontUrlMono: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    },
    {
        value: 'carbon-velocity',
        label: 'Carbon Velocity',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap',
    },
    {
        value: 'signal-burst',
        label: 'Signal Burst',
        fontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap',
    },
    {
        value: 'ivory-serif',
        label: 'Ivory Serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
    },
    {
        value: 'noir-marquee',
        label: 'Noir Marquee',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&display=swap',
    },
    {
        value: 'garden-harvest',
        label: 'Garden Harvest',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap',
    },
    {
        value: 'citrus-vital',
        label: 'Citrus Vital',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700&display=swap',
    },
    {
        value: 'horizon-amber',
        label: 'Horizon Amber',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap',
    },
    {
        value: 'chalk-circuit',
        label: 'Chalk & Circuit',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap',
    },
    {
        value: 'terracotta-kitchen',
        label: 'Terracotta Kitchen',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
    },
    {
        value: 'slate-bazaar',
        label: 'Slate Bazaar',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    },
    {
        value: 'slate-focus',
        label: 'Slate Focus',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
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
        recommendedApps: ['Tessera', 'Backup'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    },
    {
        value: 'crawler-dusk',
        label: 'Crawler Dusk',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap',
    },
    {
        value: 'asphalt-code',
        label: 'Asphalt Code',
        recommendedApps: ['Cars Crawler'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    },
    {
        value: 'emerald-ledger',
        label: 'Emerald Ledger',
        recommendedApps: ['Ledger'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
    },
    {
        value: 'vital-signal',
        label: 'Vital Signal',
        fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap',
    },
    {
        value: 'mesh-circuit',
        label: 'Mesh Circuit',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap',
    },
    {
        value: 'vital-aurora',
        label: 'Vital Aurora',
        fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap',
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
        value: 'audit-ember',
        label: 'Audit Ember',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap',
        fontUrlMono: 'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap',
    },
    {
        value: 'blueprint-clay',
        label: 'Blueprint Clay',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap',
    },
    {
        value: 'graphite-shell',
        label: 'Graphite Shell',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap',
    },
    {
        value: 'screening-room',
        label: 'Screening Room',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;500;600;700;800&display=swap',
    },
    {
        value: 'verdant-pulse',
        label: 'Verdant Pulse',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap',
    },
    {
        value: 'atelier-media',
        label: 'Atelier Media',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        fontUrlDisplay:
            'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400;1,8..60,500&display=swap',
    },
    {
        value: 'chrono-atlas',
        label: 'Chrono Atlas',
        recommendedApps: ['Atlas of Time'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
    },
    {
        value: 'orbital-night',
        label: 'Orbital Night',
        fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap',
        fontUrlMono: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap',
    },
    {
        value: 'kindred-ink',
        label: 'Kindred Ink',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
    },
    {
        value: 'lamplight',
        label: 'Lamplight',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
    },
    {
        value: 'indigo-stitch',
        label: 'Indigo Stitch',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    },
    {
        value: 'war-room',
        label: 'War Room',
        recommendedApps: ['Skirmish'],
        fontUrl: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
    },
    {
        value: 'circuit-harbor',
        label: 'Circuit Harbor',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        fontUrlDisplay: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
    },
];

export const FAVORITE_THEMES = new Set(['arctic-blue', 'crimson-dusk', 'ocean-breeze', 'ocean-depths', 'sandstone', 'tailwind-vue-dark']);

export const LIGHT_THEMES = new Set([
    'atelier-media',
    'blueprint-clay',
    'chrono-atlas',
    'garden-harvest',
    'ivory-serif',
    'ocean-breeze',
    'sandstone',
    'sandy-parchment',
    'terracotta-kitchen',
    'vital-aurora',
]);

export type ThemeAppearance = 'light' | 'dark';

export const getThemeAppearance = (themeValue: string): ThemeAppearance => {
    return LIGHT_THEMES.has(themeValue) ? 'light' : 'dark';
};

export const getThemeConfig = (themeValue: string): ThemeConfig | undefined => {
    return THEME_CONFIGS.find(config => config.value === themeValue);
};
