import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import zhHans from './locales/zh-Hans';
import zhHant from './locales/zh-Hant';

export const defaultNS = 'translation';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-Hant': { translation: zhHant },
    'zh-Hans': { translation: zhHans },
  },
  fallbackLng: 'en',
  detection: {
    order: ['navigator'],
    convertDetectedLanguage: (lng: string) => {
      const lower = lng.toLowerCase();

      if (lower.startsWith('en')) {return 'en';}
      if (lower === 'zh-hk' || lower === 'zh-tw') {return 'zh-Hant';}
      if (lower.startsWith('zh')) {return 'zh-Hans';}

      return 'en';
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
