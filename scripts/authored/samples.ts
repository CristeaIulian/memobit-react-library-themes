// Sample content for the concept preview, one screen per app, written as the app would show it.

export interface AppSample {
    app: string;
    about: string;
    search: string;
    title: string;
    subtitle: string;
    /** HTML: may hold an <a>, a <span class="m-accent"> and a <mark>. */
    text: string;
    chips: string[];
    selectedChip: number;
    /** default, info, success, warning, danger. */
    badges: [string, string, string, string, string];
    field: { label: string; value: string };
    empty: { label: string; placeholder: string };
    /** primary, default, success, danger. */
    buttons: [string, string, string, string];
    progress: { label: string; value: number; tone: 'info' | 'success' | 'warning' }[];
    table: { columns: [string, string, string]; rows: [string, string, string][] };
    toast: string;
}

export const appSamples: Record<string, AppSample> = {
    Recall: {
        app: 'Recall',
        about: 'A private people-memory app: notes, key facts, follow-ups and recall training for the people in your life.',
        search: 'Search people…',
        title: 'Ana Popescu',
        subtitle: 'Met at the Cluj JS meetup · 12 Mar 2026',
        text: 'Climbs most weekends and is training for <span class="m-accent">Mont Blanc in July</span>. <mark>Ask how the knee recovery went</mark> before the next meetup, and see her <a href="#">key facts</a>.',
        chips: ['Family', 'Friends', 'Team', 'Business'],
        selectedChip: 1,
        badges: ['Friend', 'Follow-up', 'Remembered', 'Birthday soon', 'Overdue'],
        field: { label: 'Next follow-up', value: 'Ask about the Mont Blanc trip' },
        empty: { label: 'Key fact', placeholder: 'Add something to remember…' },
        buttons: ['Save person', 'Train recall', 'Mark done', 'Delete'],
        progress: [
            { label: 'Recall score this week · 72%', value: 72, tone: 'info' },
            { label: 'Names remembered · 9 of 12', value: 75, tone: 'success' },
        ],
        table: {
            columns: ['Person', 'Circle', 'Last contact'],
            rows: [
                ['Ana Popescu', 'Friends', '3 days ago'],
                ['Mihai Ionescu', 'Team', 'Today'],
                ['Elena Radu', 'Family', '2 weeks ago'],
            ],
        },
        toast: 'Follow-up saved for Ana Popescu',
    },
    Readout: {
        app: 'Readout',
        about: 'A reading companion: listen to PDF, DOCX and EPUB documents with the current sentence highlighted, export to MP3, and pull text out of scans with OCR.',
        search: 'Search the library…',
        title: 'Thinking, Fast and Slow',
        subtitle: 'Chapter 3 · The Lazy Controller · 42 min left',
        text: 'System 2 has a natural speed. <mark>You expend some mental energy in random thoughts and in monitoring what goes on around you.</mark> Reading voice: <span class="m-accent">Ioana, Romanian</span>, see <a href="#">voice settings</a>.',
        chips: ['PDF', 'DOCX', 'EPUB', 'Photo'],
        selectedChip: 2,
        badges: ['English', 'Reading', 'MP3 exported', 'Low OCR confidence', 'Failed'],
        field: { label: 'Voice', value: 'Ioana (Romanian) · 1.1× speed' },
        empty: { label: 'Find in text', placeholder: 'Search this document…' },
        buttons: ['Play', 'Export MP3', 'Run OCR', 'Remove'],
        progress: [
            { label: 'Chapter 3 · 42%', value: 42, tone: 'info' },
            { label: 'Exporting MP3 · 80%', value: 80, tone: 'success' },
        ],
        table: {
            columns: ['Document', 'Type', 'Progress'],
            rows: [
                ['Thinking, Fast and Slow', 'EPUB', '31%'],
                ['Contract scan, page 2', 'Photo', 'OCR done'],
                ['Annual report 2025', 'PDF', 'Not started'],
            ],
        },
        toast: 'Chapter 3 exported to MP3',
    },
    Pocket: {
        app: 'Pocket',
        about: 'A private wallet for loyalty and membership cards: photos, barcodes and codes, ready to show at the till.',
        search: 'Find a card…',
        title: 'Lidl Plus',
        subtitle: 'Member 4820 1153 9027 · EAN-13',
        text: 'Show the barcode at the till. Points reset on <span class="m-accent">1 Mar 2027</span>. <mark>2 coupons waiting</mark>, see <a href="#">card photos</a>.',
        chips: ['Groceries', 'Pharmacy', 'Fuel', 'Fashion'],
        selectedChip: 0,
        badges: ['Groceries', 'Barcode ready', 'Valid', 'Expires soon', 'Expired'],
        field: { label: 'Card number', value: '4820 1153 9027 66' },
        empty: { label: 'Notes', placeholder: 'PIN hint, family member…' },
        buttons: ['Show at till', 'Edit', 'Scan barcode', 'Delete'],
        progress: [
            { label: 'Stamps · 7 of 10', value: 70, tone: 'info' },
            { label: 'Points to next reward · 64%', value: 64, tone: 'success' },
        ],
        table: {
            columns: ['Card', 'Category', 'Last used'],
            rows: [
                ['Lidl Plus', 'Groceries', 'Today'],
                ['Dr. Max', 'Pharmacy', '12 Oct 2026'],
                ['OMV Smiles', 'Fuel', '29 Sep 2026'],
            ],
        },
        toast: 'Card added to your wallet',
    },
    Ascend: {
        app: 'Ascend',
        about: 'A personal-development tracker: books, articles and courses broken into chapters, with per-chapter notes, yearly journaling and progress logs.',
        search: 'Search sources and notes…',
        title: 'Atomic Habits',
        subtitle: 'James Clear · Chapter 7 of 20',
        text: 'Environment beats motivation. <mark>Make the cue obvious: lay out the running shoes the night before.</mark> Part of the <span class="m-accent">2026 reading goal</span>, with <a href="#">12 notes</a> so far.',
        chips: ['Books', 'Articles', 'Courses', 'Journal'],
        selectedChip: 0,
        badges: ['Book', 'In progress', 'Finished', 'Behind plan', 'Abandoned'],
        field: { label: 'Chapter note', value: 'Habit stacking: after coffee, read 10 pages' },
        empty: { label: 'Takeaway', placeholder: 'What did you take from this chapter?' },
        buttons: ['Log progress', 'Add note', 'Mark finished', 'Remove'],
        progress: [
            { label: 'Atomic Habits · 35%', value: 35, tone: 'info' },
            { label: '2026 goal · 18 of 30 books', value: 60, tone: 'success' },
        ],
        table: {
            columns: ['Source', 'Category', 'Progress'],
            rows: [
                ['Atomic Habits', 'Books', '7 / 20'],
                ['Deep Work', 'Books', 'Finished'],
                ['Stoicism 101', 'Courses', '3 / 12'],
            ],
        },
        toast: 'Progress logged: chapter 7',
    },
    Tasks: {
        app: 'Tasks',
        about: 'A to-do manager: capture tasks, schedule them, set priorities and get email reminders when they come due.',
        search: 'Search tasks…',
        title: 'Renew car insurance',
        subtitle: 'Due Mon, 10 Nov 2026 · Personal',
        text: 'Compare the two offers before calling. <mark>The current policy ends on 15 Nov 2026.</mark> Priority <span class="m-accent">high</span>, see the <a href="#">attached quotes</a>.',
        chips: ['Today', 'This week', 'Someday', 'Done'],
        selectedChip: 0,
        badges: ['Personal', 'In progress', 'Done', 'Due soon', 'Overdue'],
        field: { label: 'Reminder', value: 'Mon, 10 Nov 2026 · 09:00 · email' },
        empty: { label: 'New task', placeholder: 'Add a task…' },
        buttons: ['Add task', 'Snooze', 'Complete', 'Delete'],
        progress: [
            { label: 'This week · 6 of 11 done', value: 55, tone: 'info' },
            { label: 'Today · 4 of 5 done', value: 80, tone: 'success' },
        ],
        table: {
            columns: ['Task', 'Due', 'Status'],
            rows: [
                ['Renew car insurance', '10 Nov 2026', 'Due soon'],
                ['Book dentist', '14 Nov 2026', 'Open'],
                ['Pay electricity bill', '5 Nov 2026', 'Overdue'],
            ],
        },
        toast: 'Reminder set for Mon 09:00',
    },
    Cookbook: {
        app: 'Cookbook',
        about: 'A personal recipe library: ingredients, steps, photos, prep and cook times, and where each recipe came from.',
        search: 'Search recipes…',
        title: 'Sarmale cu varză',
        subtitle: 'From Bunica Elena · 4 h · serves 8',
        text: 'Soak the sauerkraut leaves overnight. <mark>Layer smoked ribs between the rolls</mark> and cook slowly on <span class="m-accent">low heat for 3 hours</span>. See <a href="#">the original note</a>.',
        chips: ['Mains', 'Soups', 'Desserts', 'Breakfast'],
        selectedChip: 0,
        badges: ['Romanian', 'Cooking now', 'Tried', 'Long prep', 'Missing ingredient'],
        field: { label: 'Servings', value: '8 portions · 24 rolls' },
        empty: { label: 'Tip', placeholder: 'Add a cooking tip…' },
        buttons: ['Start cooking', 'Edit', 'Add photo', 'Delete'],
        progress: [
            { label: 'Steps done · 4 of 9', value: 44, tone: 'info' },
            { label: 'Ingredients ready · 11 of 12', value: 92, tone: 'success' },
        ],
        table: {
            columns: ['Recipe', 'Course', 'Total time'],
            rows: [
                ['Sarmale cu varză', 'Mains', '4 h'],
                ['Ciorbă de perișoare', 'Soups', '1 h 30'],
                ['Papanași', 'Desserts', '45 min'],
            ],
        },
        toast: 'Recipe saved to Mains',
    },
    Seeds: {
        app: 'Seeds',
        about: "A per-child milestone tracker: first words, first steps and the rest of a child's development, with dates and notes.",
        search: 'Search milestones…',
        title: 'Maria',
        subtitle: '14 months · born 8 Sep 2025',
        text: 'Said <span class="m-accent">"mama"</span> clearly this week. <mark>Took three steps alone</mark> on Sunday, see the <a href="#">video note</a>.',
        chips: ['Motor', 'Language', 'Social', 'Health'],
        selectedChip: 1,
        badges: ['Language', 'Emerging', 'Reached', 'Check at visit', 'Overdue vaccine'],
        field: { label: 'Milestone', value: 'First steps without support' },
        empty: { label: 'Note', placeholder: 'What happened today?' },
        buttons: ['Add milestone', 'Edit', 'Mark reached', 'Delete'],
        progress: [
            { label: 'Milestones for 12–18 months · 6 of 10', value: 60, tone: 'info' },
            { label: 'Vaccines up to date · 9 of 10', value: 90, tone: 'success' },
        ],
        table: {
            columns: ['Milestone', 'Area', 'Reached'],
            rows: [
                ['First word', 'Language', '2 Nov 2026'],
                ['Walks alone', 'Motor', '8 Nov 2026'],
                ['Waves bye-bye', 'Social', '12 Oct 2026'],
            ],
        },
        toast: 'Milestone reached: first steps',
    },
    Hub: {
        app: 'Hub',
        about: 'The bridge between the memobit apps: read and write APIs over each app’s data, plus the error monitor every app reports to.',
        search: 'Search errors and bridges…',
        title: 'HealthIQ bridge',
        subtitle: 'Last sync 08 Nov 2026, 07:30:12 · 3 sources',
        text: 'Pulled <span class="m-accent">1,284 rows</span> from Pulse, Impulse and NutriTrack. <mark>2 new errors from Cookbook</mark> since yesterday, see the <a href="#">error log</a>.',
        chips: ['All apps', 'Errors', 'Warnings', 'Resolved'],
        selectedChip: 1,
        badges: ['cookbook', 'Syncing', 'Healthy', 'Slow response', 'Failing'],
        field: { label: 'Endpoint', value: '/healthIQMemobit/vitals?since=2026-11-01' },
        empty: { label: 'Filter', placeholder: 'Message, app or status…' },
        buttons: ['Run sync', 'Copy URL', 'Mark resolved', 'Delete'],
        progress: [
            { label: 'Sync · 64%', value: 64, tone: 'info' },
            { label: 'Errors resolved this week · 18 of 21', value: 86, tone: 'success' },
        ],
        table: {
            columns: ['App', 'Error', 'Seen'],
            rows: [
                ['cookbook', 'TypeError: image is null', '07:12'],
                ['garage', '500 on /documents', 'Yesterday'],
                ['pulse', 'Request timed out', '06 Nov 2026'],
            ],
        },
        toast: 'Sync finished: 1,284 rows',
    },
    NutriTrack: {
        app: 'NutriTrack',
        about: 'A nutrition and workout tracker: log food against a personal food database, track workouts and chart progress against your targets.',
        search: 'Search foods…',
        title: 'Today',
        subtitle: 'Sat, 08 Nov 2026 · 1,640 of 2,200 kcal',
        text: 'Lunch: chicken, rice and greens. <mark>Protein is 28 g short</mark> of today’s target. Next workout: <span class="m-accent">legs, 18:00</span>, see the <a href="#">plan</a>.',
        chips: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
        selectedChip: 1,
        badges: ['High protein', 'Logging', 'On target', 'Low fibre', 'Over sugar'],
        field: { label: 'Food', value: 'Chicken breast, grilled · 180 g' },
        empty: { label: 'Add food', placeholder: 'Search the food database…' },
        buttons: ['Log food', 'Add workout', 'Mark done', 'Remove'],
        progress: [
            { label: 'Calories · 1,640 of 2,200', value: 75, tone: 'info' },
            { label: 'Protein · 112 of 140 g', value: 80, tone: 'success' },
        ],
        table: {
            columns: ['Food', 'Amount', 'kcal'],
            rows: [
                ['Chicken breast, grilled', '180 g', '297'],
                ['Basmati rice', '150 g', '195'],
                ['Greek yogurt', '200 g', '146'],
            ],
        },
        toast: 'Lunch logged: 638 kcal',
    },
    Pulse: {
        app: 'Pulse',
        about: 'A personal medical record: lab results with reference ranges, vitals, conditions, clinic visits and scanned documents for the family.',
        search: 'Search analyses and documents…',
        title: 'Complete blood count',
        subtitle: 'Synevo Cluj · 04 Nov 2026',
        text: 'Most values are within range. <mark>Ferritin is low at 18 ng/mL</mark> (range 30–400). Recheck in <span class="m-accent">three months</span>, see the <a href="#">lab report</a>.',
        chips: ['Blood', 'Vitals', 'Conditions', 'Documents'],
        selectedChip: 0,
        badges: ['Blood test', 'Pending', 'In range', 'Borderline', 'Out of range'],
        field: { label: 'Blood pressure', value: '122 / 78 mmHg · 08:10' },
        empty: { label: 'Note', placeholder: 'Symptoms, medication, questions…' },
        buttons: ['Add result', 'Upload document', 'Mark reviewed', 'Delete'],
        progress: [
            { label: 'Annual check-up · 7 of 10 tests done', value: 70, tone: 'info' },
            { label: 'Values in range · 24 of 26', value: 92, tone: 'success' },
        ],
        table: {
            columns: ['Analysis', 'Result', 'Range'],
            rows: [
                ['Haemoglobin', '13.8 g/dL', '12–16'],
                ['Ferritin', '18 ng/mL', '30–400'],
                ['Vitamin D', '34 ng/mL', '30–100'],
            ],
        },
        toast: 'Result added to Blood',
    },
    Impulse: {
        app: 'Impulse',
        about: 'An impulse tracker: log urges as they happen with their context and triggers, then review the patterns behind them.',
        search: 'Search the journal…',
        title: 'Late-night snacking',
        subtitle: 'Logged 22:40 · intensity 7 of 10',
        text: 'Tired after a long call. <mark>Waited ten minutes and the urge passed.</mark> Third time this week after <span class="m-accent">22:00</span>, see the <a href="#">pattern</a>.',
        chips: ['Food', 'Phone', 'Shopping', 'Other'],
        selectedChip: 0,
        badges: ['Evening', 'Reviewing', 'Resisted', 'Recurring', 'Acted on'],
        field: { label: 'Trigger', value: 'Tired after work · alone at home' },
        empty: { label: 'What helped?', placeholder: 'A walk, a glass of water…' },
        buttons: ['Log impulse', 'Add context', 'Resisted', 'Delete'],
        progress: [
            { label: 'Resisted this week · 5 of 8', value: 62, tone: 'info' },
            { label: 'Days without acting on it · 4 of 7', value: 57, tone: 'success' },
        ],
        table: {
            columns: ['Impulse', 'Trigger', 'Outcome'],
            rows: [
                ['Late-night snacking', 'Tired', 'Resisted'],
                ['Doom-scrolling', 'Bored', 'Acted on'],
                ['Online shopping', 'Stressed', 'Resisted'],
            ],
        },
        toast: 'Logged and resisted. Nice.',
    },
    Garage: {
        app: 'Garage',
        about: 'A vehicle manager: cars, paperwork, mileage, defects, service history and reminders before documents expire.',
        search: 'Search cars and documents…',
        title: 'Škoda Octavia',
        subtitle: 'CJ 12 ABC · 148,320 km',
        text: 'Oil change due in <span class="m-accent">1,680 km</span>. <mark>Inspection (ITP) expires on 20 Nov 2026.</mark> See the <a href="#">service history</a>.',
        chips: ['Documents', 'Service', 'Defects', 'Mileage'],
        selectedChip: 1,
        badges: ['Diesel', 'In service', 'Valid', 'Expires soon', 'Expired'],
        field: { label: 'Mileage', value: '148,320 km · 08 Nov 2026' },
        empty: { label: 'Defect', placeholder: 'Describe the problem…' },
        buttons: ['Log service', 'Add document', 'Mark fixed', 'Delete'],
        progress: [
            { label: 'Until next service · 1,680 of 15,000 km left', value: 89, tone: 'warning' },
            { label: 'Documents valid · 4 of 5', value: 80, tone: 'success' },
        ],
        table: {
            columns: ['Document', 'Car', 'Expires'],
            rows: [
                ['RCA insurance', 'Octavia', '03 Mar 2027'],
                ['ITP inspection', 'Octavia', '20 Nov 2026'],
                ['Rovinieta', 'Octavia', '14 Jan 2027'],
            ],
        },
        toast: 'Service logged: oil and filters',
    },
};
