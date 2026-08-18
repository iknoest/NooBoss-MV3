import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { build } from 'vite';

const __dirname_resolved = resolve('.');

// Plugin for post-build file fixup 
function extensionPostBuild() {
  return {
    name: 'extension-post-build',
    closeBundle: {
      sequential: true,
      order: 'post',
      async handler() {
        const dist = resolve(__dirname_resolved, 'dist');

        // Build service worker separately with inlineDynamicImports to avoid code-splitting
        await build({
          configFile: false,
          build: {
            outDir: dist,
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname_resolved, 'src/background/service-worker.ts'),
              formats: ['es'],
              fileName: () => 'service-worker.js',
            },
            rollupOptions: {
              output: {
                inlineDynamicImports: true,
              },
            },
            target: 'esnext',
            minify: false,
            sourcemap: false,
          },
        });

        // Copy manifest.json
        copyFileSync(
          resolve(__dirname_resolved, 'src/manifest.json'),
          resolve(dist, 'manifest.json')
        );

        // Copy icons
        const iconsDir = resolve(dist, 'icons');
        if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });
        const srcIcons = resolve(__dirname_resolved, 'src/icons');
        if (existsSync(srcIcons)) {
          for (const file of readdirSync(srcIcons)) {
            if (file.endsWith('.png')) {
              copyFileSync(resolve(srcIcons, file), resolve(iconsDir, file));
            }
          }
        }

        // Move HTML files from dist/src/ to dist/
        for (const sub of ['popup', 'manager']) {
          const fromPath = resolve(dist, `src/${sub}/${sub}.html`);
          const toPath = resolve(dist, `${sub}/${sub}.html`);
          if (existsSync(fromPath)) {
            const toDir = resolve(toPath, '..');
            if (!existsSync(toDir)) mkdirSync(toDir, { recursive: true });
            writeFileSync(toPath, readFileSync(fromPath, 'utf-8'));
          }
        }

        // Clean up dist/src/
        const distSrc = resolve(dist, 'src');
        if (existsSync(distSrc)) {
          rmSync(distSrc, { recursive: true, force: true });
        }
      },
    },
  };
}

export default defineConfig({
  plugins: [preact(), extensionPostBuild()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname_resolved, 'src/popup/popup.html'),
        manager: resolve(__dirname_resolved, 'src/manager/manager.html'),
      },
      output: {
        entryFileNames: '[name]/[name].js',
        chunkFileNames: 'shared/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    target: 'esnext',
    minify: false,
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname_resolved, 'src/shared'),
    },
  },
});
