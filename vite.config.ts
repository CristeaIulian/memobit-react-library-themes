import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [dts({ tsconfigPath: './tsconfig.json', bundleTypes: false, entryRoot: 'src', outDir: 'dist' })],
    build: {
        lib: {
            entry: {
                index: resolve(import.meta.dirname, 'src/index.ts'),
                vite: resolve(import.meta.dirname, 'src/vite.ts'),
            },
            formats: ['es'],
        },
        rollupOptions: {
            external: [/^node:/],
            output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
        },
        emptyOutDir: false,
        sourcemap: false,
        minify: false,
        target: 'es2022',
    },
});
