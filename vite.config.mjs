import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import pkg from './package.json';

export default defineConfig(({ mode }) => {
  // Load .env file and merge with default env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      viteStaticCopy({
        targets: [
          {
            src: 'public/*', // source
            dest: 'cached-files', // goes to dist/cached-files/
          },
          {
            src: 'dist/*.js',
            dest: 'cached-files', // goes to dist/cached-files/
          },
          {
            src: 'dist/*.map',
            dest: 'cached-files', // goes to dist/cached-files/
          },
          {
            src: 'dist/index.html',
            dest: 'noncached-files', // goes to dist/noncached-files/
          },
        ],
      }),
    ],
    define: {
      'import.meta.env.VITE_REACT_APP_NAME': JSON.stringify(pkg.description),
      'import.meta.env.VITE_REACT_APP_VERSION': JSON.stringify(pkg.version),
      // Also make VITE_ vars from .env available
      ...Object.fromEntries(
        Object.entries(env).map(([key, val]) => [`import.meta.env.${key}`, JSON.stringify(val)]),
      ),
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: true,
      target: 'es2015',
      rollupOptions: {
        output: {
          entryFileNames: 'index.[hash].js',
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.mjs',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  };
});
