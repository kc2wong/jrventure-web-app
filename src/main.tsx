import { webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { client } from '@openapi/client.gen';
import { initTrace, logger } from '@util/logger';
import { applyOtelInterceptors } from '@util/otel-axios';
import { HandyFluentUiProvider } from 'handy-fluentui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './i18n';
import './index.css';
import App from './app';

initTrace();

client.setConfig({
  // empty string will make request go to dev server
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});
applyOtelInterceptors(client.instance);

function AppShell() {
  return (
    <HandyFluentUiProvider
      component={{
        toast: {
          dismissTimeout: 2000,
        },
      }}
      loggerConfig={{
        logMessage: (message, level) => {
          switch (level) {
            case 'info':
              logger.info(message);
              break;
            case 'warn':
              logger.warn(message);
              break;
            case 'error':
              logger.error(message);
              break;
            case 'debug':
              logger.debug(message);
              break;
          }
        },
      }}
      supportedTheme={{
        web: { light: webLightTheme, dark: webDarkTheme },
        default: 'light',
      }}
    >
      <App />
    </HandyFluentUiProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
