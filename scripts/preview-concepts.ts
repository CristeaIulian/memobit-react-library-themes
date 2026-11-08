// Builds a preview page of the app themes: the authored themes made for an app
// (src/authored/*.ts with `apps`) and the drafts still waiting for a decision
// (src/authored/concepts). Each runs through the same derive + bridge + recipes as a real
// theme, scoped to its own panel, and is drawn as a small screen of its app using the
// component tokens @memobit/libs reads. Also lists each theme's contrast report.
//
//   npm run preview:concepts                    writes dist/concepts.html
//   npm run preview:concepts -- <output.html>

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { AuthoredTheme } from '../src/authored/contract.ts';

import { contrastWarnings, themeSheet } from './authored/checks.ts';
import { appSamples } from './authored/samples/index.ts';
import type { AppSample } from './authored/samples/types.ts';

const root = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const authoredDir = join(root, 'src/authored');
const conceptsDir = join(authoredDir, 'concepts');
const output = resolvePath(process.argv[2] ?? join(root, 'dist/concepts.html'));
const recipes = readFileSync(join(root, 'src/authored/recipes.css'), 'utf8');

interface Concept {
    app: string;
    idea: string;
    theme: AuthoredTheme;
    /** Still a draft, not yet one of the app's themes. */
    draft: boolean;
}

const isAuthoredTheme = (value: unknown): value is AuthoredTheme =>
    typeof value === 'object' && value !== null && 'id' in value && 'canvas' in value && 'accent' in value && 'selection' in value;

const concepts: Concept[] = [];

const load = async (dir: string, draft: boolean): Promise<void> => {
    if (!existsSync(dir)) {
        return;
    }

    for (const file of readdirSync(dir)
        .filter(name => name.endsWith('.ts') && name !== 'contract.ts')
        .sort()) {
        const exports: Record<string, unknown> = await import(pathToFileURL(join(dir, file)).href);

        for (const theme of Object.values(exports).filter(isAuthoredTheme)) {
            const app = theme.apps?.[0];

            if (app !== undefined) {
                concepts.push({ app, idea: theme.description ?? '', theme, draft });
            }
        }
    }
};

await load(authoredDir, false);
await load(conceptsDir, true);

const escape = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fontName = (stack: string | undefined): string =>
    (stack ?? '')
        .split(',')[0]
        .trim()
        .replace(/^['"]|['"]$/g, '');

const swatches = (theme: AuthoredTheme): string =>
    [
        ['Canvas', theme.canvas.color],
        ['Card', theme.surface],
        ['Ink', theme.ink],
        ['Accent', theme.accent.solid],
        ['Mark', theme.accent.mark ?? theme.accent.solid],
        ['Success', theme.success.mark ?? theme.success.solid],
        ['Warning', theme.warning.mark ?? theme.warning.solid],
        ['Danger', theme.danger.mark ?? theme.danger.solid],
    ]
        .map(([name, colour]) => `<span class="swatch" title="${escape(colour)}"><i style="background:${escape(colour)}"></i>${name}</span>`)
        .join('');

const screen = (sample: AppSample): string => `
<div class="m-app">
  <div class="m-header"><span class="m-brand">${escape(sample.app)}</span><span class="m-search">${escape(sample.search)}</span></div>
  <div class="m-body">
    <div class="m-card">
      <div class="m-card-head"><div class="m-title">${escape(sample.title)}</div><div class="m-sub">${escape(sample.subtitle)}</div></div>
      <div class="m-card-body">
        <p class="m-text">${sample.text}</p>
        <div class="m-row">${sample.chips.map((chip, index) => `<button type="button" class="chip chip--default${index === sample.selectedChip ? ' chip--selected' : ''}">${escape(chip)}</button>`).join('')}</div>
        <div class="m-row">${(['default', 'info', 'success', 'warning', 'danger'] as const).map((variant, index) => `<span class="badge badge-variant--${variant}">${escape(sample.badges[index])}</span>`).join('')}</div>
        <div class="m-fields">
          <label class="m-field"><span class="m-label">${escape(sample.field.label)}</span><span class="m-input m-input--focus">${escape(sample.field.value)}</span></label>
          <label class="m-field"><span class="m-label">${escape(sample.empty.label)}</span><span class="m-input m-input--empty">${escape(sample.empty.placeholder)}</span></label>
        </div>
        <div class="m-row">
          <span class="m-btn m-btn--info">${escape(sample.buttons[0])}</span><span class="m-btn m-btn--default">${escape(sample.buttons[1])}</span><span class="m-btn m-btn--success">${escape(sample.buttons[2])}</span><span class="m-btn m-btn--danger">${escape(sample.buttons[3])}</span>
        </div>
        ${sample.progress.map(bar => `<div class="m-progress"><span class="m-progress-label">${escape(bar.label)}</span><span class="m-track"><span class="m-fill m-fill--${bar.tone}" style="width:${bar.value}%"></span></span></div>`).join('')}
      </div>
    </div>
    <div class="m-table">
      <div class="m-tr m-th">${sample.table.columns.map(column => `<span>${escape(column)}</span>`).join('')}</div>
      ${sample.table.rows.map((row, index) => `<div class="m-tr${index === 1 ? ' m-tr--hover' : ''}${index === 2 ? ' m-tr--alt' : ''}">${row.map((cell, cellIndex) => `<span${cellIndex === 0 ? ' class="m-strong"' : ''}>${escape(cell)}</span>`).join('')}</div>`).join('')}
    </div>
    <div class="m-toast">${escape(sample.toast)}</div>
  </div>
</div>`;

// In the order the samples list them, which is the batch's order. While drafts exist, only
// their apps are shown, so the page is about the batch waiting for a decision.
const hasDrafts = concepts.some(concept => concept.draft);
const unsampled = [...new Set(concepts.map(concept => concept.app))].filter(appName => !(appName in appSamples));

if (unsampled.length > 0) {
    throw new Error(`No sample content for ${unsampled.join(', ')} in scripts/authored/samples/`);
}

const apps = Object.keys(appSamples).filter(appName => concepts.some(concept => concept.app === appName && (!hasDrafts || concept.draft)));
const sheets: string[] = [];
const fontLinks = new Set<string>();
const sections: string[] = [];

for (const appName of apps) {
    const sample = appSamples[appName];

    const panels = concepts
        .filter(concept => concept.app === appName)
        .sort((a, b) => (a.theme.scheme === b.theme.scheme ? 0 : a.theme.scheme === 'light' ? -1 : 1))
        .map(({ idea, theme, draft }) => {
            const scope = `.concept--${theme.id}`;
            const { css, missing } = themeSheet(theme, scope, recipes);

            if (missing.length > 0) {
                throw new Error(`${theme.id}: roles read but not produced: ${missing.join(', ')}`);
            }

            sheets.push(css);

            if (theme.fonts.url !== undefined) {
                fontLinks.add(theme.fonts.url);
            }

            const warnings = contrastWarnings(theme);
            const report =
                warnings.length === 0
                    ? '<p class="check check--pass">Passes every contrast check</p>'
                    : `<ul class="check check--warn">${warnings.map(warning => `<li>${escape(warning)}</li>`).join('')}</ul>`;
            const fonts = [fontName(theme.fonts.body), theme.fonts.display === undefined ? null : fontName(theme.fonts.display)].filter(name => name !== null);

            return `
<article class="concept">
  <header class="concept-info">
    <div class="concept-name"><h3>${escape(theme.label)}</h3><span class="tag">${theme.scheme}</span>${draft ? '<span class="tag tag--draft">Concept</span>' : '<span class="tag tag--chosen">Chosen</span>'}<code>${theme.id}</code></div>
    <p class="idea">${escape(idea)}</p>
    <p class="fonts">${fonts.map(name => escape(name)).join(' + ')} · selection: ${theme.selection}</p>
    <div class="swatches">${swatches(theme)}</div>
    ${report}
  </header>
  <div class="concept-screen concept--${theme.id}">${screen(sample)}</div>
</article>`;
        });

    sections.push(`
<section class="app">
  <div class="app-head"><h2>${escape(appName)}</h2><p>${escape(sample.about)}</p></div>
  <div class="pair">${panels.join('')}</div>
</section>`);
}

const page = `<title>App Theme Concepts</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
${[...fontLinks].map(url => `<link rel="stylesheet" href="${escape(url)}">`).join('\n')}
<style>
/* Layout: one band per app, its two concepts side by side (stacked on phones); each concept's info above its themed screen. */
:root {
  --page: #f3f3f1; --panel: #ffffff; --fg: #1d1e21; --muted: #5d6068; --line: rgba(29, 30, 33, 0.12);
  --pass: #1d6b3f; --warn: #8a4b05;
  --chrome: 'Hanken Grotesk', system-ui, sans-serif; --code: 'JetBrains Mono', ui-monospace, monospace;
  /* The lib's own scales, which theme values refer to. */
  --font-size-xxs: 0.625rem; --font-size-xs: 0.75rem; --font-size-sm: 0.875rem; --font-size-md: 1rem; --font-size-lg: 1.25rem; --font-size-xl: 1.5rem; --font-size-xxl: 2rem;
  --font-weight-light: 300; --font-weight-normal: 400; --font-weight-medium: 500; --font-weight-semibold: 600; --font-weight-bold: 700;
  --radius-sm: 4px; --radius: 8px; --radius-full: 9999px;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --page: #141517; --panel: #1c1d20; --fg: #ececee; --muted: #a2a5ad; --line: rgba(236, 236, 238, 0.12); --pass: #6fd39a; --warn: #f2c071; color-scheme: dark } }
:root[data-theme="dark"] { --page: #141517; --panel: #1c1d20; --fg: #ececee; --muted: #a2a5ad; --line: rgba(236, 236, 238, 0.12); --pass: #6fd39a; --warn: #f2c071; color-scheme: dark }
body { background: var(--page); color: var(--fg); font: 15px/1.5 var(--chrome); }
.page { display: flex; flex-direction: column; gap: 40px; max-width: 1280px; margin: 0 auto; padding-block: 32px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.intro { display: flex; flex-direction: column; gap: 8px; max-width: 70ch; }
.intro h1 { margin: 0; font-size: 2rem; letter-spacing: -0.02em; text-wrap: balance; }
.intro p { margin: 0; color: var(--muted); }
.app { display: flex; flex-direction: column; gap: 16px; }
.app-head { display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--line); padding-top: 16px; }
.app-head h2 { margin: 0; font-size: 1.4rem; letter-spacing: -0.01em; }
.app-head p { margin: 0; color: var(--muted); max-width: 75ch; }
.pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr)); gap: 20px; }
.concept { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.concept-info { display: flex; flex-direction: column; gap: 8px; }
.concept-name { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.concept-name h3 { margin: 0; font-size: 1.15rem; }
.concept-name code { font: 12px var(--code); color: var(--muted); }
.tag--chosen { color: var(--pass); border-color: currentColor; }
.tag--draft { color: var(--warn); border-color: currentColor; }
.tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; padding: 1px 8px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
.idea { margin: 0; max-width: 65ch; }
.fonts { margin: 0; font-size: 13px; color: var(--muted); }
.swatches { display: flex; flex-wrap: wrap; gap: 6px 12px; }
.swatch { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
.swatch i { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--line); }
.check { margin: 0; font-size: 13px; }
.check--pass { color: var(--pass); }
.check--warn { color: var(--warn); padding-left: 18px; }
.concept-screen { border-radius: 12px; overflow: hidden; border: 1px solid var(--line); }

/* The mock screen: every colour and type value comes from the concept's component tokens. */
.m-app { background: var(--body-background); color: var(--body-color); font-family: var(--font-family); font-size: 14px; line-height: 1.5; }
.m-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 16px; background: var(--header-background-color); border-bottom: 1px solid var(--header-border-bottom-color); color: var(--header-color); font-weight: var(--header-font-weight); }
.m-brand { font-family: var(--font-family-display); font-size: 1.15rem; color: var(--body-title-color); }
.m-search { padding: 4px 10px; border-radius: var(--radius); background: var(--form-control-background-color); border: 1px solid var(--form-control-border-color); color: var(--form-control-placeholder-color); font-size: 13px; font-weight: 400; }
.m-body { display: flex; flex-direction: column; gap: 14px; padding: 16px; }
.m-card { border-radius: var(--radius); background: var(--card-background-color); border: 1px solid var(--card-border-color); box-shadow: var(--card-box-shadow); backdrop-filter: var(--card-backdrop-filter); overflow: hidden; }
.m-card-head { padding: 12px 16px; background: var(--card-background-accent-color); border-bottom: 1px solid var(--delimiter-color); }
.m-title { font-family: var(--card-title-font-family); font-size: var(--card-title-font-size); font-weight: var(--card-title-font-weight); font-style: var(--card-title-font-style); letter-spacing: var(--card-title-letter-spacing); text-transform: var(--card-title-text-transform); color: var(--card-title-color); line-height: 1.2; }
.m-sub { color: var(--body-color-muted); font-size: 13px; margin-top: 2px; }
.m-card-body { display: flex; flex-direction: column; gap: 12px; padding: 14px 16px 16px; color: var(--card-color); }
.m-text { margin: 0; }
.m-text a { color: var(--links-color); text-decoration: underline; text-underline-offset: 2px; }
.m-text .m-accent { color: var(--body-accent-color); font-weight: 600; }
.m-text mark { background: var(--tone-accent-soft); color: inherit; padding: 0 2px; border-radius: 3px; }
.m-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.chip { font: inherit; font-size: 12px; padding: 4px 12px; border-radius: var(--radius-full); border: 1px solid var(--delimiter-color); background: transparent; color: var(--body-color); cursor: pointer; }
.chip:focus-visible { outline: 2px solid var(--form-control-focus-border-color); outline-offset: 2px; }
.badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: var(--radius-full); border: 1px solid transparent; }
.m-fields { display: flex; flex-wrap: wrap; gap: 12px; }
.m-field { display: flex; flex-direction: column; gap: 4px; flex: 1 1 180px; min-width: 0; }
.m-label { color: var(--form-control-label-color); font-size: var(--form-control-label-font-size); font-weight: var(--form-control-label-font-weight); letter-spacing: var(--form-control-label-letter-spacing); text-transform: var(--form-control-label-text-transform); }
.m-input { padding: 7px 10px; border-radius: var(--radius); font-family: var(--form-control-font-family); background: var(--form-control-background-color); border: 1px solid var(--form-control-border-color); color: var(--form-control-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m-input--focus { background: var(--form-control-focus-background-color); border-color: var(--form-control-focus-border-color); box-shadow: 0 0 0 3px var(--form-control-focus-ring); }
.m-input--empty { color: var(--form-control-placeholder-color); }
.m-btn { font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: var(--radius); border: 1px solid transparent; }
.m-btn--info { background: var(--button-info-background-color); color: var(--button-info-color); border-color: var(--button-info-border-color); }
.m-btn--default { background: var(--button-default-background-color); color: var(--button-default-color); border-color: var(--button-default-border-color); }
.m-btn--success { background: var(--button-success-background-color); color: var(--button-success-color); border-color: var(--button-success-border-color); }
.m-btn--danger { background: var(--button-danger-background-color); color: var(--button-danger-color); border-color: var(--button-danger-border-color); }
.m-progress { display: flex; flex-direction: column; gap: 4px; }
.m-progress-label { font-size: 12px; color: var(--body-color-muted); }
.m-track { display: block; height: 8px; border-radius: var(--radius-full); background: var(--progress-bar-background-color); overflow: hidden; }
.m-fill { display: block; height: 100%; border-radius: inherit; }
.m-fill--info { background: var(--progress-info-bar-fill-color); }
.m-fill--success { background: var(--progress-success-bar-fill-color); }
.m-fill--warning { background: var(--progress-warning-bar-fill-color); }
.m-table { border-radius: var(--radius); border: 1px solid var(--card-border-color); background: var(--card-background-color); overflow: hidden; font-size: 13px; }
.m-tr { display: grid; grid-template-columns: 2fr 1.2fr 1fr; gap: 8px; padding: 8px 14px; border-top: 1px solid var(--delimiter-color); }
.m-th { border-top: 0; background: var(--card-background-accent-color); color: var(--body-color-muted); font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.m-tr--alt { background: var(--list-alternate-background-color); }
.m-tr--hover { background: var(--list-hover-background-color); }
.m-strong { color: var(--body-title-color); font-weight: 600; }
.m-toast { align-self: flex-start; padding: 8px 14px; border-radius: var(--radius); font-size: 13px; font-weight: 500; background: var(--toast-success-background-color); color: var(--toast-success-color); border: 1px solid var(--toast-success-border-color); }
@media (prefers-reduced-motion: no-preference) { .chip { transition: background 150ms ease, border-color 150ms ease; } }

${sheets.join('\n')}
</style>
<main class="page">
  <div class="intro">
    <h1>App themes</h1>
    <p>A light and a dark theme for each app, drawn as a small screen of that app. Every colour, font and border below comes from the theme's own tokens, through the same derivation and bridge that @memobit/libs components read. Themes marked Chosen are in; one marked Concept is still waiting for your call.</p>
  </div>
  ${sections.join('\n')}
</main>
`;

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, page);
console.log(`${concepts.length} concepts for ${apps.length} apps -> ${output}`);

for (const { theme } of concepts) {
    const warnings = contrastWarnings(theme);
    console.log(`  ${theme.id}: ${warnings.length === 0 ? 'passes' : warnings.join('; ')}`);
}
