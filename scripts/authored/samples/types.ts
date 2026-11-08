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
