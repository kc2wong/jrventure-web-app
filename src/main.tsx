import { webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { initTrace, logger } from '@util/logger';
import { HandyFluentUiProvider } from 'handy-fluentui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './i18n';
import './index.css';
import App from './app';

initTrace();

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
