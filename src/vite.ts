import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { THEME_ASSET_DIR } from './index';

// Vite's types are structural, so describing only what we use keeps vite out of this
// package's dependencies.
interface ThemePlugin {
    name: string;
    config(): { define: Record<string, string> };
    configureServer(server: {
        middlewares: {
            use(handler: (req: { url?: string }, res: ServerResponse, next: () => void) => void): void;
        };
    }): void;
    generateBundle(): void;
    emitFile?: unknown;
}

interface ServerResponse {
    setHeader(name: string, value: string): void;
    end(body?: string): void;
}

export interface MemobitThemesOptions {
    /** Project root, used to locate the installed package. Defaults to the current directory. */
    root?: string;
}

const readThemeFiles = (root: string): Map<string, string> => {
    const require = createRequire(join(root, 'noop.js'));

    let themesDir;

    try {
        themesDir = join(dirname(require.resolve('@memobit/themes/package.json')), 'dist', 'themes');
    } catch {
        return new Map();
    }

    const themes = new Map<string, string>();

    for (const file of readdirSync(themesDir)) {
        if (file.endsWith('.css')) {
            themes.set(file.slice(0, -4), readFileSync(join(themesDir, file), 'utf8'));
        }
    }

    return themes;
};

/**
 * Publishes each theme as a standalone stylesheet the app fetches when that theme is
 * selected, instead of shipping all 64 in the bundle.
 *
 * Every app carried ~618 KB of theme CSS though exactly one is ever active, because the
 * themes were imported as a single aggregate. This emits them as separate assets at a
 * predictable path and hands the library a name-to-URL map through a compile-time global,
 * which ThemeContext uses to load one on demand.
 *
 * The global is the reason this fails open: an app without this plugin leaves it
 * undefined, the library falls back to assuming the aggregate stylesheet was imported the
 * old way, and nothing changes for that app.
 */
export const memobitThemes = (options: MemobitThemesOptions = {}): ThemePlugin => {
    const { root = process.cwd() } = options;
    const themes = readThemeFiles(root);

    const urls = Object.fromEntries([...themes.keys()].map(name => [name, `/${THEME_ASSET_DIR}/${name}.css`]));

    return {
        name: 'memobit-themes',

        config() {
            return { define: { __MEMOBIT_THEME_URLS__: JSON.stringify(urls) } };
        },

        // Dev has no emitted assets, so serve the same paths straight from the package.
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const path = (req.url ?? '').split('?')[0];

                if (!path.startsWith(`/${THEME_ASSET_DIR}/`) || !path.endsWith('.css')) {
                    next();

                    return;
                }

                const css = themes.get(path.slice(`/${THEME_ASSET_DIR}/`.length, -4));

                if (css === undefined) {
                    next();

                    return;
                }

                res.setHeader('Content-Type', 'text/css');
                res.end(css);
            });
        },

        // Fixed filenames, so the URLs baked into the global above stay correct.
        generateBundle(this: { emitFile(file: { type: 'asset'; fileName: string; source: string }): void }) {
            for (const [name, source] of themes) {
                this.emitFile({ type: 'asset', fileName: `${THEME_ASSET_DIR}/${name}.css`, source });
            }
        },
    };
};
