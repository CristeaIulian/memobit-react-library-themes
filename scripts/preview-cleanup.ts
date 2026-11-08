// Builds the cleanup review page: every classic theme no app recommends, drawn next to the
// authored theme that replaced it (its replica) or, without one, the closest authored theme
// of the same scheme, with a closeness score. The page saves a Drop tick per classic theme in
// the artifact's database (collection `marks`, one doc per theme id: { drop }), which is read
// back to build the cleanup release.
//
//   npm run preview:cleanup                    writes dist/cleanup.html
//   npm run preview:cleanup -- <output.html>

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import { escape } from './authored/mockScreen.ts';
import { distance, loadThemes, panel, reviewPage, sampleApp, scoreBadge, type ThemeEntry } from './authored/review.ts';

const root = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolvePath(process.argv[2] ?? join(root, 'dist/cleanup.html'));

// Classic themes an authored theme was attuned from (its description says so). The 3.0.0
// cleanup removed every one that had a replica; add pairs here when attuning another.
const REPLICAS: Record<string, string> = {};

// Where a classic theme is still named in code; dropping it means moving that code first.
const IN_USE: Record<string, string> = {
    'terminal-phosphor': 'Fieldcut, Defrag and ScanDisk simulators',
};

// Apps that are retired, so recommending a theme to them keeps nothing alive.
const RETIRED_APPS = new Set(['Ledger']);

const themes = await loadThemes(root);
const authored = themes.filter(entry => entry.engineClass === 'au');

interface Row {
    old: ThemeEntry;
    match: ThemeEntry;
    replica: boolean;
    score: number;
}

const rows: Row[] = themes
    .filter(entry => entry.engineClass === 'cl' && entry.apps.every(app => RETIRED_APPS.has(app)))
    .map(old => {
        const replica = authored.find(entry => entry.id === REPLICAS[old.id]);
        const nearest = authored
            .filter(entry => entry.scheme === old.scheme)
            .reduce((best, entry) => (distance(old.print, entry.print) < distance(old.print, best.print) ? entry : best));
        const match = replica ?? nearest;

        return { old, match, replica: replica !== undefined, score: distance(old.print, match.print) };
    })
    .sort((a, b) => a.score - b.score);

const rowHtml = ({ old, match, replica, score }: Row): string => {
    const inUse = IN_USE[old.id];
    const retired = old.apps.filter(app => RETIRED_APPS.has(app));
    const notes = [
        inUse === undefined ? '' : `<span class="note note--use">Still used by ${escape(inUse)}</span>`,
        retired.length === 0 ? '' : `<span class="note">Only recommended for ${escape(retired.join(', '))}, which is retired</span>`,
    ].join('');
    const app = sampleApp(match);

    return `
<article class="row" data-in-use="${inUse === undefined ? 'no' : 'yes'}">
  <header class="row-head"><div class="row-title"><h3>${escape(old.label)}</h3>${scoreBadge(score)}</div></header>
  ${notes === '' ? '' : `<div class="notes">${notes}</div>`}
  <div class="pair">
    ${panel(old, 'Old', app, true)}
    ${panel(match, replica ? 'Its replica' : 'Nearest new', app, false)}
  </div>
</article>`;
};

const replicaRows = rows.filter(row => row.replica);
const otherRows = rows.filter(row => !row.replica);

const sections = [
    replicaRows.length === 0
        ? ''
        : `<section class="group"><h2>Replicas (${replicaRows.length})</h2><p>Old themes that a new app theme was attuned from, closest first.</p>${replicaRows.map(rowHtml).join('')}</section>`,
    `<section class="group"><h2>No replica (${otherRows.length})</h2><p>Old themes with no copy, each beside its nearest new theme, closest first.</p>${otherRows.map(rowHtml).join('')}</section>`,
].join('\n');

const page = reviewPage({
    title: 'Theme Cleanup Review',
    heading: 'Theme cleanup',
    intro: `The ${rows.length} classic themes no live app recommends. Each sits next to the new theme that replaced it, or, without a replica, the closest new theme of the same scheme, both drawn on the same small app screen. Tick Drop on the old ones you are happy to lose; the ticks are saved here and read back to build the cleanup release.`,
    total: `of ${rows.length} marked to drop`,
    filters: [
        ['all', 'All'],
        ['marked', 'Marked'],
        ['unmarked', 'Not marked'],
        ['free', 'Not used in code'],
    ],
    sections,
    entries: rows.flatMap(row => [row.old, row.match]),
    collection: 'marks',
});

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, page);
console.log(`${rows.length} classic themes (${replicaRows.length} with a replica) -> ${output}`);
for (const row of rows) {
    console.log(`  ${row.old.id.padEnd(20)} ${row.replica ? 'replica' : 'nearest'} ${row.match.id.padEnd(28)} ${row.score.toFixed(1)}`);
}
