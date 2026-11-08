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
import { escape, MOCK_SCREEN_CSS, screen } from './authored/mockScreen.ts';
import { appSamples } from './authored/samples/index.ts';

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

${MOCK_SCREEN_CSS}

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
