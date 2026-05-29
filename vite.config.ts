import path from 'path';

import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyUrl = env.VITE_PROXY_URL;
  const server = proxyUrl
    ? {
        proxy: {
          '/v1': {
            target: proxyUrl,
            changeOrigin: true,
          },
        },
      }
    : undefined;

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    server,
    resolve: {
      alias: {
        '@component': path.resolve(__dirname, 'src/components'),
        '@hook': path.resolve(__dirname, 'src/hooks'),
        '@i18n': path.resolve(__dirname, 'src/i18n'),
        '@model': path.resolve(__dirname, 'src/models'),
        '@openapi': path.resolve(__dirname, 'src/__generated__/openapi-client'),
        '@page': path.resolve(__dirname, 'src/pages'),
        '@store': path.resolve(__dirname, 'src/stores'),
        '@util': path.resolve(__dirname, 'src/utils'),
      },
    },
  };
});
