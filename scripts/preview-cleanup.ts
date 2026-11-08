// Builds the cleanup review page: every classic theme no app recommends, drawn next to the
// authored theme that replaced it (its replica) or, without one, the closest authored theme
// of the same scheme, with a closeness score. The page saves a Drop tick per classic theme in
// the artifact's database (collection `marks`, one doc per theme id: { drop }), which is read
// back to build the cleanup release.
//
//   npm run preview:cleanup                    writes dist/cleanup.html
//   npm run preview:cleanup -- <output.html>

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { AuthoredTheme } from '../src/authored/contract.ts';
import { getThemeAppearance, THEME_CONFIGS } from '../src/themeConfig.ts';

import { themeSheet } from './authored/checks.ts';
import { type Oklch, parseColor } from './authored/color.ts';
import { escape, MOCK_SCREEN_CSS, screen } from './authored/mockScreen.ts';
import { appSamples } from './authored/samples/index.ts';

const root = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const authoredDir = join(root, 'src/authored');
const classicDir = join(root, 'dist/themes');
const output = resolvePath(process.argv[2] ?? join(root, 'dist/cleanup.html'));
const recipes = readFileSync(join(authoredDir, 'recipes.css'), 'utf8');

// Classic themes an authored theme was attuned from (its description says so). The 3.0.0
// cleanup removed every one that had a replica; add pairs here when attuning another.
const REPLICAS: Record<string, string> = {};

// Where a classic theme is still named in code; dropping it means moving that code first.
const IN_USE: Record<string, string> = {
    'terminal-phosphor': 'Fieldcut, Defrag and ScanDisk simulators',
};

// Apps that are retired, so recommending a theme to them keeps nothing alive.
const RETIRED_APPS = new Set(['Ledger']);

interface Authored {
    theme: AuthoredTheme;
    app: string;
    css: string;
}

const isAuthoredTheme = (value: unknown): value is AuthoredTheme =>
    typeof value === 'object' && value !== null && 'id' in value && 'canvas' in value && 'accent' in value && 'selection' in value;

const authored: Authored[] = [];

for (const file of readdirSync(authoredDir)
    .filter(name => name.endsWith('.ts') && name !== 'contract.ts')
    .sort()) {
    const exports: Record<string, unknown> = await import(pathToFileURL(join(authoredDir, file)).href);

    for (const theme of Object.values(exports).filter(isAuthoredTheme)) {
        const app = theme.apps?.[0];

        if (app !== undefined) {
            authored.push({ theme, app, css: themeSheet(theme, `.au--${theme.id}`, recipes).css });
        }
    }
}

const authoredById = new Map(authored.map(entry => [entry.theme.id, entry]));

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

// The roles that make a theme read as itself, weighted by how much of the screen they cover.
const PROBES: [string, number][] = [
    ['--body-background-base', 2],
    ['--card-background-color', 2],
    ['--button-info-background-color', 2],
    ['--body-color', 1],
    ['--links-color', 1],
    ['--body-title-color', 0.5],
];

type Fingerprint = (Oklch | null)[];

const fingerprint = (css: string): Fingerprint => {
    const read = colourReader(css);

    return PROBES.map(([name]) => read(name));
};

const oklab = ({ l, c, h }: Oklch): [number, number, number] => [l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];

/** Weighted mean OKLab distance over the probes both themes define, times 100. */
const distance = (a: Fingerprint, b: Fingerprint): number => {
    let sum = 0;
    let weights = 0;

    PROBES.forEach(([, weight], index) => {
        const left = a[index];
        const right = b[index];

        if (left !== null && right !== null) {
            const [l1, a1, b1] = oklab(left);
            const [l2, a2, b2] = oklab(right);
            sum += weight * Math.hypot(l1 - l2, a1 - a2, b1 - b2);
            weights += weight;
        }
    });

    return weights === 0 ? Number.POSITIVE_INFINITY : (sum / weights) * 100;
};

const closeness = (score: number): string => (score < 2 ? 'Nearly identical' : score < 5 ? 'Close' : score < 10 ? 'Similar' : 'Different');

const authoredPrints = new Map(authored.map(entry => [entry.theme.id, fingerprint(entry.css)]));

interface Row {
    id: string;
    label: string;
    scheme: 'light' | 'dark';
    css: string;
    fonts: string[];
    match: Authored;
    replica: boolean;
    score: number;
    inUse?: string;
    retiredFor?: string;
}

const rows: Row[] = [];

for (const config of THEME_CONFIGS) {
    const liveApps = (config.recommendedApps ?? []).filter(app => !RETIRED_APPS.has(app));

    if (liveApps.length > 0) {
        continue;
    }

    const file = join(classicDir, `${config.value}.css`);

    if (!existsSync(file)) {
        throw new Error(`No compiled CSS for ${config.value}; run npm run build first`);
    }

    const scope = `.cl--${config.value}`;
    const css = readFileSync(file, 'utf8')
        .replace(new RegExp(`(:root)?\\[data-theme=['"]?${config.value}['"]?\\]`, 'g'), scope)
        .replace(/@import[^;]+;/g, '');
    const scheme = getThemeAppearance(config.value);
    const print = fingerprint(css);
    const replicaId = REPLICAS[config.value];
    const replica = replicaId === undefined ? undefined : authoredById.get(replicaId);

    if (replicaId !== undefined && replica === undefined) {
        throw new Error(`${config.value}: replica ${replicaId} not found in src/authored`);
    }

    const candidates = authored.filter(entry => entry.theme.scheme === scheme);
    const nearest = candidates.reduce((best, entry) =>
        distance(print, authoredPrints.get(entry.theme.id) ?? []) < distance(print, authoredPrints.get(best.theme.id) ?? []) ? entry : best
    );
    const match = replica ?? nearest;
    const retired = (config.recommendedApps ?? []).filter(app => RETIRED_APPS.has(app));

    rows.push({
        id: config.value,
        label: config.label,
        scheme,
        css,
        fonts: [config.fontUrl, config.fontUrlDisplay, config.fontUrlMono].filter((url): url is string => url !== undefined),
        match,
        replica: replica !== undefined,
        score: distance(print, authoredPrints.get(match.theme.id) ?? []),
        inUse: IN_USE[config.value],
        retiredFor: retired.length > 0 ? retired.join(', ') : undefined,
    });
}

const replicaRows = rows.filter(row => row.replica).sort((a, b) => a.score - b.score);
const otherRows = rows.filter(row => !row.replica).sort((a, b) => a.score - b.score);

const fontLinks = new Set<string>();
const sheets = new Set<string>();

const panel = (heading: string, name: string, code: string, scopeClass: string, engineClass: string, app: string): string => {
    const sample = appSamples[app];

    if (sample === undefined) {
        throw new Error(`No sample content for ${app}`);
    }

    return `
    <figure class="side">
      <figcaption><span class="side-role">${heading}</span> <strong>${escape(name)}</strong> <code>${escape(code)}</code></figcaption>
      <div class="screen ${engineClass} ${scopeClass}">${screen(sample)}</div>
    </figure>`;
};

const rowHtml = (row: Row): string => {
    sheets.add(row.css);
    sheets.add(row.match.css);
    row.fonts.forEach(url => fontLinks.add(url));

    if (row.match.theme.fonts.url !== undefined) {
        fontLinks.add(row.match.theme.fonts.url);
    }

    const verdict = closeness(row.score);
    const notes = [
        row.inUse === undefined ? '' : `<span class="note note--use">Still used by ${escape(row.inUse)}</span>`,
        row.retiredFor === undefined ? '' : `<span class="note">Only recommended for ${escape(row.retiredFor)}, which is retired</span>`,
    ].join('');

    return `
<article class="row" data-id="${row.id}" data-in-use="${row.inUse === undefined ? 'no' : 'yes'}">
  <header class="row-head">
    <div class="row-title">
      <h3>${escape(row.label)}</h3><code>${row.id}</code><span class="tag">${row.scheme}</span>
      <span class="score score--${verdict.replace(/\s+/g, '-').toLowerCase()}">${verdict} · ${row.score.toFixed(1)}</span>
    </div>
    <label class="drop"><input type="checkbox" data-drop="${row.id}"> Drop</label>
  </header>
  ${notes === '' ? '' : `<div class="notes">${notes}</div>`}
  <div class="pair">
    ${panel('Old', row.label, row.id, `cl--${row.id}`, 'cl', row.match.app)}
    ${panel(row.replica ? 'Its replica' : 'Nearest new', `${row.match.theme.label} (${row.match.app})`, row.match.theme.id, `au--${row.match.theme.id}`, 'au', row.match.app)}
  </div>
</article>`;
};

const replicaSection = replicaRows.map(rowHtml).join('');
const otherSection = otherRows.map(rowHtml).join('');

const page = `<meta charset="utf-8">
<title>Theme Cleanup Review</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
${[...fontLinks].map(url => `<link rel="stylesheet" href="${escape(url)}">`).join('\n')}
<style>
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
.row.is-dropped { border-color: var(--pick); background: var(--pick-soft); }
.row-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.row-title { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 10px; min-width: 0; }
.row-title h3 { margin: 0; font-size: 1.15rem; }
.row-title code, figcaption code { font: 12px var(--code); color: var(--muted); }
.tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; padding: 1px 8px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
.score { font-size: 12px; font-weight: 600; padding: 1px 8px; border-radius: 999px; border: 1px solid currentColor; }
.score--nearly-identical, .score--close { color: var(--good); }
.score--similar { color: var(--use); }
.score--different { color: var(--muted); }
.drop { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 6px 14px; border-radius: 999px; border: 1px solid var(--line); cursor: pointer; user-select: none; }
.drop input { width: 18px; height: 18px; accent-color: var(--pick); margin: 0; }
.row.is-dropped .drop { color: var(--pick); border-color: var(--pick); }
.notes { display: flex; flex-wrap: wrap; gap: 6px 12px; }
.note { font-size: 13px; color: var(--muted); }
.note--use { color: var(--use); font-weight: 500; }
.pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr)); gap: 14px; }
.side { margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
figcaption { font-size: 13px; display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; }
.side-role { text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; color: var(--muted); }
.screen { border-radius: 12px; overflow: hidden; border: 1px solid var(--line); }
.row[hidden] { display: none; }

${MOCK_SCREEN_CSS}

/* Classic themes style badges and selected chips through the lib's own Badge and Chip rules. */
.cl .badge-variant--default { background-color: var(--button-default-hover-background-color); color: var(--button-default-color); }
.cl .badge-variant--info { background-color: color-mix(in srgb, var(--button-info-background-color) 20%, transparent); color: var(--button-info-background-color); }
.cl .badge-variant--success { background-color: color-mix(in srgb, var(--button-success-background-color) 20%, transparent); color: var(--button-success-background-color); }
.cl .badge-variant--warning { background-color: color-mix(in srgb, var(--button-warning-background-color) 20%, transparent); color: var(--button-warning-background-color); }
.cl .badge-variant--danger { background-color: color-mix(in srgb, var(--button-danger-background-color) 20%, transparent); color: var(--button-danger-background-color); }
.cl .chip--selected { border-color: var(--chip-selected-border-color, var(--body-accent-color)); background: var(--chip-selected-background-color, var(--card-background-accent-color)); color: var(--chip-selected-color, var(--body-accent-color)); }

${[...sheets].join('\n')}
</style>
<div class="page">
  <div class="bar">
    <strong><span id="count">0</span> of ${rows.length} marked to drop</strong>
    <span class="status" id="status">Connecting…</span>
    <div class="filters" id="filters">
      <button type="button" data-filter="all" aria-pressed="true">All</button>
      <button type="button" data-filter="marked" aria-pressed="false">Marked</button>
      <button type="button" data-filter="unmarked" aria-pressed="false">Not marked</button>
      <button type="button" data-filter="free" aria-pressed="false">Not used in code</button>
    </div>
  </div>
  <div class="intro">
    <h1>Theme cleanup</h1>
    <p>The ${rows.length} classic themes no live app recommends. Each sits next to the new theme that replaced it, or, without a replica, the closest new theme of the same scheme, both drawn on the same small app screen. Tick Drop on the old ones you are happy to lose; the ticks are saved here and read back to build the cleanup release.</p>
    <div class="legend"><span>Closeness compares page, card, button, text and link colours:</span><span>under 2 nearly identical (about the smallest visible step)</span><span>under 5 close</span><span>under 10 similar</span><span>above that different</span></div>
  </div>
  <section class="group">
    <h2>Replicas (${replicaRows.length})</h2>
    <p>Old themes that a new app theme was attuned from, closest first.</p>
    ${replicaSection}
  </section>
  <section class="group">
    <h2>No replica (${otherRows.length})</h2>
    <p>Old themes with no copy, each beside its nearest new theme, closest first.</p>
    ${otherSection}
  </section>
</div>
<script>
(() => {
  const marks = new Map();
  const boxes = [...document.querySelectorAll('[data-drop]')];
  const countEl = document.getElementById('count');
  const statusEl = document.getElementById('status');
  let filter = 'all';
  let collection = null;

  const render = () => {
    let count = 0;
    for (const box of boxes) {
      const id = box.dataset.drop;
      const dropped = marks.get(id) === true;
      box.checked = dropped;
      const row = box.closest('.row');
      row.classList.toggle('is-dropped', dropped);
      row.hidden = (filter === 'marked' && !dropped) || (filter === 'unmarked' && dropped) || (filter === 'free' && row.dataset.inUse === 'yes');
      if (dropped) count += 1;
    }
    countEl.textContent = String(count);
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
      if (!collection) return;
      statusEl.textContent = 'Saving…';
      collection.doc(id).set({ drop: box.checked, at: Date.now() })
        .then(() => { statusEl.textContent = 'Saved'; })
        .catch(() => { statusEl.textContent = 'Could not save that tick'; });
    });
  }

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
    collection = db.collection('marks');
    const timer = setTimeout(() => { statusEl.textContent = 'Saved ticks are slow to load'; }, 10000);
    collection.onSnapshot(snap => {
      clearTimeout(timer);
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

  render();
})();
</script>
`;

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, page);
console.log(`${rows.length} classic themes (${replicaRows.length} with a replica) -> ${output}`);
for (const row of [...replicaRows, ...otherRows]) {
    const flag = row.replica && row.match.theme.scheme !== row.scheme ? '  (scheme differs)' : '';
    console.log(`  ${row.id.padEnd(20)} ${row.replica ? 'replica' : 'nearest'} ${row.match.theme.id.padEnd(28)} ${row.score.toFixed(1)}${flag}`);
}
