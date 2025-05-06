import React, { useEffect } from 'react';

import languageEn from './i18n/en/language.json';
import languageZhHant from './i18n/zhHant/language.json';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Main } from './Main';
import { useAtomValue } from 'jotai';
import { ThemedAppProvider } from './contexts/Theme';
import { PageElementNavigationProvider } from './contexts/PageElementNavigation';
import { authenticationAtom } from './states/authentication';
import { FormDirtyProvider } from './contexts/FormDirty';
import { traceManager } from './utils/trace-manager';
import { DialogProvider } from './providers/dialog-provider';
import { MessageProvider } from './providers/message-provider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthenticationContainer } from './pages/authentication/authentication-container';
import { TimezoneProvider } from './providers/timezone-provider';

i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: languageEn },
    zhHant: { translation: languageZhHant },
  },
});

const App: React.FC = () => {
  const authenticationState = useAtomValue(authenticationAtom);

  useEffect(() => {
    if (authenticationState.login === undefined) {
      traceManager.newTrace();
    }
  }, [authenticationState.login]);
  return (
    <ThemedAppProvider>
      <PageElementNavigationProvider>
        <TimezoneProvider>
          <MessageProvider>
            <DialogProvider>
              <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
                {authenticationState.login ? (
                  <FormDirtyProvider>
                    <Main />
                  </FormDirtyProvider>
                ) : (
                  <AuthenticationContainer />
                )}
              </GoogleOAuthProvider>
            </DialogProvider>
          </MessageProvider>
        </TimezoneProvider>
      </PageElementNavigationProvider>
    </ThemedAppProvider>
  );
};

export default App;
