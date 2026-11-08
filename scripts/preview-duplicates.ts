// Builds the near-duplicates review page: themes that look alike, in groups. Each group joins
// themes of one scheme that are all close to each other (score under 5, complete linkage);
// a theme close to only one member of a group joins the group of its nearest theme. Every
// theme appears once, on its own app's screen, with its Drop tick. The page saves the ticks in
// the artifact's database (collection `duplicates`, one doc per theme id: { drop }), which is
// read back to decide which themes to merge away.
//
//   npm run preview:duplicates                    writes dist/duplicates.html
//   npm run preview:duplicates -- <output.html>

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import { distance, loadThemes, panel, reviewPage, sampleApp, scoreBadge, type ThemeEntry } from './authored/review.ts';

const root = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolvePath(process.argv[2] ?? join(root, 'dist/duplicates.html'));
const THRESHOLD = 5;

const themes = await loadThemes(root);

const between = (a: ThemeEntry, b: ThemeEntry): number => distance(a.print, b.print);

/** The farthest any two themes of the two groups are apart. */
const linkage = (a: ThemeEntry[], b: ThemeEntry[]): number => Math.max(...a.flatMap(x => b.map(y => between(x, y))));

const groupScheme = (scheme: 'light' | 'dark'): ThemeEntry[][] => {
    const list = themes.filter(entry => entry.scheme === scheme);
    const groups = list.map(entry => [entry]);

    // Merge the closest two groups while every theme in the result stays close to every other.
    for (;;) {
        let best: { i: number; j: number; score: number } | null = null;

        for (let i = 0; i < groups.length; i += 1) {
            for (let j = i + 1; j < groups.length; j += 1) {
                const score = linkage(groups[i], groups[j]);

                if (score < THRESHOLD && (best === null || score < best.score)) {
                    best = { i, j, score };
                }
            }
        }

        if (best === null) {
            break;
        }

        groups[best.i].push(...groups[best.j]);
        groups.splice(best.j, 1);
    }

    // A theme left alone that is still close to one theme elsewhere joins that theme's group.
    for (const single of groups.filter(group => group.length === 1).map(([entry]) => entry)) {
        const nearest = list.filter(other => other !== single).sort((a, b) => between(single, a) - between(single, b))[0];

        if (nearest !== undefined && between(single, nearest) < THRESHOLD) {
            const home = groups.find(group => group.includes(nearest));
            const own = groups.findIndex(group => group.length === 1 && group[0] === single);

            if (home !== undefined && home.length > 1) {
                home.push(single);
                groups.splice(own, 1);
            }
        }
    }

    return groups.filter(group => group.length > 1).sort((a, b) => b.length - a.length || linkage(a, a) - linkage(b, b));
};

const groupHtml = (group: ThemeEntry[]): string => {
    const closest = Math.min(...group.flatMap(a => group.filter(b => b !== a).map(b => between(a, b))));
    const farthest = linkage(group, group);

    return `
<article class="row">
  <header class="row-head"><div class="row-title"><h3>${group.length} themes that look alike</h3>${scoreBadge(closest)}<span class="note">closest two; the farthest two score ${farthest.toFixed(1)}</span></div></header>
  <div class="members">
    ${group.map(entry => panel(entry, '', sampleApp(entry), true)).join('')}
  </div>
</article>`;
};

const light = groupScheme('light');
const dark = groupScheme('dark');
const grouped = [...light, ...dark].flat();

const sections = [
    `<section class="group"><h2>Light (${light.length} groups)</h2><p>Largest groups first.</p>${light.map(groupHtml).join('')}</section>`,
    `<section class="group"><h2>Dark (${dark.length} groups)</h2><p>Largest groups first.</p>${dark.map(groupHtml).join('')}</section>`,
].join('\n');

const page = reviewPage({
    title: 'Theme Near Duplicates',
    heading: 'Near-duplicate themes',
    intro: `${themes.length} themes, of which ${grouped.length} fall into ${light.length + dark.length} groups of themes that look alike (same scheme, scores under ${THRESHOLD}). Every theme appears once, on its own app's screen, with its own Drop tick. Each theme is tagged Old (one of the eight classic themes kept), New, or New · made from the classic theme it copies. Tick Drop on the themes you would merge away: their apps would then use another theme from the group. Ticks are saved here.`,
    total: `themes marked to drop`,
    filters: [
        ['all', 'All'],
        ['marked', 'With a tick'],
        ['unmarked', 'Without a tick'],
    ],
    sections,
    entries: grouped,
    collection: 'duplicates',
});

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, page);
console.log(`${themes.length} themes, ${grouped.length} in ${light.length} light and ${dark.length} dark groups -> ${output}`);
for (const group of [...light, ...dark]) {
    console.log(`  ${group.map(entry => entry.id).join(' | ')}`);
}
