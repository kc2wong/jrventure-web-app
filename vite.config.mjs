import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import pkg from './package.json';

export default defineConfig(({ mode }) => {
  // Load .env file and merge with default env
  const env = loadEnv(mode, process.cwd(), '');

  return {
  base: './',
    plugins: [
      react(),
      tsconfigPaths(),
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
