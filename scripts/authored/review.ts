// What the theme review pages share: every theme loaded with its CSS scoped to a panel, a
// colour fingerprint to say how close two themes look, the page chrome, and the script that
// saves a Drop tick per theme in the published page's database.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { AuthoredTheme } from '../../src/authored/contract.ts';
import { getThemeAppearance, THEME_CONFIGS } from '../../src/themeConfig.ts';

import { themeSheet } from './checks.ts';
import { type Oklch, parseColor } from './color.ts';
import { escape, MOCK_SCREEN_CSS, screen } from './mockScreen.ts';
import { appSamples } from './samples/index.ts';

export interface ThemeEntry {
    id: string;
    label: string;
    /** The classic theme an authored one was made from, when it was. */
    origin?: string;
    scheme: 'light' | 'dark';
    /** The apps it is recommended for. */
    apps: string[];
    /** Stylesheet scoped to `scopeClass`. */
    css: string;
    scopeClass: string;
    /** `au` for authored themes, `cl` for classic ones, whose badges and chips need the lib's rules. */
    engineClass: 'au' | 'cl';
    fonts: string[];
    print: Fingerprint;
}

// Authored themes made from a classic theme, most of which 3.0.0 removed: the copy stayed as
// its app's theme. Named so a review page can tell a copy from a theme made from scratch.
const ORIGINS: Record<string, string> = {
    'atelier-media-studio': 'Atelier Media',
    'basket-emerald': 'Cyber Forest',
    'cookbook-terracotta': 'Terracotta Kitchen',
    'garage-redline': 'Carbon Velocity',
    'global-pulse-orbital': 'Orbital Night',
    'health-iq-signal': 'Vital Signal',
    'hub-deep-water': 'Ocean Depths',
    'iot-harbor': 'Circuit Harbor',
    'lifespan-aurora': 'Vital Aurora',
    'lumen-lantern': 'Lumen',
    'nutritrack-verdant': 'Verdant Pulse',
    'pulse-ivory': 'Ivory Serif',
    'quiz-lab-chalkboard': 'Chalk Circuit',
    'realestate-blueprint': 'Blueprint Clay',
    'reels-marquee': 'Noir Marquee, reworked',
    'sandy-parchment': 'Sandy Parchment, rebuilt',
    'seeds-blossom': 'Blossom Meadow',
    'tasks-deep-work': 'Slate Focus',
};

const isAuthoredTheme = (value: unknown): value is AuthoredTheme =>
    typeof value === 'object' && value !== null && 'id' in value && 'canvas' in value && 'accent' in value && 'selection' in value;

/** Every authored theme with an app (src/authored) and every classic one (compiled, so run the build first). */
export const loadThemes = async (root: string): Promise<ThemeEntry[]> => {
    const authoredDir = join(root, 'src/authored');
    const recipes = readFileSync(join(authoredDir, 'recipes.css'), 'utf8');
    const entries: ThemeEntry[] = [];

    for (const file of readdirSync(authoredDir)
        .filter(name => name.endsWith('.ts') && name !== 'contract.ts')
        .sort()) {
        const exports: Record<string, unknown> = await import(pathToFileURL(join(authoredDir, file)).href);

        for (const theme of Object.values(exports).filter(isAuthoredTheme)) {
            if (theme.apps === undefined || theme.apps.length === 0) {
                continue;
            }

            const scopeClass = `au--${theme.id}`;
            const css = themeSheet(theme, `.${scopeClass}`, recipes).css;

            entries.push({
                id: theme.id,
                label: theme.label,
                origin: ORIGINS[theme.id],
                scheme: theme.scheme,
                apps: [...theme.apps],
                css,
                scopeClass,
                engineClass: 'au',
                fonts: theme.fonts.url === undefined ? [] : [theme.fonts.url],
                print: fingerprint(css),
            });
        }
    }

    const authoredIds = new Set(entries.map(entry => entry.id));

    for (const config of THEME_CONFIGS) {
        // A classic theme with an authored counterpart is shown once, as the authored one.
        if (authoredIds.has(config.value)) {
            continue;
        }

        const file = join(root, 'dist/themes', `${config.value}.css`);

        if (!existsSync(file)) {
            throw new Error(`No compiled CSS for ${config.value}; run npm run build first`);
        }

        const scopeClass = `cl--${config.value}`;
        const css = readFileSync(file, 'utf8')
            .replace(new RegExp(`(:root)?\\[data-theme=['"]?${config.value}['"]?\\]`, 'g'), `.${scopeClass}`)
            .replace(/@import[^;]+;/g, '');

        entries.push({
            id: config.value,
            label: config.label,
            scheme: getThemeAppearance(config.value),
            apps: [...(config.recommendedApps ?? [])],
            css,
            scopeClass,
            engineClass: 'cl',
            fonts: [config.fontUrl, config.fontUrlDisplay, config.fontUrlMono].filter((url): url is string => url !== undefined),
            print: fingerprint(css),
        });
    }

    return entries;
};

// Resolves a custom property through its var() chain, then reads the colour it ends on.
const colourReader = (css: string) => {
    const declarations = new Map([...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/g)].map(match => [match[1], match[2].trim()]));

    const resolve = (value: string, depth = 0): string => {
        const reference = value.match(/^var\((--[a-z0-9-]+)(?:\s*,\s*(.+))?\)$/);

        if (reference === null || depth > 8) {
            return value;
        }

        const next = declarations.get(reference[1]) ?? reference[2];

        return next === undefined ? value : resolve(next.trim(), depth + 1);
    };

    return (name: string): Oklch | null => {
        const value = declarations.get(name);

        return value === undefined ? null : (parseColor(resolve(value))?.color ?? null);
    };
};

// The roles that make a theme read as itself: its neutrals (page, card, text) and its accent
// (the primary button and links), each weighted by how much of the screen it covers.
const PROBES = ['--body-background-base', '--card-background-color', '--body-color', '--button-info-background-color', '--links-color'];
const NEUTRALS: [number, number][] = [
    [0, 2],
    [1, 2],
    [2, 1],
];
const ACCENTS: [number, number][] = [
    [3, 2],
    [4, 1],
];

export type Fingerprint = (Oklch | null)[];

export const fingerprint = (css: string): Fingerprint => PROBES.map(colourReader(css));

const oklab = ({ l, c, h }: Oklch): [number, number, number] => [l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];

/** Weighted mean OKLab distance over the probes in `group` both themes define, times 100. */
const groupDistance = (a: Fingerprint, b: Fingerprint, group: [number, number][]): number => {
    let sum = 0;
    let weights = 0;

    for (const [index, weight] of group) {
        const left = a[index];
        const right = b[index];

        if (left !== null && right !== null) {
            const [l1, a1, b1] = oklab(left);
            const [l2, a2, b2] = oklab(right);
            sum += weight * Math.hypot(l1 - l2, a1 - a2, b1 - b2);
            weights += weight;
        }
    }

    return weights === 0 ? Number.POSITIVE_INFINITY : (sum / weights) * 100;
};

/**
 * How far apart two themes look: the worse of their neutrals and their accents, so two themes
 * count as close only when both are. About 2 is the smallest visible step.
 */
export const distance = (a: Fingerprint, b: Fingerprint): number => Math.max(groupDistance(a, b, NEUTRALS), groupDistance(a, b, ACCENTS));

export const closeness = (score: number): string => (score < 2 ? 'Nearly identical' : score < 5 ? 'Close' : score < 10 ? 'Similar' : 'Different');

export const CLOSENESS_LEGEND =
    '<div class="legend"><span>Closeness takes the worse of the neutrals (page, card, text) and the accent (button, links):</span><span>under 2 nearly identical (about the smallest visible step)</span><span>under 5 close</span><span>under 10 similar</span><span>above that different</span></div>';

export const scoreBadge = (score: number): string => {
    const verdict = closeness(score);

    return `<span class="score score--${verdict.replace(/\s+/g, '-').toLowerCase()}">${verdict} · ${score.toFixed(1)}</span>`;
};

/** A theme drawn on `app`'s sample screen, under `heading` (none when empty), with its Drop tick when `drop` is set. */
export const panel = (entry: ThemeEntry, heading: string, app: string, drop: boolean): string => {
    const sample = appSamples[app];

    if (sample === undefined) {
        throw new Error(`No sample content for ${app}`);
    }

    const apps = entry.apps.length === 0 ? 'no app' : entry.apps.join(', ');

    return `
    <figure class="side" data-side="${entry.id}">
      <figcaption>
        <span class="side-name">${heading === '' ? '' : `<span class="side-role">${escape(heading)}</span> `}<strong>${escape(entry.label)}</strong> ${ageTag(entry)} <code>${entry.id}</code> <span class="tag">${entry.scheme}</span> <span class="side-apps">${escape(apps)}</span></span>
        ${drop ? `<label class="drop"><input type="checkbox" data-drop="${entry.id}"> Drop</label>` : ''}
      </figcaption>
      <div class="screen ${entry.engineClass} ${entry.scopeClass}">${screen(sample)}</div>
    </figure>`;
};

const ageTag = (entry: ThemeEntry): string => {
    if (entry.engineClass === 'cl') {
        return '<span class="age age--old">Old</span>';
    }

    return entry.origin === undefined ? '<span class="age age--new">New</span>' : `<span class="age age--copy">New · made from ${escape(entry.origin)}</span>`;
};

/** The first app of these with sample content, so both sides of a row can share one screen. */
export const sampleApp = (...entries: ThemeEntry[]): string => {
    const app = entries.flatMap(entry => entry.apps).find(name => name in appSamples);

    return app ?? Object.keys(appSamples)[0];
};

export const REVIEW_CSS = `
:root {
  --page: #f3f3f1; --panel: #ffffff; --fg: #1d1e21; --muted: #5d6068; --line: rgba(29, 30, 33, 0.12);
  --pick: #b3261e; --pick-soft: rgba(179, 38, 30, 0.08); --use: #8a4b05; --good: #1d6b3f;
  --chrome: 'Hanken Grotesk', system-ui, sans-serif; --code: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xxs: 0.625rem; --font-size-xs: 0.75rem; --font-size-sm: 0.875rem; --font-size-md: 1rem; --font-size-lg: 1.25rem; --font-size-xl: 1.5rem; --font-size-xxl: 2rem;
  --font-weight-light: 300; --font-weight-normal: 400; --font-weight-medium: 500; --font-weight-semibold: 600; --font-weight-bold: 700;
  --radius-sm: 4px; --radius: 8px; --radius-full: 9999px;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --page: #141517; --panel: #1c1d20; --fg: #ececee; --muted: #a2a5ad; --line: rgba(236, 236, 238, 0.12); --pick: #ff8a80; --pick-soft: rgba(255, 138, 128, 0.1); --use: #f2c071; --good: #6fd39a; color-scheme: dark } }
:root[data-theme="dark"] { --page: #141517; --panel: #1c1d20; --fg: #ececee; --muted: #a2a5ad; --line: rgba(236, 236, 238, 0.12); --pick: #ff8a80; --pick-soft: rgba(255, 138, 128, 0.1); --use: #f2c071; --good: #6fd39a; color-scheme: dark }
body { background: var(--page); color: var(--fg); font: 15px/1.5 var(--chrome); margin: 0; }
.page { display: flex; flex-direction: column; gap: 32px; max-width: 1280px; margin: 0 auto; padding-block: 0 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.bar { position: sticky; top: 0; z-index: 5; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 12px 0; background: var(--page); border-bottom: 1px solid var(--line); }
.bar strong { font-size: 1.05rem; }
.status { font-size: 13px; color: var(--muted); }
.filters { display: flex; gap: 4px; margin-left: auto; flex-wrap: wrap; }
.filters button { font: inherit; font-size: 13px; padding: 4px 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--panel); color: var(--fg); cursor: pointer; }
.filters button[aria-pressed="true"] { background: var(--fg); color: var(--page); border-color: var(--fg); }
.intro { display: flex; flex-direction: column; gap: 8px; max-width: 75ch; padding-top: 24px; }
.intro h1 { margin: 0; font-size: 2rem; letter-spacing: -0.02em; }
.intro p { margin: 0; color: var(--muted); }
.legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 13px; color: var(--muted); }
.group { display: flex; flex-direction: column; gap: 28px; }
.group > h2 { margin: 0; font-size: 1.4rem; border-top: 1px solid var(--line); padding-top: 16px; }
.group > p { margin: -20px 0 0; color: var(--muted); max-width: 75ch; }
.row { display: flex; flex-direction: column; gap: 10px; padding: 14px; border-radius: 14px; border: 1px solid var(--line); background: var(--panel); }
.row-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.row-title { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 10px; min-width: 0; }
.row-title h3 { margin: 0; font-size: 1.15rem; }
.vs { font-weight: 400; color: var(--muted); }
.row-title code, figcaption code { font: 12px var(--code); color: var(--muted); }
.age { font-size: 11px; font-weight: 600; padding: 1px 8px; border-radius: 999px; border: 1px solid currentColor; }
.age--old { color: var(--use); }
.age--new { color: var(--good); }
.age--copy { color: var(--muted); }
.tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; padding: 1px 8px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
.score { font-size: 12px; font-weight: 600; padding: 1px 8px; border-radius: 999px; border: 1px solid currentColor; }
.score--nearly-identical, .score--close { color: var(--good); }
.score--similar { color: var(--use); }
.score--different { color: var(--muted); }
.drop { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 4px 12px; border-radius: 999px; border: 1px solid var(--line); cursor: pointer; user-select: none; }
.drop input { width: 18px; height: 18px; accent-color: var(--pick); margin: 0; }
.notes { display: flex; flex-wrap: wrap; gap: 6px 12px; }
.note { font-size: 13px; color: var(--muted); }
.note--use { color: var(--use); font-weight: 500; }
.pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr)); gap: 14px; }
.side { margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; padding: 6px; border-radius: 14px; border: 1px solid transparent; }
.side.is-dropped { border-color: var(--pick); background: var(--pick-soft); }
.side.is-dropped .drop { color: var(--pick); border-color: var(--pick); }
figcaption { font-size: 13px; display: flex; flex-wrap: wrap; gap: 6px 8px; align-items: center; justify-content: space-between; }
.side-name { display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; min-width: 0; }
.side-role { text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; color: var(--muted); }
.side-apps { color: var(--muted); }
.screen { border-radius: 12px; overflow: hidden; border: 1px solid var(--line); }
.row[hidden] { display: none; }
.members { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 12px; }
.members .m-app { font-size: 13px; }
/* Each member spans two rows of the group's grid, so captions side by side share one height and the screens line up. */
.members .side { display: grid; grid-row: span 2; grid-template-rows: subgrid; }
.members figcaption { align-items: flex-start; }

${MOCK_SCREEN_CSS}

/* Classic themes style badges and selected chips through the lib's own Badge and Chip rules. */
.cl .badge-variant--default { background-color: var(--button-default-hover-background-color); color: var(--button-default-color); }
.cl .badge-variant--info { background-color: color-mix(in srgb, var(--button-info-background-color) 20%, transparent); color: var(--button-info-background-color); }
.cl .badge-variant--success { background-color: color-mix(in srgb, var(--button-success-background-color) 20%, transparent); color: var(--button-success-background-color); }
.cl .badge-variant--warning { background-color: color-mix(in srgb, var(--button-warning-background-color) 20%, transparent); color: var(--button-warning-background-color); }
.cl .badge-variant--danger { background-color: color-mix(in srgb, var(--button-danger-background-color) 20%, transparent); color: var(--button-danger-background-color); }
.cl .chip--selected { border-color: var(--chip-selected-border-color, var(--body-accent-color)); background: var(--chip-selected-background-color, var(--card-background-accent-color)); color: var(--chip-selected-color, var(--body-accent-color)); }
`;

/**
 * The page's tick handling: every [data-drop] box saves { drop } to `collection` in the
 * artifact's database, boxes for the same theme stay in step, and the filter buttons show
 * rows with or without a ticked theme.
 */
export const reviewScript = (collection: string): string => `
<script>
(() => {
  const marks = new Map();
  const boxes = [...document.querySelectorAll('[data-drop]')];
  const countEl = document.getElementById('count');
  const statusEl = document.getElementById('status');
  let filter = 'all';
  let store = null;

  const render = () => {
    for (const box of boxes) {
      const dropped = marks.get(box.dataset.drop) === true;
      box.checked = dropped;
      box.closest('.side')?.classList.toggle('is-dropped', dropped);
    }
    for (const row of document.querySelectorAll('.row')) {
      const marked = [...row.querySelectorAll('[data-drop]')].some(box => box.checked);
      row.hidden = (filter === 'marked' && !marked) || (filter === 'unmarked' && marked) || (filter === 'free' && row.dataset.inUse === 'yes');
    }
    countEl.textContent = String([...marks.values()].filter(Boolean).length);
  };

  document.getElementById('filters').addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    for (const other of document.querySelectorAll('#filters button')) other.setAttribute('aria-pressed', String(other === button));
    render();
  });

  for (const box of boxes) {
    box.addEventListener('change', () => {
      const id = box.dataset.drop;
      marks.set(id, box.checked);
      render();
      if (!store) return;
      statusEl.textContent = 'Saving…';
      store.doc(id).set({ drop: box.checked, at: Date.now() })
        .then(() => { statusEl.textContent = 'Saved'; })
        .catch(() => { statusEl.textContent = 'Could not save that tick'; });
    });
  }

  render();

  const use = window.claude && window.claude.use;
  if (!use) {
    statusEl.textContent = 'Ticks are not saved outside claude.ai';
    return;
  }

  use('db').then(db => {
    if (!db) {
      statusEl.textContent = 'Ticks cannot be saved in this view';
      return;
    }
    store = db.collection('${collection}');
    const timer = setTimeout(() => { statusEl.textContent = 'Saved ticks are slow to load'; }, 10000);
    store.onSnapshot(snap => {
      clearTimeout(timer);
      marks.clear();
      for (const doc of snap.docs) {
        const data = doc.data();
        marks.set(doc.id, Boolean(data && data.drop));
      }
      statusEl.textContent = 'Ticks are saved';
      render();
    }, () => {
      clearTimeout(timer);
      statusEl.textContent = 'Could not load the saved ticks';
    });
  });
})();
</script>`;

/** The page around the rows: fonts, styles, the sticky bar with count and filters, and the intro. */
export const reviewPage = (options: {
    title: string;
    heading: string;
    intro: string;
    total: string;
    filters: [string, string][];
    sections: string;
    entries: ThemeEntry[];
    collection: string;
}): string => {
    const fonts = new Set(options.entries.flatMap(entry => entry.fonts));
    const sheets = new Set(options.entries.map(entry => entry.css));

    return `<meta charset="utf-8">
<title>${escape(options.title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
${[...fonts].map(url => `<link rel="stylesheet" href="${escape(url)}">`).join('\n')}
<style>
${REVIEW_CSS}
${[...sheets].join('\n')}
</style>
<div class="page">
  <div class="bar">
    <strong><span id="count">0</span> ${escape(options.total)}</strong>
    <span class="status" id="status">Connecting…</span>
    <div class="filters" id="filters">
      ${options.filters.map(([value, label], index) => `<button type="button" data-filter="${value}" aria-pressed="${index === 0}">${escape(label)}</button>`).join('\n      ')}
    </div>
  </div>
  <div class="intro">
    <h1>${escape(options.heading)}</h1>
    <p>${options.intro}</p>
    ${CLOSENESS_LEGEND}
  </div>
  ${options.sections}
</div>
${reviewScript(options.collection)}
`;
};
